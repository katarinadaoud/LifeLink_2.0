import React from "react";
import { Button, Table } from "react-bootstrap";
import type { Medication } from "../types/medication";


export interface MedicationTableProps {
  rows: Medication[];
  userRole?: string;
  onEdit?: (name: string) => void;
  onDelete?: (name: string) => void;
}

export const MedicationTable: React.FC<MedicationTableProps> = ({
  rows,
  userRole,
  onEdit,
  onDelete,
}) => {
  return (
    <Table striped bordered hover responsive className="align-middle">
      <thead className="table-light">
        <tr>
          <th>Patient</th>
          <th>Name</th>
          <th>Indication</th>
          <th>Dosage</th>
          <th>Frequency</th>
          <th>Start Date</th>
          <th>End Date</th>
          {userRole === "Employee" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={userRole === "Employee" ? 8 : 7} className="text-center text-muted">
              No medications found.
            </td>
          </tr>
        ) : (
          rows.map((m) => (
            <tr key={m.medicineName}>
              <td>{m.patientName ?? m.patientId ?? "—"}</td>
              <td>{m.medicineName}</td>
              <td>{m.dosage ?? "—"}</td>
              <td>{m.frequency ?? "—"}</td>
              <td>{m.startDate ? m.startDate.slice(0, 10) : "—"}</td>
              <td>{m.endDate ? m.endDate.slice(0, 10) : "—"}</td>

              {userRole === "Employee" && (
                <td className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onEdit?.(m.medicineName)}
                  >
                    Update
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onDelete?.(m.medicineName)}
                  >
                    Delete
                  </Button>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};
