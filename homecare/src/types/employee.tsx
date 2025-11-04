import type { Appointment } from "./appointment";
import type { User } from "./user";

export interface Employee {
    employeeId?: number;
    fullName: string;
    address: string;
    department: string;

    userId: string; // Foreign key to User

    user?: User;
    appointments?: Appointment[];
}
    