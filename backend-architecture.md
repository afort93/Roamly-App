# ZipTrip Backend Architecture

## Tech Stack
- **Framework:** Python FastAPI
- **Database:** SQLite (accessed via `team-db` CLI for shared state across the team).
- **Authentication:** JWT (JSON Web Tokens) for stateless user sessions.
- **Geocoding:** `geopy` with OpenStreetMap (Nominatim) or static zip code mapping.
- **Payments:** Stripe API (Sandbox mode) for premium subscriptions.

## Data Model (Tables in `team-db`)

### `users`
- `id`: TEXT (UUID)
- `email`: TEXT (Unique)
- `password_hash`: TEXT
- `is_premium`: INTEGER (0 or 1)
- `stripe_customer_id`: TEXT
- `created_at`: TIMESTAMP

### `places` (POIs)
- `id`: TEXT (Primary Key)
- `name`: TEXT
- `category`: TEXT (food, attraction, outdoors, shopping)
- `rating`: REAL (0.0 to 5.0)
- `price_level`: INTEGER (1 to 4)
- `lat`: REAL
- `lng`: REAL
- `address`: TEXT
- `typical_duration`: INTEGER (Typical visit duration in minutes)

### `itineraries`
- `id`: TEXT (UUID)
- `user_id`: TEXT (Foreign Key)
- `zip_code`: TEXT
- `name`: TEXT
- `created_at`: TIMESTAMP

### `itinerary_items`
- `id`: TEXT (UUID)
- `itinerary_id`: TEXT (Foreign Key)
- `place_id`: TEXT (Foreign Key)
- `day_number`: INTEGER
- `slot_number`: INTEGER

## API Endpoints

### Auth
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate and receive a JWT.

### Search & Itineraries
- `POST /api/search`: 
  - Input: `{ "zip_code": "10001", "days": 3, "filters": ["food", "outdoors"] }`
  - Output: Ranked day-by-day itinerary.
- `GET /api/places/:id`: Get detailed info for a specific place.
- `GET /api/itineraries`: List user's saved itineraries.
- `POST /api/itineraries/save`: Save a generated itinerary.

### Subscriptions
- `POST /api/subscribe/checkout`: Create a Stripe session for premium upgrade.
- `POST /api/subscribe/webhook`: Handle Stripe payment success events.

## Ranking Algorithm
The core value of ZipTrip is the ranking of places. The score is a weighted blend:
1. **Review Score (40%)**: Normalized `rating / 5.0`.
2. **Cost Reasonableness (20%)**: Inverse price level. Lower price = higher score for budget travelers.
3. **Duration Fit (20%)**: Places that fit well into a 2-3 hour window for activities or 1 hour for food.
4. **Distance (20%)**: Proximity to the center of the provided zip code.

`Final Score = (RatingScore * 0.4) + (PriceScore * 0.2) + (DurationScore * 0.2) + (DistanceScore * 0.2)`

## Seed Data Strategy
We will maintain a `seed_data.py` script or an internal endpoint `/api/seed` that populates `team-db` with 20+ diverse places in major areas (e.g., NYC, LA) to demonstrate the ranking across categories:
- **Food**: 10 places (varying price levels)
- **Attractions**: 5 places (museums, monuments)
- **Outdoors**: 3 places (parks)
- **Shopping**: 2 places
