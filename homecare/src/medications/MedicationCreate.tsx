// src/medications/MedicationCreatePage.tsx
import React, { useState, useEffect } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { NewMedicationDto } from "../types/medication";
import type { Patient } from "../types/patient";
import { createMedication, fetchPatients } from "./MedicationService";

export default function MedicationCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "Employee") return <p>Not authorized.</p>;

  const [form, setForm] = useState<NewMedicationDto>({
    patientId: 0, // Will be set from dropdown
    medicationName: "",
    indication: "",
    dosage: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load patients when component mounts
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const patientsData = await fetchPatients();
        setPatients(patientsData);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setErr('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const set = <K extends keyof NewMedicationDto>(
    key: K,
    value: NewMedicationDto[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.patientId || form.patientId <= 0) {
      setErr("Please select a patient.");
      return;
    }

    setSaving(true);
    try {
      await createMedication(form);
      navigate("/medications");
    } catch (e: any) {
      setErr(e.message ?? "Failed to create medication.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <div className="container mt-3">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Add Medication</Card.Title>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient</Form.Label>
              <Form.Control
                as="select"
                value={form.patientId}
                onChange={(e) => set("patientId", Number(e.target.value))}
                required
                disabled={loading}
              >
                <option value={0}>Select a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.patientId} value={patient.patientId}>
                    {patient.fullName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Medication Name</Form.Label>
              <Form.Control
                required
                value={form.medicationName}
                onChange={(e) => set("medicationName", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Indication</Form.Label>
              <Form.Control
                value={form.indication}
                onChange={(e) => set("indication", e.target.value)}
                placeholder="e.g., infection, pain relief"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dosage</Form.Label>
              <Form.Control
                required
                value={form.dosage}
                onChange={(e) => set("dosage", e.target.value)}
                placeholder="e.g., 500 mg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                required
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date (optional)</Form.Label>
              <Form.Control
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || null)}
              />
            </Form.Group>

            {err && <p style={{ color: "crimson" }}>{err}</p>}

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
