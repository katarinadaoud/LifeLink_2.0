import React, { useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import { useNavigate } from 'react-router-dom';
import './AppointmentCalendar.css';

// Define props for AppointmentTable component
interface AppointmentTableProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: number) => void;
  onAppointmentConfirmed?: (appointmentId: number) => void;
  userRole?: string;
  currentEmployeeId?: number | null;
}

// Presentational component that shows appointments in a table format
const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, onAppointmentDeleted, onAppointmentConfirmed, userRole, currentEmployeeId }) => {
  const navigate = useNavigate();
  const [showDescriptions, setShowDescriptions] = useState<boolean>(true);
  const toggleDescriptions = () => setShowDescriptions(prevShowDescriptions => !prevShowDescriptions);

  // Toggle the visibility of appointment descriptions
  return ( 
    <div className="d-flex flex-column align-items-center">
    
      <div className="mb-3">
        <Button 
          onClick={toggleDescriptions} 
          className="btn btn-secondary btn-toggle"
        >
          {showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'}
        </Button>
      </div>
      <div className="table-wrapper">
        <Table striped bordered hover className="text-center">
          <thead className="table-header-teal">
            <tr>
              <th>Subject</th>
              <th>Status</th>
              <th>Date</th>
              {userRole !== 'Patient' && <th>Patient</th>} 
              <th>Healthcare Provider</th>
              {showDescriptions && <th>Description</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.appointmentId}>
                <td>{appointment.subject}</td>
                <td>
                  {appointment.isConfirmed ? (
                    <Badge bg="success">Confirmed</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">Pending</Badge>
                  )}
                </td>

                {/* Format the stored date into a readable local date/time string */}
                <td>{new Date(appointment.date).toLocaleString()}</td>
                {userRole !== 'Patient' && <td>{appointment.patientName || `Patient ID: ${appointment.patientId}`}</td>}
                <td>{appointment.employeeName || `Employee ID: ${appointment.employeeId}`}</td>
                {showDescriptions && <td>{appointment.description}</td>}
                <td className="text-center appointment-actions">
                  <div className="appointment-actions-vertical">
                    {userRole === 'Employee' && !appointment.isConfirmed && onAppointmentConfirmed && currentEmployeeId === appointment.employeeId && (
                      /* Confirm button for employees */
                    
                      <button
                        type="button"
                        onClick={() => onAppointmentConfirmed(appointment.appointmentId!)}
                        className="appointment-action appointment-action-confirm"
                      >
                        Confirm
                      </button>
                    )}
                    
                    {/* Only show update/delete buttons if a delete callback was provided */ }
                    {onAppointmentDeleted && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/appointmentupdate/${appointment.appointmentId}`)}
                          className="appointment-action appointment-action-update"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => onAppointmentDeleted(appointment.appointmentId!)}
                          className="appointment-action appointment-action-delete btn btn-delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AppointmentTable;
