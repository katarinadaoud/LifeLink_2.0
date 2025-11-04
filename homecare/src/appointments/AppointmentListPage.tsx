import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import AppointmentTable from './AppointmentTable';
import AppointmentGrid from './AppointmentGrid';
import AppointmentCalendar from './AppointmentCalendar';
import type { Appointment } from '../types/appointment';
import * as AppointmentService from './AppointmentService';
import { useAuth } from '../auth/AuthContext';


type ViewMode = 'table' | 'grid' | 'calendar';

const AppointmentListPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]); // State for storing appointments with Appointment type
  const [loading, setLoading] = useState<boolean>(false); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for storing error messages
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // State to toggle between different views
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query
  const { user } = useAuth(); // Get user from AuthContext

  const fetchAppointments = async () => {
    setLoading(true); // Set loading to true when starting the fetch
    setError(null);   // Clear any previous errors

    try {
      const data = await AppointmentService.fetchAppointments();
      setAppointments(data);
      console.log(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`There was a problem with the fetch operation: ${error.message}`);
      } else {
        console.error('Unknown error', error);
      }
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false); // Set loading to false once the fetch is complete
    }
  };

  // Set the view mode from local storage when the appointments are fetched
  useEffect(() => {
    const savedViewMode = localStorage.getItem('appointmentViewMode') as ViewMode;
    console.log('[fetch appointments] Saved view mode:', savedViewMode); // Debugging line
    if (savedViewMode && ['table', 'grid', 'calendar'].includes(savedViewMode)) {
      setViewMode(savedViewMode);
    }
    fetchAppointments();
  }, []);

  // Save the view mode to local storage whenever it changes
  useEffect(() => {
    console.log('[save view state] Saving view mode:', viewMode);
    localStorage.setItem('appointmentViewMode', viewMode);
  }, [viewMode]);

  const filteredAppointments = appointments.filter(appointment =>
    appointment.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppointmentDeleted = async (appointmentId: number) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the appointment ${appointmentId}?`);
    if (confirmDelete) {
      try {
        await AppointmentService.deleteAppointment(appointmentId);
        setAppointments(prevAppointments => prevAppointments.filter(appointment => appointment.appointmentId !== appointmentId));
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
        <h1 className="fw-bold text-primary" style={{ fontSize: '2.5rem' }}>My Appointments</h1>
        <p className="mb-2" style={{ fontSize: '1.1rem' }}>View and manage your healthcare appointments</p>
      </div>
      <div className="mb-3">
        <Button 
          onClick={fetchAppointments} 
          className="btn btn-primary me-3" 
          disabled={loading}
          style={{ fontSize: '1rem', padding: '8px 16px' }}
        >
          {loading ? 'Loading...' : 'Refresh Appointments'}
        </Button>
        
        {/* View Mode Buttons */}
        <div className="btn-group" role="group" aria-label="View mode selection">
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('table')}
            title="List view with detailed information"
            style={{ fontSize: '1rem', padding: '8px 16px' }}
          >
           List View
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('grid')}
            title="Card view with appointment details"
            style={{ fontSize: '1rem', padding: '8px 16px' }}
          >
            Card View
          </Button>
          <Button 
            variant={viewMode === 'calendar' ? 'primary' : 'outline-primary'}
            onClick={() => setViewMode('calendar')}
            title="Calendar view by month"
            style={{ fontSize: '1rem', padding: '8px 16px' }}
          >
            Calendar View
          </Button>
        </div>
      </div>
      
      {/* Search field (only show for table and grid views) */}
      {viewMode !== 'calendar' && (
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '1rem', fontWeight: 'bold' }}>
            Search Appointments:
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Type to search by appointment title or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ fontSize: '1rem' }}
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
            href='/appointmentcreate' 
            className="btn btn-success"
            style={{ fontSize: '1.1rem', padding: '10px 20px' }}
          >
            Add New Appointment
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentListPage;