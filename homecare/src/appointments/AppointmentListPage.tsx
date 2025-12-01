import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Form } from 'react-bootstrap';
import AppointmentTable from './AppointmentTable';
import AppointmentGrid from './AppointmentGrid';
import AppointmentCalendar from './AppointmentCalendar';
import './AppointmentCalendar.css';
import type { Appointment } from '../types/appointment';
import * as AppointmentService from './AppointmentService';
import { fetchPatientByUserId, fetchEmployeeByUserId } from './AppointmentService';
import { useAuth } from '../auth/AuthContext';

type ViewMode = 'table' | 'grid' | 'calendar';

const AppointmentListPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<number | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: Appointment[];

      if (user?.role === 'Patient') {
        const userId = user.sub || user.nameid;
        const patientData = await fetchPatientByUserId(userId);

        if (patientData?.patientId) {
          data = await AppointmentService.fetchAppointmentsByPatientId(
            patientData.patientId
          );
        } else {
          data = [];
          console.error('Patient ID not found for user');
        }
      } else {
        data = await AppointmentService.fetchAppointments();
      }

      setAppointments(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          `There was a problem with the fetch operation: ${error.message}`
        );
      } else {
        console.error('Unknown error', error);
      }
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const savedViewMode = localStorage.getItem(
      'appointmentViewMode'
    ) as ViewMode;
    if (savedViewMode && ['table', 'grid', 'calendar'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }

    if (user) {
      fetchAppointments();
      // Get current employee's ID if user is an employee
      if (user.role === 'Employee') {
        const userId = user.sub || user.nameid;
        fetchEmployeeByUserId(userId).then((employeeData) => {
          if (employeeData?.employeeId) {
            setCurrentEmployeeId(employeeData.employeeId);
          }
        }).catch((error) => {
          console.error('Error fetching employee data:', error);
        });
      }
    }
  }, [user, fetchAppointments]);

  useEffect(() => {
    localStorage.setItem('appointmentViewMode', viewMode);
  }, [viewMode]);

  const filteredAppointments = useMemo(() => 
    appointments.filter((appointment) =>
      appointment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [appointments, searchQuery]
  );

  const handleAppointmentDeleted = async (appointmentId: number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the appointment ${appointmentId}?`
    );
    if (confirmDelete) {
      try {
        await AppointmentService.deleteAppointment(appointmentId);
        setAppointments((prevAppointments) =>
          prevAppointments.filter(
            (appointment) => appointment.appointmentId !== appointmentId
          )
        );
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment.');
      }
    }
  };

  const handleAppointmentConfirmed = async (appointmentId: number) => {
    try {
      await AppointmentService.confirmAppointment(appointmentId);
      // Refresh appointments to show updated confirmation status
      await fetchAppointments();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      setError('Failed to confirm appointment.');
    }
  };

  return (
    <div className="container-fluid">
      <div className="appointment-page-header text-center mb-3">
        <h1 className="appointment-page-title fw-bold text-teal">My Appointments</h1>
        <p className="appointment-page-description mb-2">View and manage your healthcare appointments</p>
      </div>

      <div className="appointment-toolbar mb-3">
        <Button
          onClick={fetchAppointments}
          className="btn btn-teal me-3"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Appointments'}
        </Button>

        {/* View Mode Buttons */}
        <Button
          className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
          title="List view with detailed information"
        >
          List View
        </Button>
        <Button
          className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          title="Card view with appointment details"
        >
          Card View
        </Button>
        <Button
          className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
          title="Calendar view by month"
        >
          Calendar View
        </Button>
      </div>

      {/* Search field (only show for table and grid views) */}
      {viewMode !== 'calendar' && (
        <Form.Group className="mb-3">
          <Form.Label className="appointment-search-label">
            Search Appointments:
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Search by subject, description, patient name, or healthcare provider..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="appointment-search-input"
          />
        </Form.Group>
      )}

      {error && <p className="error-text">{error}</p>}

      {/* Render appropriate view based on viewMode */}
      {viewMode === 'table' && (
        <AppointmentTable
          appointments={filteredAppointments}
          onAppointmentDeleted={user ? handleAppointmentDeleted : undefined}
          onAppointmentConfirmed={user?.role === 'Employee' ? handleAppointmentConfirmed : undefined}
          userRole={user?.role}
          currentEmployeeId={currentEmployeeId}
        />
      )}

      {viewMode === 'grid' && (
        <AppointmentGrid
          appointments={filteredAppointments}
          onAppointmentDeleted={user ? handleAppointmentDeleted : undefined}
          onAppointmentConfirmed={user?.role === 'Employee' ? handleAppointmentConfirmed : undefined}
          userRole={user?.role}
          currentEmployeeId={currentEmployeeId}
        />
      )}

      {viewMode === 'calendar' && (
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentDeleted={user ? handleAppointmentDeleted : undefined}
          onAppointmentConfirmed={user?.role === 'Employee' ? handleAppointmentConfirmed : undefined}
          userRole={user?.role}
          currentEmployeeId={currentEmployeeId}
        />
      )}

      {user && (
        <div className="mt-3 text-center">
          <Button
            href="/appointmentcreate"
            className="btn btn-teal"
          >
            Add New Appointment
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentListPage;
