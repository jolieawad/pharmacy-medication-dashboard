from sqlalchemy import Column, Integer, String, Date 
from app.database import Base

class Medication(Base):
	__tablename__ = "medications"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String, nullable=False)
	strength = Column(String, nullable=False)
	dosage_form = Column(String, nullable=False)
	quantity = Column(Integer, nullable=False)
	reorder_level = Column(Integer, nullable=False)
	supplier = Column(String, nullable=False)
	expiration_date = Column(Date, nullable=False)
	status = Column(String, nullable=False)
