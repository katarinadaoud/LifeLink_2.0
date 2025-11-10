import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import type { Appointment } from '../types/appointment';
import type { Employee } from '../types/employee';
import type { Patient } from '../types/patient';
import { fetchEmployees, fetchPatients, fetchPatientByUserId } from './AppointmentService';
import { useAuth } from '../auth/AuthContext';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Always fetch employees
        const employeesData = await fetchEmployees();
        setEmployees(employeesData);

        // If user is a Patient, only fetch their own data
        if (user?.role === 'Patient') {
          const userId = user.sub || user.nameid;
          const patientData = await fetchPatientByUserId(userId);
          setCurrentPatient(patientData);
          setPatientId(patientData.patientId || 0);
        } else {
          // If user is Employee, fetch all patients
          const patientsData = await fetchPatients();
          setPatients(patientsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

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

  if (loading) {
    return <div>Loading form data...</div>;
  }

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
        <Form.Label>Patient</Form.Label>
        {user?.role === 'Patient' && currentPatient ? (
          <Form.Control
            type="text"
            value={currentPatient.fullName}
            disabled
            style={{ backgroundColor: '#f8f9fa' }}
          />
        ) : (
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
        )}
      </Form.Group>

      <Form.Group controlId="formAppointmentEmployeeId">
        <Form.Label>Employee</Form.Label>
        <Form.Control
          as="select"
          value={employeeId}
          onChange={(e) => setEmployeeId(Number(e.target.value))}
          required
          disabled={loading}
        >
          <option value={0}>Select an employee...</option>
          {employees.map((employee) => (
            <option key={employee.employeeId} value={employee.employeeId}>
              {employee.fullName}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
      <Button variant="primary" type="submit">{isUpdate ? 'Update Appointment' : 'Create Appointment'}</Button>
      <Button variant="secondary" onClick={onCancel} className="ms-2">Cancel</Button>
    </Form>
  );
};

export default AppointmentForm;