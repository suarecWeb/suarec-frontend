import { Publication } from "./publication.interface";
import { User } from "./user.interface";

// interfaces/application.interface.ts
export interface Application {
    id?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW' | 'NEGOTIATING';
    created_at: Date;
    updated_at?: Date;
    message?: string;
    suggestedPrice?: number;
    counterOfferPrice?: number;
    
    // Relaciones
    userId: number;
    publicationId: string;
    user?: User,
    publication?: Publication,
  }
  
  export interface CreateApplicationDto {
    userId: number;
    publicationId: string;
    message?: string;
    suggestedPrice?: number;
  }
  
  export interface UpdateApplicationDto {
    status: 'ACCEPTED' | 'REJECTED' | 'INTERVIEW' | 'NEGOTIATING';
    message?: string;
    counterOfferPrice?: number;
  }