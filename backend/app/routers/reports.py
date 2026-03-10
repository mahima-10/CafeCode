from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Cafe, Report
from app.rate_limit import rate_limit
from app.schemas import ReportCreate, ReportOut

router = APIRouter(prefix="/api", tags=["reports"])


@router.post("/cafes/{cafe_id}/reports", response_model=ReportOut, status_code=201, dependencies=[Depends(rate_limit)])
def create_report(cafe_id: UUID, payload: ReportCreate, db: Session = Depends(get_db)):
    cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
    if not cafe:
        raise HTTPException(status_code=404, detail="Cafe not found")

    report = Report(
        cafe_id=cafe_id,
        wifi_speed_mbps=payload.wifi_speed_mbps,
        wifi_reliable=payload.wifi_reliable,
        power_outlets=payload.power_outlets.value if payload.power_outlets else None,
        noise_level=payload.noise_level.value if payload.noise_level else None,
        seating_comfort=payload.seating_comfort.value if payload.seating_comfort else None,
        long_stay_friendly=payload.long_stay_friendly,
        coffee_price_range=payload.coffee_price_range.value if payload.coffee_price_range else None,
        notes=payload.notes,
        submitted_by=payload.submitted_by,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.delete("/reports/{report_id}", status_code=204)
def delete_report(report_id: UUID, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()


@router.post("/reports/{report_id}/flag", response_model=ReportOut)
def flag_report(report_id: UUID, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.flag_count = (report.flag_count or 0) + 1
    db.commit()
    db.refresh(report)
    return report
