import { User } from "./user.interface";
import { Comment } from "./comment.interface";

export interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: string | Date;
  modified_at: Date;
  category: string;
  publicationType: string; // SERVICE_OFFER, SERVICE_REQUEST, COMPANY_SERVICE_OFFER, COMPANY_JOB_OFFER, INFORMAL_JOB_OFFER
  image_url?: string;
  visitors?: number;
  price?: number;
  priceUnit?: string;
  userId: number;
  user?: User;
  comments?: Comment[];
}
  