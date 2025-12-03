import type { Medication } from "../types/medication";



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
    if (response.status === 204) { // delete returns 204 - No content
      return null;
    }
    return response.json(); // returns response body as JSON
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

// employee: get all medications
export async function getAllMedications(): Promise<Medication[]> {
  const response = await fetch(`${API_URL}/api/medication`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Get medications by patientID
export async function getMedicationsByPatientId(patientId: number): Promise<Medication[]> {
  const response = await fetch(`${API_URL}/api/medication/patient/${patientId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Patient: get my medications. d
export async function getMyMedications(): Promise<Medication[]> {
  const response = await fetch(`${API_URL}/api/medication/my`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// get medication by name 
export async function getMedication(medicationName: string): Promise<Medication> {
  const response = await fetch(`${API_URL}/api/medication/${medicationName}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// create new medication
export async function createMedication(data: Partial<Medication>): Promise<Medication> {
  const response = await fetch(`${API_URL}/api/medication`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// update existing medication
export async function updateMedication(
  medicationName: string,
  data: Partial<Medication>
): Promise<void> {
  const response = await fetch(`${API_URL}/api/medication/${medicationName}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// delete medication by name
export async function deleteMedication(medicationName: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/medication/${medicationName}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Get patient by userId (for current user)
export async function fetchPatientByUserId(userId: string) {
  const response = await fetch(`${API_URL}/api/Patient/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Get all patients
export async function fetchPatients() {
  const response = await fetch(`${API_URL}/api/Patient`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
