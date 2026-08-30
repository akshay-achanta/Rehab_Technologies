"""
Seed script: creates the initial admin user and 6 default services.
Run from the backend/ folder: python seed.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create admin
if not db.query(models.User).filter(models.User.mobile == "1234567890").first():
    admin = models.User(
        name="Admin",
        mobile="1234567890",
        email="admin@rehabtechnologies.com",
        password_hash=hash_password("admin123"),
        role="admin",
    )
    db.add(admin)
    print("✅ Admin user created  (mobile: 1234567890 / password: admin123)")
else:
    print("ℹ️  Admin user already exists")

# Create services
default_services = [
    ("Assessment & Condition Survey", "Comprehensive analysis of structural health.", "ClipboardCheck"),
    ("Investigation & Analysis", "Deep-dive diagnostic testing and reporting.", "Search"),
    ("Repair & Rehabilitation", "Expert structural restoration services.", "Wrench"),
    ("Retrofitting & Strengthening", "Upgrading structures for modern demands.", "Shield"),
    ("Waterproofing & Protection", "Advanced systems to prevent water ingress.", "HomeIcon"),
    ("Project Management", "End-to-end execution of repair projects.", "LineChart"),
]

for name, desc, icon in default_services:
    if not db.query(models.Service).filter(models.Service.name == name).first():
        db.add(models.Service(name=name, description=desc, icon=icon, is_active=True))
        print(f"✅ Service created: {name}")
    else:
        print(f"ℹ️  Service already exists: {name}")

db.commit()
db.close()
print("\n🎉 Seed complete!")
