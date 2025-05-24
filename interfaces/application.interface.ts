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
    user?: {
      id: string;
      name: string;
      email: string;
      cellphone: string;
      cv_url?: string;
      profession?: string;
      skills?: string[];
    };
    publication?: {
      id: string;
      title: string;
      category: string;
    };
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