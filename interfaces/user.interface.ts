import { Role } from "./role.interface";
import { Company } from "./company.interface";
import { Publication } from "./publication.interface";
import { Comment } from "./comment.interface";

export interface User {
  id: string;
  name: string;
  password: string;
  cv_url: string | null;
  age: number;
  genre: string;
  cellphone: string;
  email: string;
  born_at: Date;
  created_at: Date;
  role: Role;
  company: Company | null;
  publications: Publication[] | null;
  comments: Comment[] | null;
}