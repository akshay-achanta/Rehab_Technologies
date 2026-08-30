from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, require_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/admin", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_admin(
    payload: schemas.RegisterRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    if db.query(models.User).filter(models.User.mobile == payload.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    admin_user = models.User(
        name=payload.name,
        mobile=payload.mobile,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="admin",
    )
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    return admin_user

@router.delete("/admin/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    admin_user = db.query(models.User).filter(models.User.id == user_id, models.User.role == "admin").first()
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    # Optional: Prevent an admin from deleting themselves
    if str(admin_user.id) == str(current_user.id):
        raise HTTPException(status_code=400, detail="Cannot remove yourself")

    db.delete(admin_user)
    db.commit()
