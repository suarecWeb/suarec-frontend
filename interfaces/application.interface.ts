import { Publication } from "./publication.interface";
import { User } from "./user.interface";

// interfaces/application.interface.ts
export interface Application {
    id?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    created_at: Date;
    updated_at?: Date;
    message?: string;
    
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
  }
  
  export interface UpdateApplicationDto {
    status: 'ACCEPTED' | 'REJECTED';
    message?: string;
  }