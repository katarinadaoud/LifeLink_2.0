import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import './AppointmentCalendar.css';

interface AppointmentGridProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: number) => void;
  userRole?: string;
}

const AppointmentGrid: React.FC<AppointmentGridProps> = ({ appointments, onAppointmentDeleted, userRole }) => {

  return (
    <div>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {appointments.map(appointment => (
          <Col key={appointment.appointmentId}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <Card.Title>{appointment.appointmentId}: {appointment.subject}</Card.Title>
                <Card.Text>
                  <strong>Date:</strong> {new Date(appointment.date).toLocaleString()}
                </Card.Text>
                <Card.Text>
                  <strong>Description:</strong> {appointment.description}
                </Card.Text>
                {userRole !== 'Patient' && (
                  <Card.Text>
                    <strong>Patient:</strong> {appointment.patientName || `Patient ID: ${appointment.patientId}`}
                  </Card.Text>
                )}
                <Card.Text>
                  <strong>Healthcare Provider:</strong> {appointment.employeeName || `Employee ID: ${appointment.employeeId}`}
                </Card.Text>

                <div className="mt-auto d-flex justify-content-end gap-2">
                  {onAppointmentDeleted && (
                    <>
                      <Button
                        href={`/appointmentupdate/${appointment.appointmentId}`}
                        className="btn btn-teal"
                      >
                        Update
                      </Button>
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
