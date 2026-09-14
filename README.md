# Pharmacy Medication Management Dashboard

A full-stack medication inventory dashboard built with React, TypeScript, FastAPI, and PostgreSQL.

## Features

- Add, edit, and delete medications
- Search medications by name
- Filter by stock status
- Sort by medication name, quantity, and expiration date
- Automatic stock status calculation
- Low-stock and out-of-stock tracking
- Expiration warnings for medications expiring within 90 days
- Form validation for medication data
- Backend validation with Pydantic
- PostgreSQL-generated medication IDs
- Loading and API error states
- Delete confirmation before removing medications

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database
- PostgreSQL

## Project Structure

pharmacy-medication-dashboard/
    backend/
        app/
            database.py
            main.py
            models.py
            schemas.py
        requirements.txt
    frontend/
        src/
            App.tsx
            App.css
            main.tsx
        package.json
    .gitignore
    README.md

## Running Locally

### Backend

Create `backend/.env` with:

DATABASE_URL=postgresql://YOUR_USERNAME@localhost/pharmacy_db

Then:

    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload

### Frontend

Create `frontend/.env` with:

VITE_API_URL=http://127.0.0.1:8000

Then:

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173 in your browser.

## Inventory Status Logic

- **Active:** quantity is above the reorder level
- **Low Stock:** quantity is greater than 0 and at or below the reorder level
- **Out of Stock:** quantity is 0

Medication status is calculated by the backend rather than entered manually.

## Future Improvements

- User authentication
- Medication categories
- Supplier management
- Inventory history
- Restock tracking
- Automated testing
- Cloud deployment
