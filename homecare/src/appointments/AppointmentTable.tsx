import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import { Link } from 'react-router-dom';

interface AppointmentTableProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: number) => void;
  userRole?: string;
}

const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments, onAppointmentDeleted, userRole }) => {
  const [showDescriptions, setShowDescriptions] = useState<boolean>(true);
  const toggleDescriptions = () => setShowDescriptions(prevShowDescriptions => !prevShowDescriptions);

  return (
    <div>
      <Button onClick={toggleDescriptions} className="btn btn-secondary mb-3 me-2">
        {showDescriptions ? 'Hide Descriptions' : 'Show Descriptions'}
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
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
              <td>{appointment.appointmentId}</td>
              <td>{appointment.subject}</td>
              <td>{new Date(appointment.date).toLocaleString()}</td>
              {userRole !== 'Patient' && <td>{appointment.patientName || `Patient ID: ${appointment.patientId}`}</td>}
              <td>{appointment.employeeName || `Employee ID: ${appointment.employeeId}`}</td>
              {showDescriptions && <td>{appointment.description}</td>}
              <td className="text-center">
                {onAppointmentDeleted && (
                  <>
                    <Link to={`/appointmentupdate/${appointment.appointmentId}`} className="me-2">Update</Link>
                    <Link to="#"
                      onClick={() => onAppointmentDeleted(appointment.appointmentId!)}
                      className="btn btn-link text-danger"
                    >Delete</Link>
                  </>
                )}              
              </td>              
              </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AppointmentTable;