import { User } from "./user.interface";
import { Comment } from "./comment.interface";

export interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: Date;
  modified_at: Date;
  category: string;
  image_url?: string;
  visitors?: number;
  userId: number;
  user?: User;
  comments?: Comment[];
}
  