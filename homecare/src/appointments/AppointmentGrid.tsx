import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import './AppointmentCalendar.css';

// Props for the grid component: a list of appointments and optional callbacks/role info
interface AppointmentGridProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: number) => void;
  userRole?: string;
}

// Presentational component that shows appointments as responsive Bootstrap cards
const AppointmentGrid: React.FC<AppointmentGridProps> = ({ appointments, onAppointmentDeleted, userRole }) => {

  return (
    <div>
      {/* Responsive grid: 1 column on mobile, up to 4 on large screens */}
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {appointments.map(appointment => (
          <Col key={appointment.appointmentId}>
            <Card className="h-100">
              {/* Make the card body fill the height so buttons can stick to the bottom */}
              <Card.Body className="d-flex flex-column">
                {/* Show appointment id and subject as the card title */}
                <Card.Title>{appointment.appointmentId}: {appointment.subject}</Card.Title>
                <Card.Text>
                  {/* Format the stored date into a readable local date/time string */}
                  <strong>Date:</strong> {new Date(appointment.date).toLocaleString()}
                </Card.Text>
                <Card.Text>
                  <strong>Description:</strong> {appointment.description}
                </Card.Text>
                {/* For patients, we hide patient details; other roles can see patient info */}
                {userRole !== 'Patient' && (
                  <Card.Text>
                    {/* Prefer the patient’s name; fall back to showing patient ID if name is missing */}
                    <strong>Patient:</strong> {appointment.patientName || `Patient ID: ${appointment.patientId}`}
                  </Card.Text>
                )}
                <Card.Text>
                  {/* Same pattern for healthcare provider: show name if available, otherwise ID */}
                  <strong>Healthcare Provider:</strong> {appointment.employeeName || `Employee ID: ${appointment.employeeId}`}
                </Card.Text>

                {/* Action buttons are pushed to the bottom of the card using mt-auto */}
                <div className="mt-auto d-flex justify-content-end gap-2">
                  {/* Only show update/delete buttons if a delete callback was provided */}
                  {onAppointmentDeleted && (
                    <>
                      {/* Link to the update route for this specific appointment */}
                      <Button
                        href={`/appointmentupdate/${appointment.appointmentId}`}
                        className="btn btn-teal"
                      >
                        Update
                      </Button>
                      {/* Call parent callback to delete this appointment when clicked */}
                      <Button
                        onClick={() => onAppointmentDeleted(appointment.appointmentId!)}
                        className="btn btn-delete"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AppointmentGrid;
