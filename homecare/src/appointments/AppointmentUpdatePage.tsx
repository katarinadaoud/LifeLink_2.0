import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppointmentForm from './AppointmentForm';
import type { Appointment } from '../types/appointment';
import * as AppointmentService from './AppointmentService';

const AppointmentUpdatePage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>(); // Get appointmentId from the URL
  const navigate = useNavigate(); // Create a navigate function
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await AppointmentService.fetchAppointmentById(appointmentId!);
        setAppointment(data);
      } catch (error) {
        setError('Failed to fetch appointment');
        console.error('There was a problem with the fetch operation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleAppointmentUpdated = async (appointment: Appointment) => {

    try {
      const data = await AppointmentService.updateAppointment(Number(appointmentId), appointment);
      console.log('Appointment updated successfully:', data);
      navigate('/appointments'); // Navigate back after successful creation
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!appointment) return <p>No appointment found</p>;
  
  return (
    <div>
      <h2>Update Appointment</h2>
      <AppointmentForm onAppointmentChanged={handleAppointmentUpdated} appointmentId={appointment.appointmentId} isUpdate={true} initialData={appointment} />
    </div>
  );
};

export default AppointmentUpdatePage;
