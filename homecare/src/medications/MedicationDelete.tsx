import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Medication } from "../types/medication";
import { getMedication, deleteMedication } from "./MedicationService";
import "./Medication.css";


export default function MedicationDeletePage() {
  const { name } = useParams(); // route: /medications/:name/delete
  const { user } = useAuth();  // get current logged in user
  const navigate = useNavigate();

  const [med, setMed] = useState<Medication | null>(null); // medication to be deleted
  const [loading, setLoading] = useState(true); // loading state 
  const [err, setErr] = useState<string | null>(null); // error message state
  const [deleting, setDeleting] = useState(false); // deleting state

  // Load medication 
  useEffect(() => {  // every time name changes or on mount
    const load = async () => { // async function to load medication details
      if (!name) { 
        setErr("Missing medication name.");
        setLoading(false);
        return;
      }
      try { // fetch medication by name
        const data = await getMedication(name);
        setMed(data);
      } catch (e: any) {
        setErr(e.message ?? "Failed to load medication."); // set error message if fetch fails
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [name]);

  // Confirm delete 
  async function onConfirm() {
    if (!med) return; // if no medication, do nothing
    setDeleting(true);
    setErr(null);

    try { // call delete API
      await deleteMedication(med.medicationName);
      navigate("/medications");
    } catch (e: any) {
      setErr(e.message ?? "Failed to delete medication.");
      setDeleting(false);
    }
  }

  //  Restrict access to employees only
  if (!user || user.role !== "Employee") {
    return <p className="text-danger text-center mt-5">Not authorized.</p>;
  }

  // Loading state
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

  // Main container for delete and confirmation
  return (
    <div className="container mt-4">
      {/* Card with red border to indicate delete action */}
      <Card className="shadow-sm border-danger">
        <Card.Body>
          {/* Title and confirmation message, in red */}
          <Card.Title className="text-danger fw-bold">
            Delete Medication
          </Card.Title>

          {/* Confirmation message */}
          <p className="mb-3">
            Are you sure you want to delete this medication?
          </p>

          {/* details of medication being deleted */}
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

          {/* Display error message if deleting fail */}
          {err && <p className="text-danger">{err}</p>}

          {/* Confirm and Cancel buttons */}
          <div className="d-flex gap-2">

            {/* Confirm delete button, disabled while deleting */}
            <Button className="btn btn-delete" onClick={onConfirm} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"} 
            </Button>

            {/* Cancel button, navigates back to medications list */}
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
