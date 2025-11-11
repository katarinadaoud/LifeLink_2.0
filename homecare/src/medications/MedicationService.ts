// src/medications/MedicationService.ts
import type { Medication } from "../types/medication";

const API_URL = import.meta.env.VITE_API_URL;

const makeHeaders = (token?: string): HeadersInit => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Håndterer svar og kaster feil ved behov
const handle = async <T>(res: Response): Promise<T> => {
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
};

// EMPLOYEE: hent alle medisiner
export async function getAllMedications(token: string): Promise<Medication[]> {
  const res = await fetch(`${API_URL}/api/medication`, {
    method: "GET",
    headers: makeHeaders(token),
  });
  return handle<Medication[]>(res);
}

// PATIENT: hent egne medisiner
export async function getMyMedications(token: string): Promise<Medication[]> {
  const res = await fetch(`${API_URL}/api/medication/my`, {
    method: "GET",
    headers: makeHeaders(token),
  });
  return handle<Medication[]>(res);
}

// Hent én medisin (f.eks. etter navn)
export async function getMedication(
  medicineName: string,
  token: string
): Promise<Medication> {
  const res = await fetch(`${API_URL}/api/medication/${medicineName}`, {
    method: "GET",
    headers: makeHeaders(token),
  });
  return handle<Medication>(res);
}

// Opprett ny medisin
export async function createMedication(
  data: Partial<Medication>,
  token: string
): Promise<Medication> {
  const res = await fetch(`${API_URL}/api/medication`, {
    method: "POST",
    headers: makeHeaders(token),
    body: JSON.stringify(data),
  });
  return handle<Medication>(res);
}

// Oppdater eksisterende medisin
export async function updateMedication(
  medicineName: string,
  data: Partial<Medication>,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/medication/${medicineName}`, {
    method: "PUT",
    headers: makeHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
}

// Slett medisin
export async function deleteMedication(
  medicineName: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/medication/${medicineName}`, {
    method: "DELETE",
    headers: makeHeaders(token),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
}
