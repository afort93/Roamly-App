# Roamly Frontend Architecture Plan

## Tech Stack
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet + React-Leaflet
- **Icons:** Lucide React
- **State Management:** Zustand (lightweight)
- **Routing:** React Router

## Page Structure
1. **Landing Page (`/`)**
   - Hero: "Enter a zip code, explore the best around you".
   - Large Zip Code input with search button.
2. **Itinerary Page (`/itinerary/:zip`)**
   - Filters: Category, Distance, Cost, Kid-friendly.
   - Day Selection: Tabs for multiple days.
   - List/Map Toggle: Switch between list of cards and Leaflet map.
   - Place Card: Vertical cards with image, rating, cost, distance, and duration.
3. **Place Detail (Modal/Overlay)**
   - Detailed info: photos, description, reviews.
4. **Account Page (`/account`)**
   - User profile and saved itineraries.

## Component Tree
- `App`
  - `Navbar`
  - `Routes`
    - `HomePage`
      - `Hero`
      - `ZipSearchBar`
    - `ItineraryPage`
      - `FilterPanel`
      - `DaySelector`
      - `PlaceCard`
      - `LeafletMap`
    - `AccountPage`
  - `Footer`

## Data Model (Matches Backend API)
```json
{
  "zip_code": "90210",
  "days": [{
    "day": 1,
    "places": [{
      "id": "place_1",
      "name": "The Polo Lounge",
      "category": "restaurant",
      "rating": 4.5,
      "price_level": 3,
      "lat": 34.0901, "lng": -118.4065,
      "distance_mi": 1.2,
      "typical_duration_min": 90,
      "description": "Iconic Beverly Hills restaurant...",
      "image_url": ""
    }]
  }]
}
```

## State Management (Zustand)
- `useItineraryStore`: Stores the current zip code, fetched itinerary data, and filter preferences.

## Responsive Strategy
- Mobile-first design using Tailwind's `sm:`, `md:`, `lg:` prefixes.
- On mobile: Stacked layout, list view primary, map toggle.
- On desktop: Side-by-side list and map.
