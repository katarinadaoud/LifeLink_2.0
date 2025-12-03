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
  onAppointmentChanged: (newAppointment: Appointment) => Promise<void>; // Callback to parent when form is submitted
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
  const [date, setDate] = useState<string>(() => {
    if (!initialData?.date) return '';
    // Format date for datetime-local input while preserving local time
    // We manually extract date components to avoid timezone conversion issues
    // (using toISOString() would convert to UTC and change the time)
    const d = new Date(initialData.date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
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

  // Client-side validation functions
  const validateSubject = (subject: string): string | null => {
    if (!subject.trim()) {
      return 'Subject is required';
    }
    if (subject.trim().length < 2) {
      return 'Subject must be at least 2 characters long';
    }
    if (subject.length > 50) {
      return 'Subject must be 50 characters or less';
    }
    if (!/^[0-9a-zA-ZæøåÆØÅ. \-]+$/.test(subject)) {
      return 'Subject can only contain letters, numbers, spaces, periods, and hyphens';
    }
    return null;
  };

  const validateDate = (date: string): string | null => {
    if (!date.trim()) {
      return 'Date and time are required';
    }
    
    const selectedDate = new Date(date);
    const currentDate = new Date();
    
    if (isNaN(selectedDate.getTime())) {
      return 'Please enter a valid date and time';
    }
    
    if (selectedDate.getFullYear() < 2025) {
      return 'Appointment date must be in 2025 or later';
    }
    
    if (selectedDate < currentDate) {
      return 'Appointment date must be in the future';
    }
    
    return null;
  };

  const validateEmployeeId = (employeeId: number): string | null => {
    if (!employeeId || employeeId === 0) {
      return 'Please select a healthcare provider';
    }
    return null;
  };

  const validatePatientId = (patientId: number): string | null => {
    if (user?.role !== 'Patient' && (!patientId || patientId === 0)) {
      return 'Please select a patient';
    }
    return null;
  };

  // Handle input changes with real-time validation
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubject(value);
    const error = validateSubject(value);
    setValidationErrors(prev => ({ ...prev, subject: error || '' }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDate(value);
    const error = validateDate(value);
    setValidationErrors(prev => ({ ...prev, date: error || '' }));
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setEmployeeId(value);
    const error = validateEmployeeId(value);
    setValidationErrors(prev => ({ ...prev, employeeId: error || '' }));
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(e.target.value);
    setPatientId(value);
    const error = validatePatientId(value);
    setValidationErrors(prev => ({ ...prev, patientId: error || '' }));
  };

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
    
    // Validate all fields before submission
    const errors = {
      subject: validateSubject(subject) || '',
      date: validateDate(date) || '',
      employeeId: validateEmployeeId(employeeId) || '',
      patientId: validatePatientId(patientId) || ''
    };

    setValidationErrors(errors);
    
    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setFormError('Please fix the validation errors before submitting');
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
    }
    
    // Create date that preserves the selected local time when sent to server
    // We use Date.UTC() to create a UTC date from the local time components
    // This prevents JavaScript from adding timezone offset (which would change 15:00 to 14:00)
    const localDate = new Date(date);
    const utcDate = new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes()
    ));
    
    const appointment: Appointment = { 
      appointmentId, 
      subject, 
      description, 
      date: utcDate,
      patientId: finalPatientId,
      employeeId,
      // For updates, preserve the existing confirmation status from initialData
      // For new appointments, start as pending (false)
      isConfirmed: isUpdate && initialData ? initialData.isConfirmed : false
    };
    
    // Let the parent component decide whether this becomes a POST or PUT
    try {
      await onAppointmentChanged(appointment); // Call the passed function with the appointment data
    } catch (error: any) {
      // Display backend validation errors
      setFormError(error.message || 'Failed to save appointment');
    }
  };

  // While we are still loading employees/patients, show a simple loading message
  if (loading) {
    return <div>Loading form data...</div>;
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {/* Subject field with validation */}
      <Form.Group controlId="formAppointmentSubject">
        <Form.Label>Subject *</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter appointment subject"
          value={subject}
          onChange={handleSubjectChange}
          isInvalid={!!validationErrors.subject}
          required
        />
        <Form.Control.Feedback type="invalid">
          {validationErrors.subject}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Date/time input for the appointment with validation */}
      <Form.Group controlId="formAppointmentDate">
        <Form.Label>Date and Time *</Form.Label>
          <Form.Control
            type="datetime-local"
            value={date}
            onChange={handleDateChange}
            min={minDateTime}
            isInvalid={!!validationErrors.date}
            required
          />
          <Form.Control.Feedback type="invalid">
            {validationErrors.date}
          </Form.Control.Feedback>
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

      {/* Patient selection - only shown for employees/admins with validation */}
      {user?.role !== 'Patient' && (
        <Form.Group controlId="formAppointmentPatientId">
          <Form.Label>Patient *</Form.Label>
          <Form.Select
            value={patientId}
            onChange={handlePatientChange}
            disabled={loading}
            isInvalid={!!validationErrors.patientId}
            required
          >
            <option value={0}>Select a patient...</option>
            {patients.map((patient) => (
              <option key={patient.patientId} value={patient.patientId}>
                {patient.fullName}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {validationErrors.patientId}
          </Form.Control.Feedback>
        </Form.Group>
      )}

      {/* Employee (healthcare provider) dropdown with validation */}
      <Form.Group controlId="formAppointmentEmployeeId">
        <Form.Label>{user?.role === 'Patient' ? 'Healthcare Provider *' : 'Employee *'}</Form.Label>
        <Form.Select
          value={employeeId}
          onChange={handleEmployeeChange}
          disabled={loading}
          isInvalid={!!validationErrors.employeeId}
          required
        >
          <option value={0}>{user?.role === 'Patient' ? 'Select a healthcare provider...' : 'Select an employee...'}</option>
          {employees.map((employee) => (
            <option key={employee.employeeId} value={employee.employeeId}>
              {employee.fullName}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {validationErrors.employeeId}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Display error message if validation fails */}
      {formError && <div className="alert alert-danger mt-3">{formError}</div>}

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
