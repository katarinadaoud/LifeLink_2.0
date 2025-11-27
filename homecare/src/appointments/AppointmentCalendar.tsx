import React, { useState } from 'react';
import { Card, Button, Badge, Row, Col, Modal } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';

import './AppointmentCalendar.css';

// Props for the calendar: list of appointments, optional delete handler and user role
interface AppointmentCalendarProps {
  appointments: Appointment[]; // Array of all appointments to be displayed
  onAppointmentDeleted?: (appointmentId: number) => void; // Optional callback when an appointment is deleted
  userRole?: string; // Optional string that defines user type ("Patient", "Employee", etc.)
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ 
  appointments, 
  onAppointmentDeleted, 
  userRole 
}) => {
  // Keeps track of which month/year is currently shown in the calendar
  const [currentDate, setCurrentDate] = useState(new Date()); // Holds whichever month is currently visible in the calendar view.
  // Stores the appointment that was clicked so we can show its details in the modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null); // Tracks which appointment the user has clicked — used to populate the details modal.
  // Controls whether the appointment details modal is open or closed
  const [showModal, setShowModal] = useState(false); // Boolean flag controlling whether the appointment details modal is visible.

  // Helper function to get the first day of the current month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Helper function to get the last day of the current month
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Helper function to compute all the days that should be displayed in the grid,
  // including trailing days from the previous and next month so weeks are complete
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

  // Helper function to return all appointments that fall on a specific calendar day
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === dateStr;
    });
  };

  // Navigation functions to move between months
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

  // Checks if a given date belongs to the currently selected month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Checks if a given date is "today"
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="calendar-container">
      {/* Calendar header showing current month/year and navigation buttons */}
      <div className="calendar-header">
          <div>
          <h3 className="calendar-title mb-0 fw-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={goToPreviousMonth} 
            className="calendar-btn"
          >
            ← Previous
          </Button>
          <Button 
            variant="primary" 
            onClick={goToToday}
            className="calendar-btn"
          >
            Today
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={goToNextMonth}
            className="calendar-btn"
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Row with weekday names as headers for the calendar columns */}
      <div className="calendar-grid">
        <Row className="mb-2">
          {dayNames.map(day => (
            <Col key={day} className="day-header text-center fw-bold py-2 border-bottom">
              {day}
            </Col>
          ))}
        </Row>
      </div>

      {/* Main calendar grid where each cell represents a day and shows its appointments */}
      <div className="calendar-grid">
        {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
          <Row 
            key={weekIndex} 
            className="calendar-week mb-2">
            {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => {
              const dayAppointments = getAppointmentsForDate(date);
              return (
                <Col key={dayIndex} className="p-1">
                  <Card
                    className={
                      'calendar-card h-100 ' +
                      (!isCurrentMonth(date) ? 'calendar-outside-month ' : '') +
                      (isToday(date) ? 'calendar-today ' : '')
                    }
                  >

                    <Card.Header className="calendar-card-header py-1 px-2 d-flex justify-content-between align-items-center">
                      <strong 
                        className="calendar-card-date"
  
                    >
                        {date.getDate()}
                      </strong>
                      {dayAppointments.length > 0 && (
                        <Badge 
                          bg="primary" 
                          pill 
                          className="calendar-badge">
                          {dayAppointments.length}
                        </Badge>
                      )}
                    </Card.Header>
                    <Card.Body className="calendar-body p-1">
                      {/* For each day, show up to two appointment "chips" with time and subject */}
                      {dayAppointments.slice(0, 2).map(appointment => (
                        <div key={appointment.appointmentId} className="mb-1">
                          <div 
                            className="appointment-item p-1"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowModal(true);
                            }}
                            title="Click to view details"
                          >
                            <div className="fw-bold text-truncate">
                              {appointment.subject}
                            </div>
                            <div className="appointment-time">
                            {new Date(appointment.date).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* If there are more than two appointments, show a "+X more" link that opens a summary */}
                      {dayAppointments.length > 2 && (
                        <div 
                          className="appointment-more text-center fw-bold"
                          onClick={() => {
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

      {/* Legend and monthly statistics for appointments in the currently visible month */}
      <div className="calendar-legend">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <Badge bg="primary" className="me-2">Today</Badge>
            <span className="calendar-legend-text">
              <strong>Tip:</strong> Click appointments for details
            </span>
          </div>
          <div>
            <span className="calendar-legend-text">
              <strong>
                This month: {appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return (
                  aptDate.getMonth() === currentDate.getMonth() && 
                  aptDate.getFullYear() === currentDate.getFullYear()
                  );
              }).length} appointments</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Modal that shows detailed information about the selected appointment */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="modal-title-custom">
            Appointment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedAppointment && (
            <div>
              <div className="mb-3">
                <strong>Subject:</strong>
                 <p className="modal-subject mt-1">
                  {selectedAppointment.subject}
                </p>
              </div>
              
              <div className="mb-3">
                <strong>Date & Time:</strong>
                <p className="modal-info mt-1">
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
                   <p className="modal-info mt-1">
                    {selectedAppointment.patientName || `Patient ID: ${selectedAppointment.patientId}`}
                  </p>
                </div>
              )}
              
              {selectedAppointment.employeeName && (
                <div className="mb-3">
                  <strong>Healthcare Provider:</strong>
                   <p className="modal-info mt-1">
                    {selectedAppointment.employeeName}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* If a delete handler is provided, show edit/delete actions for the selected appointment */}
          {onAppointmentDeleted && selectedAppointment && (
            <>
              <Button 
                variant="primary" 
                size="lg"
                href={`/appointmentupdate/${selectedAppointment.appointmentId}`}
                className="modal-btn"
              >
                Edit Appointment
              </Button>
              <Button 
                size="lg"
                onClick={() => {
                  onAppointmentDeleted(selectedAppointment.appointmentId!);
                  setShowModal(false);
                }}
                className="modal-btn btn btn-delete"
              >
                Delete Appointment
              </Button>
            </>
          )}
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => setShowModal(false)}
            className="modal-btn"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AppointmentCalendar;
