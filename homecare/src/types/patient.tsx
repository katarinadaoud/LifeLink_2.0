import type { Appointment } from "./appointment";
import type { User } from "./user";

export interface Patient {
    patientId?: number;
    fullName: string;
    address: string;
    healthRelated_info: string;
    phoneNumber: string;

    userId: string; // Foreign key to User

    user?: User;
    appointments?: Appointment[];

}   