import { User } from "./user.interface";

export interface Company {
  id: string;
  nit: string; // Unique identifier (possibly tax ID)
  name: string;
  born_at: Date;
  created_at: Date;
  email: string;
  cellphone: string;
  user: User | null; // One-to-one relationship with User
}