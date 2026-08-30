from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=List[schemas.ServiceOut])
def list_services(db: Session = Depends(get_db)):
    """Public: List all active services."""
    return db.query(models.Service).filter(models.Service.is_active == True).all()


@router.get("/all", response_model=List[schemas.ServiceOut])
def list_all_services(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin: List all services (active + inactive)."""
    return db.query(models.Service).all()


@router.post("", response_model=schemas.ServiceOut, status_code=201)
def create_service(
    payload: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    service = models.Service(**payload.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=schemas.ServiceOut)
def update_service(
    service_id: str,
    payload: schemas.ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=204)
def delete_service(
    service_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
