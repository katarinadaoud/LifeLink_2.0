import React from "react";
import { Button, Table } from "react-bootstrap";
import type { Medication } from "../types/medication";
import "./Medication.css";


// Props for MedicationTable component
export interface MedicationTableProps {
  rows: Medication[];
  userRole?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number, name: string) => void;
}

export const MedicationTable: React.FC<MedicationTableProps> = ({
  rows,
  userRole,
  onEdit,
  onDelete,

}) => {
  return (
    //Container using Bootstrap to center the table

    <div className="d-flex flex-column align-items-center">
      <div className="table-scroll"> {/* Scrollable conton smaller screens */}
        <Table striped bordered hover className="text-center">
          <thead className="table-header-teal">
            <tr>
              <th>Patient</th>
          <th>Name</th>
          <th>Indication</th>
          <th>Dosage</th>
          <th>Start Date</th>
          <th>End Date</th>

          {/*shows action columns for employees only*/}
          {userRole === "Employee" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            {/* if no rows, show message*/}
            <td colSpan={userRole === "Employee" ? 7 : 6} className="text-center text-muted">
              No medications found.
            </td>
          </tr>
        ) : (
          // Map through medication rows and display data
          rows.map((m) => ( 
            <tr key={m.medicationId}>
              <td>{m.patientName ?? m.patientId ?? "—"}</td>
              <td>{m.medicationName}</td>
              <td>{m.indication ?? "—"}</td>
              <td>{m.dosage ?? "—"}</td>
              <td>{m.startDate ? m.startDate.slice(0, 10) : "—"}</td>
              <td>{m.endDate ? m.endDate.slice(0, 10) : "—"}</td>

                {/*update + delete buttons shown for employees only*/}
              {userRole === "Employee" && (
                <td className="text-center">
                  <div className="appointment-actions-vertical">
                    <Button
                      className="btn btn-teal"
                      onClick={() => onEdit?.(m.medicationId!)}
                    >
                      Update
                    </Button>
                    <Button
                      className="btn btn-delete"
                      onClick={() => onDelete?.(m.medicationId!, m.medicationName)}
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
