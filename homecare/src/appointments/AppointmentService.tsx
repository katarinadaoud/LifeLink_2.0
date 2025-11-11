const API_URL = import.meta.env.VITE_API_URL;

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
    const errorText = await response.text();
    throw new Error(errorText || 'Network response was not ok');
  }
};

// Get appointment list
export const fetchAppointments = async () => {
  const response = await fetch(`${API_URL}/api/Appointment`);
  return handleResponse(response);
};

// Get appointments by patient ID
export const fetchAppointmentsByPatientId = async (patientId: number) => {
  const response = await fetch(`${API_URL}/api/Appointment/patient/${patientId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
// Get appointment by id
export const fetchAppointmentById = async (appointmentId: string) => {
  const response = await fetch(`${API_URL}/api/Appointment/${appointmentId}`);
  return handleResponse(response);
};
// Post create appointment
export const createAppointment = async (appointment: any) => {
  const response = await fetch(`${API_URL}/api/Appointment`, {
    method: 'POST',
    headers: getAuthHeaders(), // Use the new helper here
    body: JSON.stringify(appointment),
  });
  return handleResponse(response);
};
// Put update appointment
export const updateAppointment = async (appointmentId: number, appointment: any) => {
  const response = await fetch(`${API_URL}/api/Appointment/${appointmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(), // Use the new helper here
    body: JSON.stringify(appointment),
  });
  return handleResponse(response);
};
// Delete appointment
export const deleteAppointment = async (appointmentId: number) => {
  const response = await fetch(`${API_URL}/api/Appointment/${appointmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(), // Use the new helper here
  });
  return handleResponse(response);
};

// Get all employees
export const fetchEmployees = async () => {
  const response = await fetch(`${API_URL}/api/Employee`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get all patients
export const fetchPatients = async () => {
  const response = await fetch(`${API_URL}/api/Patient`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get patient by userId (for current user)
export const fetchPatientByUserId = async (userId: string) => {
  const response = await fetch(`${API_URL}/api/Patient/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};