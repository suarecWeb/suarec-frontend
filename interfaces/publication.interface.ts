import { User } from "./user.interface";
import { Comment } from "./comment.interface";

export interface Publication {
  id: string;
  title: string;
  description?: string; // Optional description
  modified_at: Date;
  created_at: Date;
  category: string;
  image_url?: string; // Optional image URL
  visitors?: number; // Optional visitor count
  user: User;
  comments: Comment[];
}
  