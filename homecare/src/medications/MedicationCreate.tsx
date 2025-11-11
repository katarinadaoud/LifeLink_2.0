// src/medications/MedicationCreatePage.tsx
import React, { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { NewMedicationDto } from "../types/medication";
import { createMedication } from "./MedicationService";

export default function MedicationCreatePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "Employee") return <p>Not authorized.</p>;

  const [form, setForm] = useState<NewMedicationDto>({
    patientId: undefined as any, // let user choose
    medicineName: "",
    indication: "",
    dosage: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: null,
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof NewMedicationDto>(
    key: K,
    value: NewMedicationDto[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.patientId || form.patientId <= 0) {
      setErr("Patient ID is required and must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      await createMedication(form, token!);
      navigate("/medications");
    } catch (e: any) {
      setErr(e.message ?? "Failed to create medication.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mt-3">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Add Medication</Card.Title>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="number"
                min={1}
                required
                value={form.patientId ?? ""}
                onChange={(e) => set("patientId", Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Medication Name</Form.Label>
              <Form.Control
                required
                value={form.medicineName}
                onChange={(e) => set("medicineName", e.target.value)}
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
