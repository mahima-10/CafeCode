from collections import Counter
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cafe, Report
from app.rate_limit import rate_limit
from app.schemas import CafeAggregated, CafeCreate, CafeBase, CafeDetail, ReportOut

router = APIRouter(prefix="/api", tags=["cafes"])


def _most_common(values: list) -> Optional[str]:
    """Return the most common non-None value from a list."""
    filtered = [v for v in values if v is not None]
    if not filtered:
        return None
    counter = Counter(filtered)
    return counter.most_common(1)[0][0]


def _aggregate_cafe(cafe: Cafe) -> CafeAggregated:
    """Build aggregated scores for a cafe from its reports."""
    reports = cafe.reports
    report_count = len(reports)

    if report_count == 0:
        return CafeAggregated(
            id=cafe.id,
            name=cafe.name,
            area=cafe.area,
            latitude=cafe.latitude,
            longitude=cafe.longitude,
            google_maps_link=cafe.google_maps_link,
            created_at=cafe.created_at,
            report_count=0,
            overall_vibe="not_ideal",
        )

    # avg wifi speed
    wifi_speeds = [r.wifi_speed_mbps for r in reports if r.wifi_speed_mbps is not None]
    avg_wifi = round(sum(wifi_speeds) / len(wifi_speeds), 1) if wifi_speeds else None

    # wifi reliable pct
    wifi_rel = [r.wifi_reliable for r in reports if r.wifi_reliable is not None]
    wifi_reliable_pct = round(sum(wifi_rel) / len(wifi_rel) * 100, 1) if wifi_rel else None

    # long stay friendly pct
    lsf = [r.long_stay_friendly for r in reports if r.long_stay_friendly is not None]
    long_stay_pct = round(sum(lsf) / len(lsf) * 100, 1) if lsf else None

    # most common values
    most_power = _most_common([r.power_outlets for r in reports])
    most_noise = _most_common([r.noise_level for r in reports])
    most_seating = _most_common([r.seating_comfort for r in reports])
    most_price = _most_common([r.coffee_price_range for r in reports])

    # overall vibe
    wr = wifi_reliable_pct or 0
    ls = long_stay_pct or 0
    if wr > 60 and ls > 60:
        vibe = "great"
    elif wr > 40 or ls > 40:
        vibe = "okay"
    else:
        vibe = "not_ideal"

    return CafeAggregated(
        id=cafe.id,
        name=cafe.name,
        area=cafe.area,
        latitude=cafe.latitude,
        longitude=cafe.longitude,
        google_maps_link=cafe.google_maps_link,
        created_at=cafe.created_at,
        avg_wifi_speed=avg_wifi,
        wifi_reliable_pct=wifi_reliable_pct,
        most_common_power_outlets=most_power,
        most_common_noise_level=most_noise,
        most_common_seating_comfort=most_seating,
        long_stay_friendly_pct=long_stay_pct,
        most_common_price_range=most_price,
        report_count=report_count,
        overall_vibe=vibe,
    )


@router.get("/cafes", response_model=list[CafeAggregated])
def list_cafes(
    area: Optional[str] = Query(None),
    min_wifi_speed: Optional[float] = Query(None),
    power_outlets: Optional[str] = Query(None),
    noise_level: Optional[str] = Query(None),
    long_stay_friendly: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Cafe)

    if area:
        query = query.filter(Cafe.area.ilike(f"%{area}%"))

    cafes = query.order_by(Cafe.name).all()
    results = [_aggregate_cafe(c) for c in cafes]

    # Post-aggregation filters
    if min_wifi_speed is not None:
        results = [r for r in results if r.avg_wifi_speed is not None and r.avg_wifi_speed >= min_wifi_speed]

    if power_outlets is not None:
        results = [r for r in results if r.most_common_power_outlets == power_outlets]

    if noise_level is not None:
        results = [r for r in results if r.most_common_noise_level == noise_level]

    if long_stay_friendly is not None:
        if long_stay_friendly:
            results = [r for r in results if r.long_stay_friendly_pct is not None and r.long_stay_friendly_pct > 50]
        else:
            results = [r for r in results if r.long_stay_friendly_pct is None or r.long_stay_friendly_pct <= 50]

    return results


@router.get("/cafes/{cafe_id}", response_model=CafeDetail)
def get_cafe(cafe_id: UUID, db: Session = Depends(get_db)):
    cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
    if not cafe:
        raise HTTPException(status_code=404, detail="Cafe not found")

    # Filter out flagged reports (3+ flags) and sort most recent first
    sorted_reports = sorted(
        [r for r in cafe.reports if (r.flag_count or 0) < 3],
        key=lambda r: r.created_at,
        reverse=True,
    )

    return CafeDetail(
        id=cafe.id,
        name=cafe.name,
        area=cafe.area,
        latitude=cafe.latitude,
        longitude=cafe.longitude,
        google_maps_link=cafe.google_maps_link,
        created_at=cafe.created_at,
        reports=[ReportOut.model_validate(r) for r in sorted_reports],
    )


@router.post("/cafes", response_model=CafeBase, status_code=201, dependencies=[Depends(rate_limit)])
def create_cafe(payload: CafeCreate, db: Session = Depends(get_db)):
    cafe = Cafe(
        name=payload.name,
        area=payload.area,
        latitude=payload.latitude,
        longitude=payload.longitude,
        google_maps_link=payload.google_maps_link,
    )
    db.add(cafe)
    db.commit()
    db.refresh(cafe)
    return cafe


@router.get("/areas", response_model=list[str])
def list_areas(db: Session = Depends(get_db)):
    rows = db.query(Cafe.area).distinct().order_by(Cafe.area).all()
    return [r[0] for r in rows]
