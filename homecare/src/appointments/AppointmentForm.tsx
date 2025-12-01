import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import type { Employee } from '../types/employee';
import type { Patient } from '../types/patient';
import { fetchEmployees, fetchPatients, fetchPatientByUserId } from './AppointmentService';
import { useAuth } from '../auth/AuthContext';

// Reusable form component for both creating and updating appointments
interface AppointmentFormProps {
  onAppointmentChanged: (newAppointment: Appointment) => void; // Callback to parent when form is submitted
  appointmentId?: number;                                      // Optional ID (used when updating)
  isUpdate?: boolean;                                          // Flag to distinguish create vs update
  initialData?: Appointment;                                   // Optional initial values when editing
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onAppointmentChanged, 
  appointmentId, 
  isUpdate = false,
  initialData}) =>  {

  // Local form fields, prefilled from initialData when updating
  const [subject, setSubject] = useState<string>(initialData?.subject || '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [date, setDate] = useState<string>(
    initialData?.date ? new Date(initialData.date).toISOString().slice(0, 16) : ''
  );
  const [formError, setFormError] = useState<string | null>(null);
  // Compute local min date/time string for <input type="datetime-local">
  const now = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const minDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const [patientId, setPatientId] = useState<number>(initialData?.patientId || 0);
  const [employeeId, setEmployeeId] = useState<number>(initialData?.employeeId || 0);

  // Lists used for select dropdowns
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // When the logged-in user is a patient, we store their patient record here
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);

  // Simple loading flag while we fetch employees/patients
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { user } = useAuth(); // Get current authenticated user and role

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Always fetch employees for the dropdown
        const employeesData = await fetchEmployees();
        setEmployees(employeesData);

        // If the logged-in user is a patient, we only load their own patient record
        if (user?.role === 'Patient') {
          const userId = user.sub || user.nameid; // Support different claim names
          const patientData = await fetchPatientByUserId(userId);
          setCurrentPatient(patientData);
          setPatientId(patientData.patientId || 0);
        } else {
          // For employees/admins we load all patients so they can choose from the list
          const patientsData = await fetchPatients();
          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only attempt to load data once we know who the user is
    if (user) {
      loadData();
    }
  }, [user]);

  // Simple "go back" handler for the Cancel button
  const onCancel = () => {
    navigate(-1); // This will navigate back one step in the history
  };

  // Handle submit for both create and update
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    
    // Prevent submission if date is missing or in the past (compared to now)
    if (!date || new Date(date) < new Date()) {
      setFormError('Appointment date must be in the future');
      return;
    }
    
    // Validate employee selection
    if (!employeeId || employeeId === 0) {
      setFormError('Please select a healthcare provider');
      return;
    }
    
    // Validate patient selection (for employees) or use currentPatient (for patients)
    let finalPatientId = patientId;
    if (user?.role === 'Patient') {
      if (!currentPatient?.patientId) {
        setFormError('Unable to identify patient. Please complete your profile first.');
        return;
      }
      finalPatientId = currentPatient.patientId;
    } else {
      if (!patientId || patientId === 0) {
        setFormError('Please select a patient');
        return;
      }
    }
    
    const appointment: Appointment = { 
      appointmentId, 
      subject, 
      description, 
      date: new Date(date),
      patientId: finalPatientId,
      employeeId,
      isConfirmed: false // New appointments start as pending requests
    };
    
    // Let the parent component decide whether this becomes a POST or PUT
    onAppointmentChanged(appointment); // Call the passed function with the appointment data
  };

  // While we are still loading employees/patients, show a simple loading message
  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* Subject field with basic pattern validation */}
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

      {/* Date/time input for the appointment */}
      <Form.Group controlId="formAppointmentDate">
        <Form.Label>Date</Form.Label>
          <Form.Control
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={minDateTime}
          />
          {formError && <div className="form-error">{formError}</div>}
      </Form.Group>

      {/* Optional free-text description of the appointment */}
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

      {/* Patient selection - only shown for employees/admins */}
      {user?.role !== 'Patient' && (
        <Form.Group controlId="formAppointmentPatientId">
          <Form.Label>Patient</Form.Label>
          <Form.Control
            as="select"
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            required
            disabled={loading}
          >
            <option value={0}>Select a patient...</option>
            {patients.map((patient) => (
              <option key={patient.patientId} value={patient.patientId}>
                {patient.fullName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      {/* Employee (healthcare provider) dropdown */}
      <Form.Group controlId="formAppointmentEmployeeId">
        <Form.Label>{user?.role === 'Patient' ? 'Healthcare Provider' : 'Employee'}</Form.Label>
        <Form.Control
          as="select"
          value={employeeId}
          onChange={(e) => setEmployeeId(Number(e.target.value))}
          required
          disabled={loading}
        >
          <option value={0}>{user?.role === 'Patient' ? 'Select a healthcare provider...' : 'Select an employee...'}</option>
          {employees.map((employee) => (
            <option key={employee.employeeId} value={employee.employeeId}>
              {employee.fullName}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Submit and cancel buttons – wrapped with extra top spacing */}
      <div className="mt-4 d-flex">
        <Button className="btn btn-teal" type="submit">
          {isUpdate ? 'Update Appointment' : 'Create Appointment'}
        </Button>
        <Button className="btn btn-delete ms-2" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
};

export default AppointmentForm;  
