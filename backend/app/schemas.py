from datetime import date
from pydantic import BaseModel, Field, field_validator


class MedicationCreate(BaseModel):
    name: str = Field(min_length=1)
    strength: str = Field(min_length=1)
    dosage_form: str = Field(min_length=1)
    quantity: int = Field(ge=0)
    reorder_level: int = Field(ge=0)
    supplier: str = Field(min_length=1)
    expiration_date: date

    @field_validator("name", "strength", "dosage_form", "supplier")
    @classmethod
    def fields_cannot_be_blank(cls, value: str):
        if not value.strip():
            raise ValueError("Field cannot be blank")
        return value.strip()

    @field_validator("strength")
    @classmethod
    def strength_cannot_be_negative(cls, value: str):
        try:
            number = float(value.split()[0])
            if number < 0:
                raise ValueError("Strength cannot be negative")
        except ValueError as error:
            if "negative" in str(error):
                raise error
        return value


class MedicationResponse(MedicationCreate):
    id: int
    status: str
