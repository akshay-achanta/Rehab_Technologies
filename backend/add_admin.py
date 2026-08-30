import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.auth import hash_password

db = SessionLocal()

# Check if admin already exists
if not db.query(models.User).filter(models.User.mobile == "9998887776").first():
    new_admin = models.User(
        name="Admin Two",
        mobile="9998887776",
        email="admin2@rehabtechnologies.com",
        password_hash=hash_password("admin456"),
        role="admin",
    )
    db.add(new_admin)
    db.commit()
    print("SUCCESS")
else:
    print("ALREADY EXISTS")

db.close()
