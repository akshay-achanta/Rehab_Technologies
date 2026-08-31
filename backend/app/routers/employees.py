from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, hash_password
import uuid

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("", response_model=list[schemas.UserOut])
def get_employees(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    employees = db.query(models.User).filter(models.User.role == "employee").all()
    return employees

@router.post("", response_model=schemas.UserOut)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if db.query(models.User).filter(models.User.mobile == employee.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile already registered")
    if db.query(models.User).filter(models.User.email == employee.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_employee = models.User(
        name=employee.name,
        mobile=employee.mobile,
        email=employee.email,
        password_hash=hash_password(employee.password),
        role="employee",
        department=employee.department
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@router.put("/{employee_id}", response_model=schemas.UserOut)
def update_employee(employee_id: uuid.UUID, data: schemas.EmployeeUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    employee = db.query(models.User).filter(models.User.id == employee_id, models.User.role == "employee").first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    if data.name: employee.name = data.name
    if data.mobile: employee.mobile = data.mobile
    if data.email: employee.email = data.email
    if data.department: employee.department = data.department
    if data.password: employee.password_hash = hash_password(data.password)
    
    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: uuid.UUID, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
        
    employee = db.query(models.User).filter(models.User.id == employee_id, models.User.role == "employee").first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    db.delete(employee)
    db.commit()
    return {"ok": True}
