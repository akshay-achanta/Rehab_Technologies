from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
import random
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/requests", tags=["requests"])


def generate_request_id() -> str:
    year = datetime.utcnow().year
    num = random.randint(1000, 9999)
    return f"REQ-{year}-{num}"


@router.post("", response_model=schemas.ServiceRequestOut, status_code=201)
def create_request(
    payload: schemas.ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    service = db.query(models.Service).filter(models.Service.id == payload.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    req_id = generate_request_id()
    # Ensure ID is unique
    while db.query(models.ServiceRequest).filter(models.ServiceRequest.id == req_id).first():
        req_id = generate_request_id()

    req = models.ServiceRequest(
        id=req_id,
        user_id=current_user.id,
        service_id=payload.service_id,
        property_type=payload.property_type,
        location=payload.location,
        preferred_date=payload.preferred_date,
        notes=payload.notes,
        status="submitted",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    
    # Load relationships
    return db.query(models.ServiceRequest).options(
        joinedload(models.ServiceRequest.service),
        joinedload(models.ServiceRequest.user),
    ).filter(models.ServiceRequest.id == req_id).first()


@router.get("/me", response_model=List[schemas.ServiceRequestOut])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.ServiceRequest)
        .options(
            joinedload(models.ServiceRequest.service),
            joinedload(models.ServiceRequest.user),
        )
        .filter(models.ServiceRequest.user_id == current_user.id)
        .order_by(models.ServiceRequest.created_at.desc())
        .all()
    )


@router.get("", response_model=List[schemas.ServiceRequestOut])
def get_all_requests(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    query = db.query(models.ServiceRequest).options(
        joinedload(models.ServiceRequest.service),
        joinedload(models.ServiceRequest.user),
    )
    if status:
        query = query.filter(models.ServiceRequest.status == status)
    return query.order_by(models.ServiceRequest.created_at.desc()).all()


@router.patch("/{request_id}/status", response_model=schemas.ServiceRequestOut)
def update_request_status(
    request_id: str,
    payload: schemas.StatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    valid_statuses = ["submitted", "assessed", "in_progress", "completed"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    req = db.query(models.ServiceRequest).filter(models.ServiceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = payload.status
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)

    return db.query(models.ServiceRequest).options(
        joinedload(models.ServiceRequest.service),
        joinedload(models.ServiceRequest.user),
    ).filter(models.ServiceRequest.id == request_id).first()
