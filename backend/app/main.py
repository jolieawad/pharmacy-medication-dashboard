from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session 
from fastapi.middleware.cors import CORSMiddleware

from app import models, schemas
from app.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
	CORSMiddleware, 
	allow_origins=["http://localhost:5173"],
	allow_credentials=True, 
	allow_methods=["*"],
	allow_headers=["*"],
)
	
def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
	 	db.close()

def calculate_status(quantity: int, reorder_level: int):
    if quantity == 0:
        return "Out of Stock"
    elif quantity <= reorder_level:
        return "Low Stock"
    return "Active"


@app.get("/")
def root():
	return {"message": "Pharmacy Medication Management API"}

@app.get("/medications")
def get_medications(db: Session = Depends(get_db)):
	return db.query(models.Medication).all()

@app.post("/medications")
def create_medication(
	medication: schemas.MedicationCreate, 
	db: Session = Depends(get_db)
):
	db_medication = models.Medication(
		name=medication.name, 
		strength=medication.strength,
		dosage_form=medication.dosage_form, 
		quantity=medication.quantity,
		reorder_level=medication.reorder_level,
		supplier=medication.supplier,
		expiration_date=medication.expiration_date, 
		status=calculate_status(medication.quantity, medication.reorder_level)
	)
	db.add(db_medication)
	db.commit()
	db.refresh(db_medication)

	return db_medication


@app.get("/medications/{medication_id}")
def get_medication(
	medication_id: int,
	db: Session = Depends(get_db)
):
	medication = (
		db.query(models.Medication)
		.filter(models.Medication.id == medication_id)
		.first()
	)

	if medication is None:
		raise HTTPException(
			status_code=404,
			detail="Medication not found"
		)
	return medication

@app.put("/medications/{medication_id}")
def update_medication(
	medication_id: int, 
	updated_medication: schemas.MedicationCreate, 
	db: Session = Depends(get_db)
):
	medication = (
		db.query(models.Medication)
		.filter(models.Medication.id == medication_id)
		.first()
	)

	if medication is None:
		raise HTTPException(
			status_code=404, 
			detail="Medication not found"
		)

	medication.name = updated_medication.name
	medication.strength = updated_medication.strength 
	medication.dosage_form = updated_medication.dosage_form
	medication.quantity = updated_medication.quantity
	medication.reorder_level = updated_medication.reorder_level
	medication.supplier = updated_medication.supplier
	medication.expiration_date = updated_medication.expiration_date
	medication.status = calculate_status(updated_medication.quantity, updated_medication.reorder_level)

	db.commit()
	db.refresh(medication)

	return medication

@app.delete("/medications/{medication_id}")
def delete_medication(
	medication_id: int, 
	db: Session = Depends(get_db)
):
	medication = (
		db.query(models.Medication)
		.filter(models.Medication.id == medication_id)
		.first()
	)
	if medication is None: 
		raise HTTPException(
			status_code=404,
			detail="Medication not found"
		)
	db.delete(medication)
	db.commit()

	return {"message": "Medication deleted successfully"}

