// src/types/medication.ts
export interface Medication {
  medicationName: string;        
  dosage: string;                
  frequency?: string; // optional since backend doesn't have this
  startDate: string;            
  endDate?: string | null;       
  instructions?: string;
  patientName?: string;          
  patientId?: number;           
  indication?: string;          
 
}

export type NewMedication = Medication;
// DTO for creating a new medication
export type NewMedicationDto = {
  patientId: number;             
  medicationName: string;       
  indication?: string;           
  dosage?: string;               
  startDate?: string;            
  endDate?: string | null;       
};


