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