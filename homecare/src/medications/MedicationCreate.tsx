// src/medications/MedicationCreatePage.tsx
import React, { useState, useEffect } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { NewMedicationDto } from "../types/medication";
import type { Patient } from "../types/patient";
import { createMedication, fetchPatients } from "./MedicationService";
import "../Medication.css";


export default function MedicationCreatePage() {
  // authorization check
  const { user } = useAuth(); //gives us the current logged in user
  const navigate = useNavigate(); 

  // Only employees can create medications, if not, show not authorized
  if (!user || user.role !== "Employee") return <p>Not authorized.</p>;

  // Form state, fields for new medication to be created
  const [form, setForm] = useState<NewMedicationDto>({
    patientId: 0, // Will be set from dropdown
    medicationName: "",
    indication: "",
    dosage: "",
    startDate: new Date().toISOString().slice(0, 10), // default to today
    endDate: null,
  });

  // empty patients list initially, then load from API
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true); // this indicates if we are loading patients
  const [saving, setSaving] = useState(false); // saving state for form submission
  const [err, setErr] = useState<string | null>(null); // function to hold error messages

  // Load patients when component mounts
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const patientsData = await fetchPatients(); // Fetch patients from API
        setPatients(patientsData); // Set patients in form state for dropdown
      } catch (error) { // Handle fetch error
        console.error('Error fetching patients:', error);
        setErr('Failed to load patients');
      } finally {
        setLoading(false); // Done loading
      }
    };

    loadPatients();
  }, []);

  // this helper updates form state for a given key/value pair
  const set = <K extends keyof NewMedicationDto>(
    key: K,
    value: NewMedicationDto[K]
  ) => setForm((f) => ({ ...f, [key]: value })); // update one field without updating the others

  // submitting the form

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // prevent default form submission
    setErr(null); // clear previous errors

    // validation: ensure a patient is selected

    if (!form.patientId || form.patientId <= 0) {
      setErr("Please select a patient.");
      return;
    }
    //try to create the medication
    setSaving(true); // 
    try {
      await createMedication(form); //save to backend
      navigate("/medications"); // go back to medications list
    } catch (e: any) { // show error message if creation fails
      setErr(e.message ?? "Failed to create medication.");
    } finally {
      setSaving(false); // done saving
    }
  }

  // show loading state while fetching patients
  if (loading) { 
    return <div>Loading form data...</div>;
  }

  return ( // main container for the create medication form
    <div className="container mt-3">

      {/* Card wrapper for the form */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Add Medication</Card.Title>

          {/* Medication creation form */}
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">

              {/* Patient selection dropdown */}
              <Form.Label>Patient</Form.Label>
              <Form.Control
                as="select"
                value={form.patientId}
                onChange={(e) => set("patientId", Number(e.target.value))}
                required
                disabled={loading}
              >
                {/* Default: generates list of patient */}
                <option value={0}>Select a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.patientId} value={patient.patientId}>
                    {patient.fullName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
              
              {/* Medication Name field */}
            <Form.Group className="mb-3">
              <Form.Label>Medication Name</Form.Label>
              <Form.Control
                required
                value={form.medicationName}
                onChange={(e) => set("medicationName", e.target.value)}
              />
            </Form.Group>
                {/* Indication field - optional*/}
            <Form.Group className="mb-3">
              <Form.Label>Indication</Form.Label>
              <Form.Control
                value={form.indication}
                onChange={(e) => set("indication", e.target.value)}
                placeholder="e.g., infection, pain relief"
              />
            </Form.Group>

                {/* Dosage field */}
            <Form.Group className="mb-3">
              <Form.Label>Dosage</Form.Label>
              <Form.Control
                required
                value={form.dosage}
                onChange={(e) => set("dosage", e.target.value)}
                placeholder="e.g., 500 mg"
              />
            </Form.Group>

                {/* Start Date field */}
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Form.Group>
                {/* End Date field - optional */}
            <Form.Group className="mb-3">
              <Form.Label>End Date (optional)</Form.Label>
              <Form.Control
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || null)}
              />
            </Form.Group>

            {err && <p className="error-text">{err}</p>}

                {/* Save and Cancel buttons */}
            <div className="d-flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
