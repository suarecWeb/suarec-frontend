import { User } from "./user.interface";
import { Publication } from "./publication.interface";

export interface Comment {
  id: string;
  description: string;
  created_at: Date;
  publication: Publication;
  user: User;
}