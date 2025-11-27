import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import AppointmentTable from './AppointmentTable';
import AppointmentGrid from './AppointmentGrid';
import AppointmentCalendar from './AppointmentCalendar';
import './AppointmentCalendar.css';
import type { Appointment } from '../types/appointment';
import * as AppointmentService from './AppointmentService';
import { fetchPatientByUserId } from './AppointmentService';
import { useAuth } from '../auth/AuthContext';

type ViewMode = 'table' | 'grid' | 'calendar';

const AppointmentListPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { user } = useAuth();

  const fetchAppointments = async () => {
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
      console.log(data);
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
  };

  useEffect(() => {
    const savedViewMode = localStorage.getItem(
      'appointmentViewMode'
    ) as ViewMode;
    console.log('[fetch appointments] Saved view mode:', savedViewMode);
    if (savedViewMode && ['table', 'grid', 'calendar'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  useEffect(() => {
    console.log('[save view state] Saving view mode:', viewMode);
    localStorage.setItem('appointmentViewMode', viewMode);
  }, [viewMode]);

  const filteredAppointments = appointments.filter((appointment) =>
    appointment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())
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
        console.log('Appointment deleted:', appointmentId);
      } catch (error) {
        console.error('Error deleting appointment:', error);
        setError('Failed to delete appointment.');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="text-center mb-3">
        <h1 className="fw-bold text-primary">My Appointments</h1>
        <p className="mb-2">View and manage your healthcare appointments</p>
      </div>

      <div className="mb-3">
        <Button
          onClick={fetchAppointments}
          className="btn btn-primary me-3"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Appointments'}
        </Button>

        {/* View Mode Buttons */}
        <div className="btn-group" role="group" aria-label="View mode selection">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('table')}
            title="List view with detailed information"
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('grid')}
            title="Card view with appointment details"
          >
            Card View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('calendar')}
            title="Calendar view by month"
          >
            Calendar View
          </Button>
        </div>
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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Render appropriate view based on viewMode */}
      {viewMode === 'table' && (
        <AppointmentTable
          appointments={filteredAppointments}
          onAppointmentDeleted={user ? handleAppointmentDeleted : undefined}
          userRole={user?.role}
        />
      )}

      {viewMode === 'grid' && (
        <AppointmentGrid
          appointments={filteredAppointments}
          onAppointmentDeleted={user ? handleAppointmentDeleted : undefined}
          userRole={user?.role}
        />
      )}

      {viewMode === 'calendar' && (
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentDeleted={user ? handleAppointmentDeleted : undefined}
          userRole={user?.role}
        />
      )}

      {user && (
        <div className="mt-3 text-center">
          <Button
            href="/appointmentcreate"
            className="btn btn-primary add-appointment-btn"  
          >
            Add New Appointment
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentListPage;
