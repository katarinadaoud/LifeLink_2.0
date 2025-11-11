// src/types/medication.ts
export interface Medication {
  medicineName: string;        // brukes som unik ID
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  instructions?: string;
  patientName?: string;
  patientId?: number;
 
}

export type NewMedication = Medication;
// DTO for å opprette en ny medisin (brukes av MedicationCreatePage)
export type NewMedicationDto = {
  patientId: number;
  medicineName: string;
  indication?: string;
  dosage?: string;
  startDate?: string;
  endDate?: string | null;
};


