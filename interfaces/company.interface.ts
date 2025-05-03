import { User } from "./user.interface";

export interface Company {
  id?: string;
  nit: string;
  name: string;
  born_at: Date;
  created_at: Date;
  email: string;
  cellphone: string;
  userId: string;
  user: User | null;
}

// Actualizado para coincidir exactamente con el DTO del backend
export interface CreateCompanyDto {
  nit: string;
  name: string;
  born_at: Date; // No modificar este tipo, el backend espera Date
  created_at: Date; // No modificar este tipo, el backend espera Date
  email: string;
  cellphone: string;
  userId: number; // Mantener como number porque el backend lo necesita así
}