import type { Employee } from "./employee";
import type { Patient } from "./patient";

export interface Appointment {
    appointmentId?: number;
    subject: string;
    description: string;
    date: Date;

    patientId: number; // Foreign key to Patient
    employeeId: number; // Foreign key to Employee

    // Display names for better user experience
    patientName?: string;
    employeeName?: string;

    patient?: Patient;
    employee?: Employee;
}