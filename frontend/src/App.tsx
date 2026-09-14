import "./App.css";
import { useEffect, useState } from "react";

type Medication = {
  id: number;
  name: string;
  strength: string;
  dosage_form: string;
  quantity: number;
  reorder_level: number;
  supplier: string;
  expiration_date: string;
  status: string;
};

const medicationStrengths: Record<string, string[]> = {
  Amoxicillin: ["125 mg", "250 mg", "500 mg", "875 mg"],
  Azithromycin: ["100 mg", "200 mg", "250 mg", "500 mg"],
  Atorvastatin: ["10 mg", "20 mg", "40 mg", "80 mg"],
  Amlodipine: ["2.5 mg", "5 mg", "10 mg"],
  Cephalexin: ["125 mg", "250 mg", "500 mg", "750 mg"],
  Cetirizine: ["5 mg", "10 mg"],
  Doxycycline: ["50 mg", "75 mg", "100 mg", "150 mg"],
  Escitalopram: ["5 mg", "10 mg", "20 mg"],
  Gabapentin: ["100 mg", "300 mg", "400 mg", "600 mg", "800 mg"],
  Ibuprofen: ["100 mg", "200 mg", "400 mg", "600 mg", "800 mg"],
  Lisinopril: ["2.5 mg", "5 mg", "10 mg", "20 mg", "30 mg", "40 mg"],
  Losartan: ["25 mg", "50 mg", "100 mg"],
  Metformin: ["500 mg", "850 mg", "1000 mg"],
  Metoprolol: ["25 mg", "50 mg", "100 mg", "200 mg"],
  Omeprazole: ["10 mg", "20 mg", "40 mg"],
  Sertraline: ["25 mg", "50 mg", "100 mg"],
  Simvastatin: ["5 mg", "10 mg", "20 mg", "40 mg", "80 mg"],
  Trazodone: ["50 mg", "100 mg", "150 mg", "300 mg"],
};

const medicationDosageForms: Record<string, string[]> = {
  Amoxicillin: ["Capsule", "Tablet", "Liquid"],
  Azithromycin: ["Tablet", "Liquid"],
  Atorvastatin: ["Tablet"],
  Amlodipine: ["Tablet"],
  Cephalexin: ["Capsule", "Tablet", "Liquid"],
  Cetirizine: ["Tablet", "Liquid"],
  Doxycycline: ["Capsule", "Tablet"],
  Escitalopram: ["Tablet", "Liquid"],
  Gabapentin: ["Capsule", "Tablet", "Liquid"],
  Ibuprofen: ["Tablet", "Capsule", "Liquid"],
  Lisinopril: ["Tablet"],
  Losartan: ["Tablet"],
  Metformin: ["Tablet"],
  Metoprolol: ["Tablet"],
  Omeprazole: ["Capsule", "Tablet"],
  Sertraline: ["Tablet", "Liquid"],
  Simvastatin: ["Tablet"],
  Trazodone: ["Tablet"],
};

const strengthUnitsByForm: Record<string, string[]> = {
  Tablet: ["mg", "mcg", "g"],
  Capsule: ["mg", "mcg", "g"],
  Liquid: ["mg/mL", "mg/5 mL", "mcg/mL", "g/mL"],
  Injection: ["mg/mL", "mcg/mL", "units/mL"],
  Cream: ["%", "mg/g"],
  Ointment: ["%", "mg/g"],
  Inhaler: ["mcg/actuation", "mg/actuation"],
  Patch: ["mg/hour", "mcg/hour"],
  Drops: ["mg/mL", "mcg/mL", "%"],
  Suppository: ["mg", "g"],
  Powder: ["mg", "g", "mg/g"],
  Other: ["mg", "mcg", "g", "mg/mL", "%", "Other"],
};

const isValidStrengthUnit = (dosageForm: string, unit: string) => {
  const validUnits = strengthUnitsByForm[dosageForm] || [];
  return validUnits.includes(unit);
};

function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [medications, setMedications] = useState<Medication[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("name");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [strengthAmount, setStrengthAmount] = useState("");
  const [strengthUnit, setStrengthUnit] = useState("");
  const [supplierChoice, setSupplierChoice] = useState("");
  const [customSupplier, setCustomSupplier] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newMedication, setNewMedication] = useState({
    name: "",
    strength: "",
    dosage_form: "",
    quantity: 0,
    reorder_level: 0,
    supplier: "",
    expiration_date: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/medications`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load medications");
        }
        return response.json();
      })
      .then((data) => {
        setMedications(data);
        setApiError("");
      })
      .catch((error) => {
        console.error("Error:", error);
        setApiError("Could not connect to the medication API.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalMedications = medications.length;

  const lowStock = medications.filter(
    (medication) =>
      medication.quantity > 0 &&
      medication.quantity <= medication.reorder_level
  ).length;

  const outOfStock = medications.filter(
    (medication) => medication.quantity === 0
  ).length;

  const today = new Date();
  const ninetyDaysFromNow = new Date();

  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const expiringSoon = medications.filter((medication) => {
    const expirationDate = new Date(medication.expiration_date);
    return expirationDate >= today && expirationDate <= ninetyDaysFromNow;
  }).length;


  const filteredMedications = medications
    .filter((medication) => {
      const matchesSearch = medication.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || medication.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortOption === "quantity-low") {
        return a.quantity - b.quantity;
      }

      if (sortOption === "quantity-high") {
        return b.quantity - a.quantity;
      }

      if (sortOption === "expiration-soon") {
        return (
          new Date(a.expiration_date).getTime() -
          new Date(b.expiration_date).getTime()
        );
      }

      if (sortOption === "expiration-late") {
        return (
          new Date(b.expiration_date).getTime() -
          new Date(a.expiration_date).getTime()
        );
      }

      return 0;
    });

  const validateMedication = () => {
    if (
      !newMedication.name.trim() ||
      !newMedication.strength.trim() ||
      !newMedication.dosage_form.trim() ||
      !newMedication.supplier.trim() ||
      !newMedication.expiration_date
    ) {
      alert("Please fill in all medication fields.");
      return false;
    }

    const strengthValue = parseFloat(newMedication.strength);

    if (!isNaN(strengthValue) && strengthValue < 0) {
      alert("Strength cannot be negative.");
      return false;
    }

    if (newMedication.quantity < 0) {
      alert("Quantity cannot be negative.");
      return false;
    }

    if (newMedication.reorder_level < 0) {
      alert("Reorder level cannot be negative.");
      return false;
    }

    return true;
  };

  const handleEditMedication = (medication: Medication) => {
    const commonSuppliers = [
      "McKesson",
      "Cardinal Health",
      "Cencora",
      "Morris & Dickson",
      "Henry Schein",
      "Anda",
    ];

    const commonStrengths =
      medicationStrengths[medication.name] || [];

    // Load supplier correctly
    if (commonSuppliers.includes(medication.supplier)) {
      setSupplierChoice(medication.supplier);
      setCustomSupplier("");
    } else {
      setSupplierChoice("Other");
      setCustomSupplier(medication.supplier);
    }

    // Load strength correctly
    if (commonStrengths.includes(medication.strength)) {
      setStrengthAmount("");
      setStrengthUnit("");

      setNewMedication({
        ...medication,
        strength: medication.strength,
      });
    } else {
      const firstSpace = medication.strength.indexOf(" ");

      if (firstSpace !== -1) {
        setStrengthAmount(
          medication.strength.substring(0, firstSpace)
        );

        setStrengthUnit(
          medication.strength.substring(firstSpace + 1)
        );
      } else {
        setStrengthAmount(medication.strength);
        setStrengthUnit("");
      }

      setNewMedication({
        ...medication,
        strength: "Other",
      });
    }

    setEditingId(medication.id);
    setShowForm(true);
  };

  const handleUpdateMedication = async () => {
    if (editingId === null) return;

    if (!validateMedication()) return;

    if (
      newMedication.strength === "Other" &&
      (!strengthAmount.trim() || !strengthUnit.trim())
    ) {
      alert("Please enter the custom strength amount and unit.");
      return;
    }

    if (
      supplierChoice === "Other" &&
      !customSupplier.trim()
    ) {
      alert("Please enter the supplier name.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/medications/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newMedication,
            supplier:
              supplierChoice === "Other"
                ? customSupplier.trim()
                : supplierChoice,
            strength:
              newMedication.strength === "Other"
                ? `${strengthAmount.trim()} ${strengthUnit.trim()}`.trim()
                : newMedication.strength,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update medication");
      }

      const updatedMedication = await response.json();

      setMedications(
        medications.map((medication) =>
          medication.id === editingId ? updatedMedication : medication
        )
      );

      setEditingId(null);
      setStrengthAmount("");
      setStrengthUnit("");
      setSupplierChoice("");
      setCustomSupplier("");
      setShowForm(false);
    } catch (error) {
      console.error("Error updating medication:", error);
    }
  };

  const handleDeleteMedication = async (id: number) => {
    const medication = medications.find(
      (medication) => medication.id === id
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete ${medication?.name || "this medication"}?`
    );

    if (!confirmed) return;

    if (
      supplierChoice === "Other" &&
      !customSupplier.trim()
    ) {
      alert("Please enter the supplier name.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/medications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete medication");
      }

      setMedications(
        medications.filter((medication) => medication.id !== id)
      );
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const handleAddMedication = async () => {

    if (!validateMedication()) return;

    if (
      newMedication.strength === "Other" &&
      (!strengthAmount.trim() || !strengthUnit.trim())
    ) {
      alert("Please enter the custom strength amount and unit.");
      return;
    }

    const medicationToAdd = {
      ...newMedication,
      supplier:
        supplierChoice === "Other"
          ? customSupplier.trim()
          : supplierChoice,
      strength:
              newMedication.strength === "Other"
                ? `${strengthAmount.trim()} ${strengthUnit.trim()}`.trim()
                : newMedication.strength,
    };

    if (
      supplierChoice === "Other" &&
      !customSupplier.trim()
    ) {
      alert("Please enter the supplier name.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/medications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicationToAdd),
      });

      if (!response.ok) {
        throw new Error("Failed to add medication");
      }

      const addedMedication = await response.json();

      setMedications([...medications, addedMedication]);

      setNewMedication({
        name: "",
        strength: "",
        dosage_form: "",
        quantity: 0,
        reorder_level: 0,
        supplier: "",
        expiration_date: "",
      });

      setStrengthAmount("");
      setStrengthUnit("");
      setSupplierChoice("");
      setCustomSupplier("");
      setShowForm(false);
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  return (
    <div>
      {loading && (
        <div className="api-message">
          Loading medications...
        </div>
      )}

      {apiError && (
        <div className="api-error">
          {apiError}
        </div>
      )}
      <h1>Pharmacy Medication Management</h1>

      <div className="dashboard-cards">
        <div className="card">
          <h2>Total Medications</h2>
          <p>{totalMedications}</p>
        </div>

        <div className="card">
          <h2>Low Stock</h2>
          <p>{lowStock}</p>
        </div>

        <div className="card">
          <h2>Out of Stock</h2>
          <p>{outOfStock}</p>
        </div>

        <div className="card">
          <h2>Expiring Soon</h2>
          <p>{expiringSoon}</p>
        </div>
      </div>

      <div className="inventory-header">
        <h2>Medication Inventory</h2>

        <button
          className="add-button"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Medication
        </button>
      </div>

      {showForm && (
        <div className="medication-form">
          <div>
            <input
              list="medication-names"
              placeholder="Medication name"
              value={newMedication.name}
              onChange={(e) =>
                setNewMedication({
                  ...newMedication,
                  name: e.target.value,
                })
              }
            />

            <datalist id="medication-names">
              <option value="Amoxicillin" />
              <option value="Azithromycin" />
              <option value="Atorvastatin" />
              <option value="Amlodipine" />
              <option value="Cephalexin" />
              <option value="Cetirizine" />
              <option value="Doxycycline" />
              <option value="Escitalopram" />
              <option value="Gabapentin" />
              <option value="Ibuprofen" />
              <option value="Lisinopril" />
              <option value="Losartan" />
              <option value="Metformin" />
              <option value="Metoprolol" />
              <option value="Omeprazole" />
              <option value="Sertraline" />
              <option value="Simvastatin" />
              <option value="Trazodone" />
            </datalist>
          </div>

          <select
            value={newMedication.dosage_form}
            onChange={(e) => {
              setNewMedication({
                ...newMedication,
                dosage_form: e.target.value,
              });
              setStrengthAmount("");
              setStrengthUnit("");
            }}
          >
            <option value="">Select dosage form</option>

            {(medicationDosageForms[newMedication.name] || []).map(
              (form) => (
                <option key={form} value={form}>
                  {form}
                </option>
              )
            )}

            <option value="Other">Other</option>
          </select>

          <select
            value={newMedication.strength}
            onChange={(e) => {
              setNewMedication({
                ...newMedication,
                strength: e.target.value,
              });

              if (e.target.value !== "Other") {
                setStrengthAmount("");
                setStrengthUnit("");
              }
            }}
          >
            <option value="">Select strength</option>

            {(medicationStrengths[newMedication.name] || []).map(
              (strength) => (
                <option key={strength} value={strength}>
                  {strength}
                </option>
              )
            )}

            <option value="Other">Other</option>
          </select>

          {newMedication.strength === "Other" && (
            <div className="strength-fields">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Custom strength amount"
                value={strengthAmount}
                onChange={(e) => setStrengthAmount(e.target.value)}
              />

              <select
                value={strengthUnit}
                onChange={(e) => setStrengthUnit(e.target.value)}
              >
                <option value="">Select unit</option>

                {(strengthUnitsByForm[newMedication.dosage_form] || []).map(
                  (unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  )
                )}

          {newMedication.strength === "Other" &&
            strengthUnit &&
            !isValidStrengthUnit(
              newMedication.dosage_form,
              strengthUnit
            ) && (
              <div className="field-error">
                Invalid unit for {newMedication.dosage_form}.
              </div>
            )}
              </select>
            </div>
          )}

          <input
            type="number"
            placeholder="Quantity"
            value={newMedication.quantity}
            onChange={(e) =>
              setNewMedication({
                ...newMedication,
                quantity: Number(e.target.value),
              })
            }
          />

          <input
            type="number"
            placeholder="Reorder level"
            value={newMedication.reorder_level}
            onChange={(e) =>
              setNewMedication({
                ...newMedication,
                reorder_level: Number(e.target.value),
              })
            }
          />

          <select
            value={supplierChoice}
            onChange={(e) => {
              const value = e.target.value;
              setSupplierChoice(value);

              if (value !== "Other") {
                setCustomSupplier("");
                setNewMedication({
                  ...newMedication,
                  supplier: value,
                });
              } else {
                setNewMedication({
                  ...newMedication,
                  supplier: "Other",
                });
              }
            }}
          >
            <option value="">Select supplier</option>
            <option value="McKesson">McKesson</option>
            <option value="Cardinal Health">Cardinal Health</option>
            <option value="Cencora">Cencora</option>
            <option value="Morris & Dickson">Morris & Dickson</option>
            <option value="Henry Schein">Henry Schein</option>
            <option value="Anda">Anda</option>
            <option value="Other">Other</option>
          </select>

          {supplierChoice === "Other" && (
            <>
              <input
                list="supplier-search"
                type="text"
                placeholder="Search or enter supplier name"
                value={customSupplier}
                onChange={(e) => {
                  setCustomSupplier(e.target.value);
                  setNewMedication({
                    ...newMedication,
                    supplier: e.target.value,
                  });
                }}
              />

              <datalist id="supplier-search">
                <option value="AmerisourceBergen" />
                <option value="Anda Pharmaceuticals" />
                <option value="Masters Pharmaceutical" />
                <option value="Smith Drug Company" />
                <option value="Value Drug Company" />
              </datalist>
            </>
          )}

          <input
            type="date"
            value={newMedication.expiration_date}
            onChange={(e) =>
              setNewMedication({
                ...newMedication,
                expiration_date: e.target.value,
              })
            }
          />

          <div className="form-actions">
            <button
              className="save-button"
              onClick={
                editingId === null
                  ? handleAddMedication
                  : handleUpdateMedication
              }
            >
              {editingId === null ? "Save Medication" : "Update Medication"}
            </button>

            <button
              className="cancel-button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setNewMedication({
                  name: "",
                  strength: "",
                  dosage_form: "",
                  quantity: 0,
                  reorder_level: 0,
                  supplier: "",
                  expiration_date: "",
                          });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="inventory-header search-header">
        <input
          type="text"
          placeholder="Search medications..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <select
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
        >
          <option value="name">Name A-Z</option>
          <option value="quantity-low">Quantity: Low to High</option>
          <option value="quantity-high">Quantity: High to Low</option>
          <option value="expiration-soon">Expiration: Soonest First</option>
          <option value="expiration-late">Expiration: Latest First</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Medication</th>
            <th>Strength</th>
            <th>Form</th>
            <th>Quantity</th>
            <th>Reorder Level</th>
            <th>Supplier</th>
            <th>Expiration</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredMedications.map((medication) => (
            <tr key={medication.id}>
              <td>{medication.name}</td>
              <td>{medication.strength}</td>
              <td>{medication.dosage_form}</td>
              <td>{medication.quantity}</td>
              <td>{medication.reorder_level}</td>
              <td>{medication.supplier}</td>
              <td>
                <div>{medication.expiration_date}</div>
                {(() => {
                  const expiration = new Date(
                    medication.expiration_date + "T00:00:00"
                  );

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const ninetyDays = new Date(today);
                  ninetyDays.setDate(today.getDate() + 90);

                  if (expiration < today) {
                    return (
                      <span className="expiration-badge expired">
                        Expired
                      </span>
                    );
                  }

                  if (expiration <= ninetyDays) {
                    return (
                      <span className="expiration-badge expiring-soon">
                        Expiring Soon
                      </span>
                    );
                  }

                  return null;
                })()}
              </td>
              <td>
                <span
                  className={`status-badge ${medication.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {medication.status}
                </span>
              </td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleEditMedication(medication)}
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => handleDeleteMedication(medication.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
