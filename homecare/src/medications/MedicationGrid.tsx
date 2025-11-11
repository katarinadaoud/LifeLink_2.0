import React from "react";
import type { Medication } from "../types/medication";
import { Button, Card } from "react-bootstrap";

type Props = {
  rows: Medication[];
  onDelete?: (name: string) => void;
  userRole?: string | null | undefined;
};

const MedicationGrid: React.FC<Props> = ({ rows, onDelete, userRole }) => {
  if (!rows.length) return <p>No medications found.</p>;

  return (
    <div className="row g-3">
      {rows.map((m) => (
        <div className="col-md-4" key={m.medicineName}>
          <Card>
            <Card.Body>
              <Card.Title>{m.medicineName}</Card.Title>
              <Card.Text>
                {m.dosage} – {m.frequency}
                {m.patientName && (
                  <>
                    <br />
                    <strong>Patient:</strong> {m.patientName}
                  </>
                )}
              </Card.Text>
              {userRole === "Employee" && onDelete && (
                <Button variant="danger" onClick={() => onDelete(m.medicineName)}>
                  Delete
                </Button>
              )}
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default MedicationGrid;