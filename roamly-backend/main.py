import sqlite3
import uuid
import math
import time
import stripe
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext

# Configuration
SECRET_KEY = "roamly-secret-key-change-this-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
DATABASE_PATH = "roamly.db"

# Stripe Config (Stub)
stripe.api_key = "sk_test_placeholder"
STRIPE_WEBHOOK_SECRET = "whsec_placeholder"

app = FastAPI(title="Roamly API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing (using sha256_crypt for compatibility)
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# Database Setup
def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            is_premium INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS places (
            id TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            rating REAL,
            price_level INTEGER,
            lat REAL,
            lng REAL,
            address TEXT,
            typical_duration INTEGER,
            kid_friendly INTEGER DEFAULT 0
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS itineraries (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            zip_code TEXT,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS itinerary_items (
            id TEXT PRIMARY KEY,
            itinerary_id TEXT,
            place_id TEXT,
            day_number INTEGER,
            slot_number INTEGER,
            FOREIGN KEY (itinerary_id) REFERENCES itineraries(id),
            FOREIGN KEY (place_id) REFERENCES places(id)
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Models
class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class SearchRequest(BaseModel):
    zip_code: str
    days: int = 1
    filters: Optional[List[str]] = None

class CheckoutRequest(BaseModel):
    success_url: str
    cancel_url: str

class Place(BaseModel):
    id: str
    name: str
    category: str
    rating: float
    price_level: int
    lat: float
    lng: float
    address: str
    typical_duration: int
    kid_friendly: int = 0

class ItineraryItemInput(BaseModel):
    place_id: str
    day: int
    slot: int

class SaveItineraryRequest(BaseModel):
    zip_code: str
    name: str
    items: List[ItineraryItemInput]

# Auth Helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        if user_id is None:
            return None
        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        conn.close()
        return dict(user) if user else None
    except JWTError:
        return None

# Ranking Algorithm
def calculate_score(place: Place, center_lat: float, center_lng: float) -> float:
    rating_score = place.rating / 5.0
    price_score = (5 - place.price_level) / 4.0
    dist = math.sqrt((place.lat - center_lat)**2 + (place.lng - center_lng)**2)
    distance_score = 1.0 / (1.0 + dist * 50)
    duration_score = max(0, 1.0 - abs(90 - place.typical_duration) / 90.0)
    return (rating_score * 0.4) + (price_score * 0.2) + (distance_score * 0.2) + (duration_score * 0.2)

# Static Geocoding Map for MVP
ZIP_MAP = {
    "10001": (40.7501, -73.9996), # NYC
    "90210": (34.0736, -118.4004), # Beverly Hills
    "60601": (41.8858, -87.6229), # Chicago
    "33139": (25.7797, -80.1300), # Miami Beach
}

# Endpoints
@app.post("/api/auth/register")
async def register(user: UserRegister):
    hashed_pwd = pwd_context.hash(user.password)
    user_id = str(uuid.uuid4())
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (id, email, password_hash, is_premium) VALUES (?, ?, ?, 0)", 
                     (user_id, user.email, hashed_pwd))
        conn.commit()
        return {"id": user_id, "email": user.email}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists")
    finally:
        conn.close()

@app.post("/api/auth/login")
async def login(user: UserLogin):
    conn = get_db()
    db_user = conn.execute("SELECT * FROM users WHERE email = ?", (user.email,)).fetchone()
    conn.close()
    
    if not db_user or not pwd_context.verify(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": db_user["email"], "id": db_user["id"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/itinerary")
async def get_itinerary(
    zip_code: str, 
    days: int = 1, 
    categories: Optional[str] = None,
    max_price: Optional[int] = None,
    kid_friendly: Optional[bool] = None,
    user = Depends(get_current_user)
):
    # 1. Geocoding
    center_lat, center_lng = ZIP_MAP.get(zip_code, (40.7128, -74.0060)) # Default NYC

    # 2. Premium Check
    is_premium = user["is_premium"] if user else False
    max_days = days if (is_premium or days == 1) else 1

    # 3. Fetch & Filter
    conn = get_db()
    places_data = conn.execute("SELECT * FROM places").fetchall()
    conn.close()
    
    places = [Place(**dict(p)) for p in places_data]
    
    # Apply Filters
    if categories:
        cat_list = [c.strip().lower() for c in categories.split(",")]
        places = [p for p in places if p.category.lower() in cat_list]
    
    if max_price is not None:
        places = [p for p in places if p.price_level <= max_price]
        
    if kid_friendly:
        places = [p for p in places if p.kid_friendly == 1]

    # 4. Rank
    scored_places = [(p, calculate_score(p, center_lat, center_lng)) for p in places]
    scored_places.sort(key=lambda x: x[1], reverse=True)
    
    # 5. Construct Itinerary
    selected = [p for p, score in scored_places[:max_days * 3]]
    itinerary = []
    for d in range(max_days):
        day_items = selected[d*3 : (d+1)*3]
        if day_items:
            itinerary.append({"day": d+1, "items": day_items})
            
    return {
        "zip_code": zip_code,
        "center": {"lat": center_lat, "lng": center_lng},
        "days": max_days,
        "is_premium": is_premium,
        "itinerary": itinerary
    }

@app.post("/api/subscribe/checkout")
async def create_checkout_session(req: CheckoutRequest):
    # Stub for MVP
    return {"id": "stub_session_id", "url": req.success_url}

@app.get("/api/places/{place_id}")
async def get_place(place_id: str):
    conn = get_db()
    place = conn.execute("SELECT * FROM places WHERE id = ?", (place_id,)).fetchone()
    conn.close()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return dict(place)

@app.post("/api/itineraries/save")
async def save_itinerary(req: SaveItineraryRequest, user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    itinerary_id = str(uuid.uuid4())
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO itineraries (id, user_id, zip_code, name) VALUES (?, ?, ?, ?)",
            (itinerary_id, user["id"], req.zip_code, req.name)
        )
        for item in req.items:
            item_id = str(uuid.uuid4())
            conn.execute(
                "INSERT INTO itinerary_items (id, itinerary_id, place_id, day_number, slot_number) VALUES (?, ?, ?, ?, ?)",
                (item_id, itinerary_id, item.place_id, item.day, item.slot)
            )
        conn.commit()
        return {"id": itinerary_id, "message": "Itinerary saved successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/itineraries")
async def list_itineraries(user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conn = get_db()
    itineraries = conn.execute(
        "SELECT * FROM itineraries WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],)
    ).fetchall()
    
    result = []
    for it in itineraries:
        it_dict = dict(it)
        items = conn.execute(
            """
            SELECT ii.*, p.name, p.category, p.rating, p.price_level, p.lat, p.lng, p.address 
            FROM itinerary_items ii
            JOIN places p ON ii.place_id = p.id
            WHERE ii.itinerary_id = ?
            ORDER BY ii.day_number, ii.slot_number
            """,
            (it["id"],)
        ).fetchall()
        it_dict["items"] = [dict(i) for i in items]
        result.append(it_dict)
    
    conn.close()
    return result

@app.delete("/api/itineraries/{id}")
async def delete_itinerary(id: str, user = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conn = get_db()
    itinerary = conn.execute(
        "SELECT * FROM itineraries WHERE id = ? AND user_id = ?",
        (id, user["id"])
    ).fetchone()
    
    if not itinerary:
        conn.close()
        raise HTTPException(status_code=404, detail="Itinerary not found")
    
    conn.execute("DELETE FROM itinerary_items WHERE itinerary_id = ?", (id,))
    conn.execute("DELETE FROM itineraries WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Itinerary deleted successfully"}

@app.post("/api/seed")
async def seed():
    mock_places = [
        # NYC
        ("f1", "Joe's Pizza", "food", 4.5, 1, 40.7305, -74.0021, "7 Carmine St, NYC", 30, 1),
        ("f2", "Katz's Delicatessen", "food", 4.5, 2, 40.7222, -73.9874, "205 E Houston St, NYC", 60, 1),
        ("f3", "Le Bernardin", "food", 4.8, 4, 40.7615, -73.9818, "155 W 51st St, NYC", 120, 0),
        ("f4", "Shake Shack", "food", 4.3, 1, 40.7415, -73.9882, "Madison Square Park, NYC", 45, 1),
        ("f5", "Peter Luger", "food", 4.4, 4, 40.7099, -73.9625, "178 Broadway, Brooklyn", 90, 0),
        ("f6", "Ippudo NY", "food", 4.6, 2, 40.7309, -73.9903, "65 4th Ave, NYC", 60, 0),
        ("f7", "Magnolia Bakery", "food", 4.2, 2, 40.7359, -74.0050, "401 Bleecker St, NYC", 20, 1),
        ("f8", "Xi'an Famous Foods", "food", 4.5, 1, 40.7498, -73.9838, "24 W 45th St, NYC", 30, 0),
        ("f9", "Carbone", "food", 4.6, 4, 40.7281, -74.0002, "181 Thompson St, NYC", 120, 0),
        ("f10", "Momofuku Noodle Bar", "food", 4.4, 2, 40.7300, -73.9848, "171 1st Ave, NYC", 60, 0),
        ("a1", "Empire State Building", "attraction", 4.7, 3, 40.7484, -73.9857, "20 W 34th St, NYC", 90, 1),
        ("a2", "Statue of Liberty", "attraction", 4.6, 2, 40.6892, -74.0445, "Liberty Island, NYC", 150, 1),
        ("a3", "Top of the Rock", "attraction", 4.8, 3, 40.7587, -73.9787, "30 Rockefeller Plaza, NYC", 90, 1),
        ("a4", "Brooklyn Bridge", "attraction", 4.8, 1, 40.7061, -73.9969, "Brooklyn Bridge, NYC", 60, 1),
        ("a5", "Times Square", "attraction", 4.2, 1, 40.7580, -73.9855, "Times Square, NYC", 45, 1),
        ("o1", "Central Park", "outdoors", 4.8, 1, 40.7850, -73.9682, "Central Park, NYC", 120, 1),
        ("o2", "High Line", "outdoors", 4.7, 1, 40.7480, -74.0048, "High Line, NYC", 90, 1),
        ("o3", "The Battery", "outdoors", 4.5, 1, 40.7033, -74.0170, "State St, NYC", 60, 1),
        ("s1", "Macy's Herald Square", "shopping", 4.3, 2, 40.7508, -73.9889, "151 W 34th St, NYC", 120, 1),
        ("s2", "Chelsea Market", "shopping", 4.6, 2, 40.7420, -74.0062, "75 9th Ave, NYC", 90, 1),
        
        # Beverly Hills (90210)
        ("bh1", "Rodeo Drive", "shopping", 4.7, 4, 34.0697, -118.4036, "Rodeo Dr, Beverly Hills, CA", 120, 0),
        ("bh2", "Beverly Gardens Park", "outdoors", 4.6, 1, 34.0765, -118.4030, "9439 Santa Monica Blvd, Beverly Hills, CA", 60, 1),
        ("bh3", "Spago", "food", 4.5, 4, 34.0673, -118.3976, "176 N Canon Dr, Beverly Hills, CA", 120, 0),
        ("bh4", "Greystone Mansion", "attraction", 4.8, 2, 34.0922, -118.4014, "905 Loma Vista Dr, Beverly Hills, CA", 90, 1),
        ("bh5", "Sprinkles Cupcakes", "food", 4.4, 2, 34.0683, -118.4055, "9635 Little Santa Monica Blvd, Beverly Hills, CA", 30, 1),
        
        # Chicago (60601)
        ("chi1", "Millennium Park", "outdoors", 4.8, 1, 41.8826, -87.6226, "201 E Randolph St, Chicago, IL", 120, 1),
        ("chi2", "Art Institute of Chicago", "attraction", 4.9, 3, 41.8796, -87.6237, "111 S Michigan Ave, Chicago, IL", 180, 1),
        ("chi3", "Giordano's", "food", 4.5, 2, 41.8851, -87.6247, "130 E Randolph St, Chicago, IL", 90, 1),
        ("chi4", "The Magnificent Mile", "shopping", 4.7, 3, 41.8948, -87.6242, "N Michigan Ave, Chicago, IL", 150, 1),
        ("chi5", "Willis Tower", "attraction", 4.6, 3, 41.8789, -87.6359, "233 S Wacker Dr, Chicago, IL", 90, 1),
        
        # Miami Beach (33139)
        ("mia1", "South Beach", "outdoors", 4.7, 1, 25.7826, -80.1285, "Ocean Dr, Miami Beach, FL", 180, 1),
        ("mia2", "Lincoln Road", "shopping", 4.5, 3, 25.7906, -80.1384, "Lincoln Rd, Miami Beach, FL", 120, 1),
        ("mia3", "Joe's Stone Crab", "food", 4.6, 4, 25.7680, -80.1351, "11 Washington Ave, Miami Beach, FL", 120, 0),
        ("mia4", "Ocean Drive", "attraction", 4.4, 2, 25.7813, -80.1300, "Ocean Dr, Miami Beach, FL", 60, 1),
        ("mia5", "Art Deco Historic District", "attraction", 4.6, 2, 25.7818, -80.1325, "1001 Ocean Dr, Miami Beach, FL", 90, 1),
    ]
    conn = get_db()
    for p in mock_places:
        conn.execute("INSERT OR REPLACE INTO places VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", p)
    conn.commit()
    conn.close()
    return {"message": "35+ seed places inserted into roamly.db"}

import os

# Serve production frontend build - catch-all SPA route
# Must be LAST so API routes take priority
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "roamly-frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="frontend_assets")
    
    from fastapi.responses import FileResponse
    @app.api_route("/{path:path}", methods=["GET"])
    async def serve_frontend(path: str):
        """Catch-all route: serves frontend for non-API paths (SPA support)."""
        if path.startswith("api/"):
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        return FileResponse(os.path.join(frontend_dist, "index.html"))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
