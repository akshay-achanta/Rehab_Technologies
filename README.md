# Rehab Technologies — Full Stack App

## Project Structure

```
Rehab Technologies/
├── frontend/     ← Next.js 16 + TypeScript + Tailwind CSS
└── backend/      ← FastAPI + PostgreSQL
```

---

## 🚀 Quick Start

### Step 1 — Set up the Database

Get a free online PostgreSQL database from one of these:
- [Neon](https://neon.tech) ← Recommended (free tier)
- [Supabase](https://supabase.com) (use the direct connection string)
- [Railway](https://railway.app)

Copy the connection string (looks like `postgresql://user:pass@host:5432/dbname`)

### Step 2 — Configure the Backend

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DB
SECRET_KEY=rehab-tech-super-secret-key-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_ORIGIN=http://localhost:3000
```

### Step 3 — Start the Backend

```bash
cd backend
pip install -r requirements.txt
python seed.py           # Creates tables + admin user + 6 services
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at: http://localhost:8000  
Swagger docs at: http://localhost:8000/docs

### Step 4 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be live at: http://localhost:3000

---

## 🔐 Default Admin Credentials

| Field | Value |
|-------|-------|
| URL | http://localhost:3000/admin/login |
| Mobile | `1234567890` |
| Password | `admin123` |

---

## 📡 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | None | Register new customer |
| POST | `/auth/login` | None | Login (returns JWT) |
| GET | `/auth/me` | Customer | Get current user |
| GET | `/services` | None | List active services |
| GET | `/services/all` | Admin | List all services |
| POST | `/services` | Admin | Create service |
| PUT | `/services/{id}` | Admin | Update service |
| DELETE | `/services/{id}` | Admin | Delete service |
| POST | `/requests` | Customer | Submit service request |
| GET | `/requests/me` | Customer | Get my requests |
| GET | `/requests` | Admin | Get all requests |
| PATCH | `/requests/{id}/status` | Admin | Update request status |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose + passlib bcrypt) |
