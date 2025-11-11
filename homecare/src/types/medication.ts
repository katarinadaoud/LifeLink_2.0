// src/types/medication.ts
export interface Medication {
  medicationName: string;        // brukes som unik ID
  dosage: string;                // camelCase som appointment
  frequency?: string;            // optional since backend doesn't have this
  startDate: string;             // camelCase som appointment
  endDate?: string | null;       // camelCase som appointment
  instructions?: string;
  patientName?: string;          // camelCase som appointment
  patientId?: number;            // camelCase som appointment
  indication?: string;           // camelCase som appointment
 
}

export type NewMedication = Medication;
// DTO for å opprette en ny medisin (brukes av MedicationCreatePage)
export type NewMedicationDto = {
  patientId: number;             // camelCase som appointment  
  medicationName: string;        // matcher backend DTO
  indication?: string;           // camelCase som appointment
  dosage?: string;               // camelCase som appointment
  startDate?: string;            // camelCase som appointment
  endDate?: string | null;       // camelCase som appointment
};


