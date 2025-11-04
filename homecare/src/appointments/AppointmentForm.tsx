import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';

// import API_URL from '../apiConfig';

interface AppointmentFormProps {
  onAppointmentChanged: (newAppointment: Appointment) => void;
  appointmentId?: number;
  isUpdate?: boolean;
  initialData?: Appointment;  
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onAppointmentChanged, 
  appointmentId, 
  isUpdate = false,
  initialData}) =>  {
  const [subject, setSubject] = useState<string>(initialData?.subject || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [date, setDate] = useState<string>(
    initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : ''
  );
  const [patientId, setPatientId] = useState<number>(initialData?.patientId || 0);
  const [employeeId, setEmployeeId] = useState<number>(initialData?.employeeId || 0);
  // const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onCancel = () => {
    navigate(-1); // This will navigate back one step in the history
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const appointment: Appointment = { 
      appointmentId, 
      subject, 
      description, 
      date: new Date(date),
      patientId,
      employeeId
    };
    onAppointmentChanged(appointment); // Call the passed function with the appointment data
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formAppointmentSubject">
        <Form.Label>Subject</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter appointment subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          pattern="[0-9a-zA-ZæøåÆØÅ. \-]{2,50}" // Regular expression pattern
          title="The Subject must be numbers or letters and between 2 to 50 characters."
        />       
      </Form.Group>

      <Form.Group controlId="formAppointmentDate">
        <Form.Label>Date</Form.Label>
        <Form.Control
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formAppointmentDescription">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter appointment description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formAppointmentPatientId">
        <Form.Label>Patient ID</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter patient ID"
          value={patientId}
          onChange={(e) => setPatientId(Number(e.target.value))}
          required
          min="1"
        />
      </Form.Group>

      <Form.Group controlId="formAppointmentEmployeeId">
        <Form.Label>Employee ID</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter employee ID"
          value={employeeId}
          onChange={(e) => setEmployeeId(Number(e.target.value))}
          required
          min="1"
        />
      </Form.Group>
      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
      <Button variant="primary" type="submit">{isUpdate ? 'Update Appointment' : 'Create Appointment'}</Button>
      <Button variant="secondary" onClick={onCancel} className="ms-2">Cancel</Button>
    </Form>
  );
};

export default AppointmentForm;