import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import cafes, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="CafeCode API", lifespan=lifespan)

# CORS: allow frontend origin (local dev + production)
allowed_origins = os.environ.get(
    "ALLOWED_ORIGINS", "http://localhost:3005"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cafes.router)
app.include_router(reports.router)


@app.get("/health")
def health():
    return {"status": "ok"}
