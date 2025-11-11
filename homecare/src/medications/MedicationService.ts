// src/medications/MedicationService.ts
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
    if (response.status === 204) { // Delete returns 204 No content
      return null;
    }
    return response.json(); // other returns response body as JSON
  } else {
    const errorText = await response.text();
    throw new Error(errorText || 'Network response was not ok');
  }
};

// EMPLOYEE: hent alle medisiner
export async function getAllMedications(): Promise<Medication[]> {
  const response = await fetch(`${API_URL}/api/medication`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Get medications by patient ID
export async function getMedicationsByPatientId(patientId: number): Promise<Medication[]> {
  const response = await fetch(`${API_URL}/api/medication/patient/${patientId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// PATIENT: hent egne medisiner (deprecated - use getMedicationsByPatientId instead)
export async function getMyMedications(): Promise<Medication[]> {
  const response = await fetch(`${API_URL}/api/medication/my`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Hent én medisin (f.eks. etter navn)
export async function getMedication(medicationName: string): Promise<Medication> {
  const response = await fetch(`${API_URL}/api/medication/${medicationName}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// Opprett ny medisin
export async function createMedication(data: Partial<Medication>): Promise<Medication> {
  const response = await fetch(`${API_URL}/api/medication`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

// Oppdater eksisterende medisin
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

// Slett medisin
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
