// src/medications/MedicationUpdatePage.tsx
import React, { useEffect, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import * as MedicationService from "./MedicationService";
import type { Medication } from "../types/medication";
import type { Patient } from "../types/patient";
import "./Medication.css";


const MedicationUpdatePage: React.FC = () => {
  const { name } = useParams(); // route: /medications/:name/edit
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<Partial<Medication>>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //Restrict access to Employee
  useEffect(() => {
    if (user?.role !== "Employee") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Fetch medication details and patients by name
  useEffect(() => {
    const load = async () => {
      try {
        // Load both medication data and patients list
        const [medicationData, patientsData] = await Promise.all([
          MedicationService.getMedication(name ?? ""),
          MedicationService.fetchPatients()
        ]);
        
        setForm(medicationData);
        setPatients(patientsData);
      } catch (e: any) {
        setError(e.message ?? "Failed to load medication.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [name]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit updates
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.medicationName) {
      alert("Medication name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // send update request to API
      await MedicationService.updateMedication(
        form.medicationName,
        form as Medication
      );
      navigate("/medications");
    } catch (e: any) {
      setError(e.message ?? "Failed to update medication.");
    } finally {
      setSaving(false);
    }
  };
// Show loading state
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading medication details...</p>
      </div>
    );
  }

  return (
    /*main container using bootsrap layout */
    <div className="container mt-4 update-container">
      <h2 className="fw-bold text-teal mb-3">Update Medication</h2>
      <p className="text-muted mb-4"> {/*subtitle - purpose of the page */}
        Edit the medication details below and click Save Changes.
      </p>

    {/*use bootstrap layout, show error only if error exist */}
      {error && (
        <p className="text-danger fw-semibold error-top" >
          {error}
        </p>
      )}

      <Form onSubmit={handleSubmit} noValidate>

        {/*medication name field */}
        <Form.Group className="mb-3">
          <Form.Label>Medication Name</Form.Label>
          <Form.Control
            type="text"
            name="medicationName"
            value={form.medicationName ?? ""}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/*patient selection dropdown */}

        <Form.Group className="mb-3">
          <Form.Label>Patient</Form.Label>
          <Form.Control
            as="select"
            name="patientId"
            value={form.patientId ?? ""}
            onChange={handleChange}
            required
          >
            
            <option value="">Select a patient...</option>
            
            {/*patient list automatically rendered */}
            {patients.map((patient) => (
              <option key={patient.patientId} value={patient.patientId}>
                {patient.fullName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

            {/* optional indication field */}
        <Form.Group className="mb-3">
          <Form.Label>Indication</Form.Label>
          <Form.Control
            type="text"
            name="indication"
            value={form.indication ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

            {/* dosage field */}
        <Form.Group className="mb-3">
          <Form.Label>Dosage</Form.Label>
          <Form.Control
            type="text"
            name="dosage"
            value={form.dosage ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

            {/* start date  */}
        <Form.Group className="mb-3">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            name="startDate"
            value={form.startDate ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

          {/* (optional) end date  */}
        <Form.Group className="mb-4">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            name="endDate"
            value={form.endDate ?? ""}
            onChange={handleChange}
          />
        </Form.Group>

            {/* action buttons with bootstrap style */}
        <div className="d-flex gap-2">
          <Button className="btn btn-teal" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            className="btn btn-delete"
            onClick={() => navigate("/medications")}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default MedicationUpdatePage;
