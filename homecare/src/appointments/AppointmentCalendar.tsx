import React, { useState } from 'react';
import { Card, Button, Badge, Row, Col, Modal } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentDeleted?: (appointmentId: number) => void;
  userRole?: string;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ appointments, onAppointmentDeleted, userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Helper function to get the first day of the month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Helper function to get the last day of the month
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Helper function to get all days to display in calendar (including prev/next month days)
  const getCalendarDays = () => {
    const firstDay = getFirstDayOfMonth(currentDate);
    const lastDay = getLastDayOfMonth(currentDate);
    
    // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1)); // Start from Monday
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (7 - lastDay.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  // Helper function to get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === dateStr;
    });
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = getCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div>
      {/* Calendar Header - More Compact */}
      <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded" style={{ maxWidth: '1200px', margin: '0 auto 1rem auto' }}>
        <div>
          <h3 className="mb-0 fw-bold text-primary" style={{ fontSize: '1.5rem' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={goToPreviousMonth} 
            style={{ fontSize: '1rem', padding: '6px 12px' }}
          >
            ← Previous
          </Button>
          <Button 
            variant="primary" 
            onClick={goToToday}
            style={{ fontSize: '1rem', padding: '6px 12px' }}
          >
            Today
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={goToNextMonth}
            style={{ fontSize: '1rem', padding: '6px 12px' }}
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Day Headers - More Compact */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row className="mb-2">
          {dayNames.map(day => (
            <Col key={day} className="text-center fw-bold py-2 border-bottom" style={{ fontSize: '1rem' }}>
              {day}
            </Col>
          ))}
        </Row>
      </div>

      {/* Calendar Grid - More Compact Layout */}
      <div className="calendar-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
          <Row key={weekIndex} className="mb-2" style={{ minHeight: '120px' }}>
            {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
              const dayAppointments = getAppointmentsForDate(date);
              return (
                <Col key={dayIndex} className="p-1">
                  <Card 
                    className={`h-100 ${!isCurrentMonth(date) ? 'text-muted bg-light' : ''} ${isToday(date) ? 'border-primary border-2 bg-primary bg-opacity-10' : ''}`}
                    style={{ minHeight: '100px' }}
                  >
                    <Card.Header className="py-1 px-2 d-flex justify-content-between align-items-center" style={{ minHeight: '32px' }}>
                      <strong className={`${isToday(date) ? 'text-primary' : ''}`} style={{ fontSize: '1rem' }}>
                        {date.getDate()}
                      </strong>
                      {dayAppointments.length > 0 && (
                        <Badge bg="primary" pill style={{ fontSize: '0.8rem' }}>
                          {dayAppointments.length}
                        </Badge>
                      )}
                    </Card.Header>
                    <Card.Body className="p-1" style={{ overflow: 'hidden' }}>
                      {dayAppointments.slice(0, 2).map(appointment => (
                        <div key={appointment.appointmentId} className="mb-1">
                          <div 
                            className="p-1 rounded bg-info text-white text-center"
                            style={{ 
                              fontSize: '0.8rem', 
                              cursor: 'pointer',
                              transition: 'background-color 0.2s'
                            }}
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowModal(true);
                            }}
                            onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#0b5ed7'}
                            onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#0dcaf0'}
                            title="Click to view details"
                          >
                            <div className="fw-bold text-truncate">
                              {appointment.subject}
                            </div>
                            <div style={{ fontSize: '0.7rem' }}>
                              {new Date(appointment.date).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div 
                          className="text-center text-primary fw-bold" 
                          style={{ fontSize: '0.7rem', cursor: 'pointer' }}
                          onClick={() => {
                            // Create a "summary" appointment to show all appointments for this day
                            const summaryAppointment: Appointment = {
                              appointmentId: -1,
                              subject: `${dayAppointments.length} appointments today`,
                              description: dayAppointments.map(apt => `• ${apt.subject} at ${new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`).join('\n'),
                              date: new Date(date),
                              patientId: 0,
                              employeeId: 0
                            };
                            setSelectedAppointment(summaryAppointment);
                            setShowModal(true);
                          }}
                          title="Click to see all appointments for this day"
                        >
                          +{dayAppointments.length - 2} more
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ))}
      </div>

      {/* Legend and Stats - More Compact */}
      <div className="mt-3 p-2 bg-light rounded" style={{ maxWidth: '1200px', margin: '1rem auto 0 auto' }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <Badge bg="primary" className="me-2">Today</Badge>
            <span style={{ fontSize: '0.9rem' }}>
              <strong>Tip:</strong> Click appointments for details
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.9rem' }}>
              <strong>This month: {appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return aptDate.getMonth() === currentDate.getMonth() && 
                       aptDate.getFullYear() === currentDate.getFullYear();
              }).length} appointments</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
            📅 Appointment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: '1.1rem' }}>
          {selectedAppointment && (
            <div>
              <div className="mb-3">
                <strong>Subject:</strong>
                <p className="mt-1" style={{ fontSize: '1.2rem', color: '#0d6efd' }}>
                  {selectedAppointment.subject}
                </p>
              </div>
              
              <div className="mb-3">
                <strong>Date & Time:</strong>
                <p className="mt-1" style={{ fontSize: '1.1rem' }}>
                  {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {new Date(selectedAppointment.date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-1">{selectedAppointment.description}</p>
              </div>
              
              {userRole !== 'Patient' && (
                <div className="mb-3">
                  <strong>Patient:</strong>
                  <p className="mt-1" style={{ fontSize: '1.1rem', color: '#0d6efd' }}>
                    {selectedAppointment.patientName || `Patient ID: ${selectedAppointment.patientId}`}
                  </p>
                </div>
              )}
              
              {selectedAppointment.employeeName && (
                <div className="mb-3">
                  <strong>Healthcare Provider:</strong>
                  <p className="mt-1" style={{ fontSize: '1.1rem', color: '#0d6efd' }}>
                    {selectedAppointment.employeeName}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {onAppointmentDeleted && selectedAppointment && (
            <>
              <Button 
                variant="primary" 
                size="lg"
                href={`/appointmentupdate/${selectedAppointment.appointmentId}`}
                style={{ fontSize: '1.1rem' }}
              >
                ✏️ Edit Appointment
              </Button>
              <Button 
                variant="danger" 
                size="lg"
                onClick={() => {
                  onAppointmentDeleted(selectedAppointment.appointmentId!);
                  setShowModal(false);
                }}
                style={{ fontSize: '1.1rem' }}
              >
                🗑️ Delete Appointment
              </Button>
            </>
          )}
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => setShowModal(false)}
            style={{ fontSize: '1.1rem' }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;