// interfaces/work-contract.interface.ts
export interface WorkContract {
    id?: string;
    title: string;
    description?: string;
    agreed_price?: number;
    currency?: string;
    status: ContractStatus;
    type: ContractType;
    start_date?: Date;
    end_date?: Date;
    estimated_completion?: Date;
    location?: string;
    images?: string[];
    client_notes?: string;
    provider_notes?: string;
    created_at: Date;
    updated_at?: Date;
    client?: User;
    provider?: User;
    publication?: Publication;
    ratings?: Rating[];
  }
  
  export enum ContractStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED'
  }
  
  export enum ContractType {
    SERVICE = 'SERVICE',
    EMPLOYMENT = 'EMPLOYMENT'
  }
  
  export interface CreateWorkContractDto {
    title: string;
    description?: string;
    agreed_price?: number;
    currency?: string;
    type: ContractType;
    start_date?: Date;
    estimated_completion?: Date;
    location?: string;
    images?: string[];
    client_notes?: string;
    clientId: number;
    providerId: number;
    publicationId?: string;
  }
  
  export interface UpdateWorkContractDto {
    title?: string;
    description?: string;
    agreed_price?: number;
    currency?: string;
    status?: ContractStatus;
    start_date?: Date;
    end_date?: Date;
    estimated_completion?: Date;
    location?: string;
    images?: string[];
    client_notes?: string;
    provider_notes?: string;
  }
  
  export interface WorkHistory {
    asClient: {
      total: number;
      completed: number;
      inProgress: number;
      totalSpent: number;
    };
    asProvider: {
      total: number;
      completed: number;
      inProgress: number;
      totalEarned: number;
    };
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  }
  
  export interface Publication {
    id: string;
    title: string;
  }
  
  export interface Rating {
    id: string;
    stars: number;
    comment?: string;
  }