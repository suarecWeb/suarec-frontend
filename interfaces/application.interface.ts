import { Publication } from "./publication.interface";
import { User } from "./user.interface";

// interfaces/application.interface.ts
export interface Application {
  id?: string;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "INTERVIEW"
    | "IN_PROGRESS"
    | "COMPLETED";
  created_at: Date;
  updated_at?: Date;
  message?: string;
  price?: number;
  priceUnit?: string;

  // Relaciones
  userId: number;
  publicationId: string;
  user?: User;
  publication?: Publication;
}

export interface CreateApplicationDto {
  userId: number;
  publicationId: string;
  message?: string;
  price?: number;
  priceUnit?: string;
}

export interface UpdateApplicationDto {
  status: "ACCEPTED" | "REJECTED" | "INTERVIEW" | "IN_PROGRESS" | "COMPLETED";
  message?: string;
}
