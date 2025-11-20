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
    <div className="d-flex flex-column align-items-center">
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table striped bordered hover className="text-center">
          <thead style={{ backgroundColor: '#177e8b', color: 'white' }}>
            <tr>
              <th>Patient</th>
          <th>Name</th>
          <th>Indication</th>
          <th>Dosage</th>
          <th>Start Date</th>
          <th>End Date</th>
          {userRole === "Employee" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={userRole === "Employee" ? 7 : 6} className="text-center text-muted">
              No medications found.
            </td>
          </tr>
        ) : (
          rows.map((m) => (
            <tr key={m.medicationName}>
              <td>{m.patientName ?? m.patientId ?? "—"}</td>
              <td>{m.medicationName}</td>
              <td>{m.indication ?? "—"}</td>
              <td>{m.dosage ?? "—"}</td>
              <td>{m.startDate ? m.startDate.slice(0, 10) : "—"}</td>
              <td>{m.endDate ? m.endDate.slice(0, 10) : "—"}</td>

              {userRole === "Employee" && (
                <td className="text-center">
                  <div className="appointment-actions-vertical">
                    <Button
                      size="sm"
                      className="btn btn-teal"
                      onClick={() => onEdit?.(m.medicationName)}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      className="btn btn-delete"
                      onClick={() => onDelete?.(m.medicationName)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </Table>
      </div>
    </div>
  );
};
