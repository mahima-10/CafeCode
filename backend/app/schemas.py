from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.models import CoffeePriceRange, NoiseLevel, PowerOutlets, SeatingComfort


# --- Cafe schemas ---


class CafeCreate(BaseModel):
    name: str
    area: str
    latitude: float
    longitude: float
    google_maps_link: Optional[str] = None


class CafeBase(BaseModel):
    id: UUID
    name: str
    area: str
    latitude: float
    longitude: float
    google_maps_link: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CafeAggregated(CafeBase):
    avg_wifi_speed: Optional[float] = None
    wifi_reliable_pct: Optional[float] = None
    most_common_power_outlets: Optional[str] = None
    most_common_noise_level: Optional[str] = None
    most_common_seating_comfort: Optional[str] = None
    long_stay_friendly_pct: Optional[float] = None
    most_common_price_range: Optional[str] = None
    report_count: int = 0
    overall_vibe: str = "not_ideal"


# --- Report schemas ---


class ReportCreate(BaseModel):
    wifi_speed_mbps: Optional[float] = None
    wifi_reliable: Optional[bool] = None
    power_outlets: Optional[PowerOutlets] = None
    noise_level: Optional[NoiseLevel] = None
    seating_comfort: Optional[SeatingComfort] = None
    long_stay_friendly: Optional[bool] = None
    coffee_price_range: Optional[CoffeePriceRange] = None
    notes: Optional[str] = None
    submitted_by: Optional[str] = None


class ReportOut(BaseModel):
    id: UUID
    cafe_id: UUID
    wifi_speed_mbps: Optional[float] = None
    wifi_reliable: Optional[bool] = None
    power_outlets: Optional[str] = None
    noise_level: Optional[str] = None
    seating_comfort: Optional[str] = None
    long_stay_friendly: Optional[bool] = None
    coffee_price_range: Optional[str] = None
    notes: Optional[str] = None
    submitted_by: Optional[str] = None
    flag_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class CafeDetail(CafeBase):
    reports: list[ReportOut] = []
