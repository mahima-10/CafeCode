import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    VARCHAR,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class PowerOutlets(str, enum.Enum):
    none = "none"
    few = "few"
    plenty = "plenty"


class NoiseLevel(str, enum.Enum):
    quiet = "quiet"
    moderate = "moderate"
    loud = "loud"


class SeatingComfort(str, enum.Enum):
    bad = "bad"
    okay = "okay"
    great = "great"


class CoffeePriceRange(str, enum.Enum):
    budget = "budget"
    mid = "mid"
    premium = "premium"


class Cafe(Base):
    __tablename__ = "cafes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(VARCHAR, nullable=False)
    area = Column(VARCHAR, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    google_maps_link = Column(VARCHAR, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reports = relationship("Report", back_populates="cafe", cascade="all, delete-orphan")


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cafe_id = Column(UUID(as_uuid=True), ForeignKey("cafes.id"), nullable=False)
    wifi_speed_mbps = Column(Float, nullable=True)
    wifi_reliable = Column(Boolean, nullable=True)
    power_outlets = Column(VARCHAR, nullable=True)
    noise_level = Column(VARCHAR, nullable=True)
    seating_comfort = Column(VARCHAR, nullable=True)
    long_stay_friendly = Column(Boolean, nullable=True)
    coffee_price_range = Column(VARCHAR, nullable=True)
    notes = Column(Text, nullable=True)
    submitted_by = Column(VARCHAR, nullable=True)
    flag_count = Column(Integer, default=0, nullable=False, server_default="0")
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    cafe = relationship("Cafe", back_populates="reports")
