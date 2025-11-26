import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from './AppointmentForm';
import type { Appointment } from '../types/appointment';
import * as AppointmentService from './AppointmentService';

const AppointmentCreatePage: React.FC = () => {
  const navigate = useNavigate(); //Create a navigate function

  const handleAppointmentCreated = async (appointment: Appointment) => {
    try {
      const data = await AppointmentService.createAppointment(appointment);
      console.log('Appointment created successfully:', data);
      navigate('/appointments'); // Navigate back after successful creation
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }
  
  return (
    <div>
      <h2>Create New Appointment</h2>
      <AppointmentForm onAppointmentChanged={handleAppointmentCreated}/>
    </div>
  );
};

export default AppointmentCreatePage;