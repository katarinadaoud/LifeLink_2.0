import type { Appointment } from '../types/appointment';
import { API_BASE_URL } from '../shared/apiBase';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.ok) {  // HTTP status code success 200-299
    if (response.status === 204) { // Detele returns 204 No content
      return null;
    }
    return response.json(); // other returns response body as JSON
  } else {
    // Handle expired or invalid authentication token
    if (response.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login page
      throw new Error('Your session has expired. Please log in again.');
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Network response was not ok');
  }
};

// Get appointment list
export const fetchAppointments = async () => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get appointments by patient ID
export const fetchAppointmentsByPatientId = async (patientId: number) => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment/patient/${patientId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
// Get appointment by id
export const fetchAppointmentById = async (appointmentId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment/${appointmentId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
// Post create appointment
export const createAppointment = async (appointment: Omit<Appointment, 'appointmentId'>) => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment`, {
    method: 'POST',
    headers: getAuthHeaders(), // Use the new helper here
    body: JSON.stringify(appointment),
  });
  return handleResponse(response);
};
// Put update appointment
export const updateAppointment = async (appointmentId: number, appointment: Partial<Appointment>) => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment/${appointmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(), // Use the new helper here
    body: JSON.stringify(appointment),
  });
  return handleResponse(response);
};
// Delete appointment
export const deleteAppointment = async (appointmentId: number) => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment/${appointmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), // Use the new helper here
  });
  return handleResponse(response);
};

// Get all employees
export const fetchEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/api/Employee`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get all patients
export const fetchPatients = async () => {
  const response = await fetch(`${API_BASE_URL}/api/Patient`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get patient by userId (for current user)
export const fetchPatientByUserId = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/Patient/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get employee by userId (for current user)
export const fetchEmployeeByUserId = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/Employee/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Confirm appointment (employee confirms patient request)
export const confirmAppointment = async (appointmentId: number) => {
  const response = await fetch(`${API_BASE_URL}/api/Appointment/${appointmentId}/confirm`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
