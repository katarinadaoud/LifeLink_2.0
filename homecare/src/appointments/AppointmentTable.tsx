import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import { useNavigate } from 'react-router-dom';
import './AppointmentCalendar.css';

interface AppointmentTableProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: number) => void;
  userRole?: string;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, onAppointmentDeleted, userRole }) => {
  const navigate = useNavigate();
  const [showDescriptions, setShowDescriptions] = useState<boolean>(true);
  const toggleDescriptions = () => setShowDescriptions(prevShowDescriptions => !prevShowDescriptions);

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
                <td>{new Date(appointment.date).toLocaleString()}</td>
                {userRole !== 'Patient' && <td>{appointment.patientName || `Patient ID: ${appointment.patientId}`}</td>}
                <td>{appointment.employeeName || `Employee ID: ${appointment.employeeId}`}</td>
                {showDescriptions && <td>{appointment.description}</td>}
                <td className="text-center appointment-actions">
                  {onAppointmentDeleted && (
                    <div className="appointment-actions-vertical">
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
                    </div>
                  )}
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
