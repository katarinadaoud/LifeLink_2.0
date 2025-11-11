import React, { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Medication } from "../types/medication";
import { getMedication, deleteMedication } from "./MedicationService";

export default function MedicationDeletePage() {
  const { name } = useParams(); // route: /medications/:name/delete
  const { user } = useAuth();
  const navigate = useNavigate();

  const [med, setMed] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Restrict access ---
  if (!user || user.role !== "Employee") {
    return <p className="text-danger text-center mt-5">Not authorized.</p>;
  }

  // --- Load medication ---
  useEffect(() => {
    const load = async () => {
      if (!name) {
        setErr("Missing medication name.");
        setLoading(false);
        return;
      }
      try {
        const data = await getMedication(name);
        setMed(data);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load medication.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [name]);

  // Confirm delete 
  async function onConfirm() {
    if (!med) return;
    setDeleting(true);
    setErr(null);

    try {
      await deleteMedication(med.medicationName);
      navigate("/medications");
    } catch (e: any) {
      setErr(e.message ?? "Failed to delete medication.");
      setDeleting(false);
    }
  }

 
  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="danger" />
        <p className="text-muted mt-2">Loading medication details…</p>
      </div>
    );

  if (!med)
    return (
      <p className="text-center text-muted mt-5">
        Medication not found.
      </p>
    );

  // Main view 
  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-danger">
        <Card.Body>
          <Card.Title className="text-danger fw-bold">
            Delete Medication
          </Card.Title>
          <p className="mb-3">
            Are you sure you want to delete this medication?
          </p>

          <ul className="list-unstyled mb-4">
            <li><strong>Name:</strong> {med.medicationName}</li>
            <li><strong>Patient:</strong> {med.patientName ?? med.patientId ?? "—"}</li>
            <li><strong>Dosage:</strong> {med.dosage}</li>
            <li><strong>Frequency:</strong> {med.frequency}</li>
            <li>
              <strong>Period:</strong>{" "}
              {med.startDate?.slice(0, 10)}{" "}
              {med.endDate ? `→ ${med.endDate.slice(0, 10)}` : ""}
            </li>
          </ul>

          {err && <p className="text-danger">{err}</p>}

          <div className="d-flex gap-2">
            <Button variant="danger" onClick={onConfirm} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/medications")}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
