# CafeCode

Google Maps tells you where cafes are. We tell you if you can actually work from them.

A crowdsourced work-from-cafe tracker for Bangalore. No login, no ads — just honest reviews from fellow remote workers.

## What it tracks

- WiFi speed & reliability
- Power outlet availability
- Noise levels
- Seating comfort
- Long-stay friendliness
- Coffee price range

## Stack

**Frontend:** Next.js · TypeScript · Tailwind CSS · shadcn/ui · Leaflet

**Backend:** FastAPI · PostgreSQL · SQLAlchemy

## Running locally

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Requires a local PostgreSQL database named "cafecode"
uvicorn app.main:app --reload --port 8005
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `localhost:3005`, backend on `localhost:8005`.

## License

MIT
