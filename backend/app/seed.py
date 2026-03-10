"""
Seed script for CafeCode database.
Run with: python -m app.seed
"""

from app.database import SessionLocal, engine, Base
from app.models import Cafe, Report


CAFES = [
    {
        "name": "Third Wave Coffee, Koramangala",
        "area": "Koramangala",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "google_maps_link": "https://maps.google.com/?q=12.9352,77.6245",
        "reports": [
            {
                "wifi_speed_mbps": 45.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "moderate",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Solid spot for deep work. Gets busy after 4pm.",
                "submitted_by": "arjun",
            },
            {
                "wifi_speed_mbps": 38.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "moderate",
                "seating_comfort": "okay",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Good wifi, decent seating upstairs.",
                "submitted_by": "priya",
            },
        ],
    },
    {
        "name": "Third Wave Coffee, Indiranagar",
        "area": "Indiranagar",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "google_maps_link": "https://maps.google.com/?q=12.9784,77.6408",
        "reports": [
            {
                "wifi_speed_mbps": 50.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "moderate",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Best TWC outlet for remote work. Spacious.",
                "submitted_by": "karthik",
            },
        ],
    },
    {
        "name": "Dialogues Cafe, Koramangala",
        "area": "Koramangala",
        "latitude": 12.9343,
        "longitude": 77.6265,
        "google_maps_link": "https://maps.google.com/?q=12.9343,77.6265",
        "reports": [
            {
                "wifi_speed_mbps": 30.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Great vibes, quiet reading/work space. Social enterprise cafe.",
                "submitted_by": "meera",
            },
            {
                "wifi_speed_mbps": 25.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "budget",
                "notes": "Love this place. Affordable and peaceful.",
                "submitted_by": "rahul",
            },
        ],
    },
    {
        "name": "Matteo Coffea, Church Street",
        "area": "Church Street",
        "latitude": 12.9756,
        "longitude": 77.6071,
        "google_maps_link": "https://maps.google.com/?q=12.9756,77.6071",
        "reports": [
            {
                "wifi_speed_mbps": 20.0,
                "wifi_reliable": False,
                "power_outlets": "few",
                "noise_level": "moderate",
                "seating_comfort": "great",
                "long_stay_friendly": False,
                "coffee_price_range": "premium",
                "notes": "Beautiful space but wifi drops. Better for meetings than deep work.",
                "submitted_by": "sanya",
            },
        ],
    },
    {
        "name": "Blue Tokai, Indiranagar",
        "area": "Indiranagar",
        "latitude": 12.9716,
        "longitude": 77.6412,
        "google_maps_link": "https://maps.google.com/?q=12.9716,77.6412",
        "reports": [
            {
                "wifi_speed_mbps": 40.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "moderate",
                "seating_comfort": "okay",
                "long_stay_friendly": True,
                "coffee_price_range": "premium",
                "notes": "Great coffee, reliable wifi. A bit pricey.",
                "submitted_by": "dev",
            },
            {
                "wifi_speed_mbps": 42.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "loud",
                "seating_comfort": "okay",
                "long_stay_friendly": True,
                "coffee_price_range": "premium",
                "notes": "Gets noisy on weekends. Weekday mornings are perfect.",
                "submitted_by": "ananya",
            },
        ],
    },
    {
        "name": "Blue Tokai, Koramangala",
        "area": "Koramangala",
        "latitude": 12.9340,
        "longitude": 77.6230,
        "google_maps_link": "https://maps.google.com/?q=12.9340,77.6230",
        "reports": [
            {
                "wifi_speed_mbps": 35.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "moderate",
                "seating_comfort": "okay",
                "long_stay_friendly": True,
                "coffee_price_range": "premium",
                "notes": "Smaller outlet, fewer power points but wifi is solid.",
                "submitted_by": "vikram",
            },
        ],
    },
    {
        "name": "Hatti Kaapi, JP Nagar",
        "area": "JP Nagar",
        "latitude": 12.9063,
        "longitude": 77.5857,
        "google_maps_link": "https://maps.google.com/?q=12.9063,77.5857",
        "reports": [
            {
                "wifi_speed_mbps": 10.0,
                "wifi_reliable": False,
                "power_outlets": "none",
                "noise_level": "loud",
                "seating_comfort": "bad",
                "long_stay_friendly": False,
                "coffee_price_range": "budget",
                "notes": "Amazing filter coffee but not a work spot. Quick break only.",
                "submitted_by": "suresh",
            },
        ],
    },
    {
        "name": "Ants Cafe, Koramangala",
        "area": "Koramangala",
        "latitude": 12.9355,
        "longitude": 77.6120,
        "google_maps_link": "https://maps.google.com/?q=12.9355,77.6120",
        "reports": [
            {
                "wifi_speed_mbps": 55.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Designed for coworking. Best wifi I've found in a cafe.",
                "submitted_by": "nikhil",
            },
            {
                "wifi_speed_mbps": 48.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Basically a coworking space that serves coffee. Love it.",
                "submitted_by": "sneha",
            },
        ],
    },
    {
        "name": "Starbucks, MG Road",
        "area": "MG Road",
        "latitude": 12.9756,
        "longitude": 77.6068,
        "google_maps_link": "https://maps.google.com/?q=12.9756,77.6068",
        "reports": [
            {
                "wifi_speed_mbps": 25.0,
                "wifi_reliable": False,
                "power_outlets": "few",
                "noise_level": "loud",
                "seating_comfort": "okay",
                "long_stay_friendly": False,
                "coffee_price_range": "premium",
                "notes": "Wifi requires login every 30 min. Too crowded for real work.",
                "submitted_by": "aditya",
            },
        ],
    },
    {
        "name": "Cafe Coffee Day, Whitefield",
        "area": "Whitefield",
        "latitude": 12.9698,
        "longitude": 77.7500,
        "google_maps_link": "https://maps.google.com/?q=12.9698,77.7500",
        "reports": [
            {
                "wifi_speed_mbps": 15.0,
                "wifi_reliable": False,
                "power_outlets": "few",
                "noise_level": "moderate",
                "seating_comfort": "okay",
                "long_stay_friendly": False,
                "coffee_price_range": "budget",
                "notes": "Decent for a quick call but wifi is unreliable.",
                "submitted_by": "pooja",
            },
            {
                "wifi_speed_mbps": 18.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "moderate",
                "seating_comfort": "okay",
                "long_stay_friendly": False,
                "coffee_price_range": "budget",
                "notes": "Hit or miss with wifi. Cheap coffee though.",
                "submitted_by": "rohan",
            },
        ],
    },
    {
        "name": "Araku Coffee, HSR Layout",
        "area": "HSR Layout",
        "latitude": 12.9116,
        "longitude": 77.6389,
        "google_maps_link": "https://maps.google.com/?q=12.9116,77.6389",
        "reports": [
            {
                "wifi_speed_mbps": 30.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Hidden gem. Great single origin coffee and peaceful atmosphere.",
                "submitted_by": "tanya",
            },
        ],
    },
    {
        "name": "Dyu Art Cafe, Koramangala",
        "area": "Koramangala",
        "latitude": 12.9410,
        "longitude": 77.6227,
        "google_maps_link": "https://maps.google.com/?q=12.9410,77.6227",
        "reports": [
            {
                "wifi_speed_mbps": 20.0,
                "wifi_reliable": True,
                "power_outlets": "none",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Beautiful artsy cafe. No power outlets though — bring a full battery.",
                "submitted_by": "ishita",
            },
            {
                "wifi_speed_mbps": 22.0,
                "wifi_reliable": False,
                "power_outlets": "none",
                "noise_level": "quiet",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Wifi was spotty on my visit. Great ambiance regardless.",
                "submitted_by": "amit",
            },
        ],
    },
    {
        "name": "Corridor Seven, Indiranagar",
        "area": "Indiranagar",
        "latitude": 12.9785,
        "longitude": 77.6393,
        "google_maps_link": "https://maps.google.com/?q=12.9785,77.6393",
        "reports": [
            {
                "wifi_speed_mbps": 35.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "moderate",
                "seating_comfort": "okay",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Good work-friendly cafe. Lots of freelancers here.",
                "submitted_by": "ravi",
            },
        ],
    },
    {
        "name": "The Hole in the Wall Cafe, Koramangala",
        "area": "Koramangala",
        "latitude": 12.9348,
        "longitude": 77.6148,
        "google_maps_link": "https://maps.google.com/?q=12.9348,77.6148",
        "reports": [
            {
                "wifi_speed_mbps": 28.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "loud",
                "seating_comfort": "okay",
                "long_stay_friendly": False,
                "coffee_price_range": "mid",
                "notes": "Popular brunch spot. Too noisy for focused work.",
                "submitted_by": "divya",
            },
            {
                "wifi_speed_mbps": 30.0,
                "wifi_reliable": True,
                "power_outlets": "few",
                "noise_level": "loud",
                "seating_comfort": "okay",
                "long_stay_friendly": False,
                "coffee_price_range": "mid",
                "notes": "Great food, not great for laptops. Staff gives looks after 2hrs.",
                "submitted_by": "sameer",
            },
        ],
    },
    {
        "name": "Brewhaha, MG Road",
        "area": "MG Road",
        "latitude": 12.9753,
        "longitude": 77.6056,
        "google_maps_link": "https://maps.google.com/?q=12.9753,77.6056",
        "reports": [
            {
                "wifi_speed_mbps": 32.0,
                "wifi_reliable": True,
                "power_outlets": "plenty",
                "noise_level": "moderate",
                "seating_comfort": "great",
                "long_stay_friendly": True,
                "coffee_price_range": "mid",
                "notes": "Underrated spot. Good wifi, comfy chairs, not too crowded.",
                "submitted_by": "naina",
            },
        ],
    },
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing_count = db.query(Cafe).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} cafes. Skipping seed.")
            return

        print("Seeding CafeCode database...")

        for cafe_data in CAFES:
            reports_data = cafe_data.pop("reports")
            cafe = Cafe(**cafe_data)
            db.add(cafe)
            db.flush()

            for report_data in reports_data:
                report = Report(cafe_id=cafe.id, **report_data)
                db.add(report)

            # Restore reports key for idempotency if run again in same process
            cafe_data["reports"] = reports_data

        db.commit()
        print(f"Seeded {len(CAFES)} cafes with reports.")

    finally:
        db.close()


if __name__ == "__main__":
    from app.database import Base, engine

    seed()
