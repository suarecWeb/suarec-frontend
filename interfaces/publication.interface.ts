import { User } from "./user.interface";
import { Comment } from "./comment.interface";

export enum PublicationType {
  // Tipos de servicios
  SERVICE = "SERVICE", // Usuario ofrece servicios (OFERTA)
  SERVICE_REQUEST = "SERVICE_REQUEST", // Usuario busca servicios (SOLICITUD)

  // Tipos de empleos
  JOB = "JOB", // Empresa ofrece vacante
}

export interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: string | Date;
  modified_at: Date;
  deleted_at?: Date;
  category: string;
  type: PublicationType; // Tipo de publicación
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

  // Campos específicos para solicitudes de servicios
  requirements?: string; // Requisitos del trabajo
  location?: string; // Ubicación del trabajo
  urgency?: string; // Urgencia: "LOW", "MEDIUM", "HIGH"
  preferredSchedule?: string; // Horario preferido
}
