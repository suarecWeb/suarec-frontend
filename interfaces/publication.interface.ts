import { User } from "./user.interface";
import { Comment } from "./comment.interface";

export enum PublicationType {
  SERVICE = "SERVICE",
  JOB = "JOB",
}

export interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: string | Date;
  modified_at: Date;
  deleted_at?: Date;
  category: string;
  type?: PublicationType; // Nuevo campo para distinguir el tipo
  image_url?: string;
  visitors?: number;
  price?: number;
  priceUnit?: string;
  gallery_images?: string[];
  likes?: any[];
  likesCount?: number;
  hasLiked?: boolean;
  userId: number;
  user?: User;
  comments?: Comment[];
}
