import { Role } from "./role.interface";
import { Company } from "./company.interface";
import { Publication } from "./publication.interface";
import { Comment } from "./comment.interface";

export interface User {
  id?: string
  email: string
  password?: string
  name: string
  cellphone: string
  genre: string
  born_at: Date
  cv_url?: string
  created_at?: Date
  roles?: string[] | { id: string; name: string }[] | undefined

  // Relaciones
  company?: Company
  publications?: Publication[]
  comments?: Comment[]
}

export // Interfaces para los DTOs
interface CreateUserDto {
  name: string;
  password: string;
  cv_url?: string;
  genre: string;
  cellphone: string;
  email: string;
  born_at: Date;
  roles?: string[];
  companyId?: string;
}
