// services/WorkContractService.ts
import api from "./axios_config";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

export interface WorkContract {
  id: string;
  title: string;
  description?: string;
  agreed_price?: number;
  currency?: string;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED";
  type: "SERVICE" | "EMPLOYMENT";
  start_date?: Date;
  end_date?: Date;
  estimated_completion?: Date;
  location?: string;
  images?: string[];
  client_notes?: string;
  provider_notes?: string;
  created_at: Date;
  updated_at: Date;
  client: {
    id: number;
    name: string;
    email: string;
  };
  provider: {
    id: number;
    name: string;
    email: string;
  };
  publication?: {
    id: string;
    title: string;
  };
  ratings?: any[];
}

export interface CreateWorkContractDto {
  title: string;
  description?: string;
  agreed_price?: number;
  currency?: string;
  type: "SERVICE" | "EMPLOYMENT";
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
  status?:
    | "PENDING"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "DISPUTED";
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

const baseURL = "/suarec/work-contracts";

// Crear un nuevo contrato de trabajo
const createWorkContract = (contractData: CreateWorkContractDto) =>
  api.post<WorkContract>(baseURL, contractData);

// Obtener todos los contratos (solo admin)
const getWorkContracts = (params?: PaginationParams) =>
  api.get<PaginationResponse<WorkContract>>(baseURL, { params });

// Obtener contratos de un usuario específico
const getUserWorkContracts = (
  userId: string,
  params?: PaginationParams,
  role?: "client" | "provider",
) =>
  api.get<PaginationResponse<WorkContract>>(`${baseURL}/user/${userId}`, {
    params: { ...params, role },
  });

// Obtener historial de trabajo de un usuario
const getUserWorkHistory = (userId: string) =>
  api.get<WorkHistory>(`${baseURL}/user/${userId}/history`);

// Obtener un contrato por ID
const getWorkContractById = (id: string) =>
  api.get<WorkContract>(`${baseURL}/${id}`);

// Actualizar un contrato
const updateWorkContract = (id: string, contractData: UpdateWorkContractDto) =>
  api.put<WorkContract>(`${baseURL}/${id}`, contractData);

// Eliminar un contrato
const deleteWorkContract = (id: string) => api.delete(`${baseURL}/${id}`);

const WorkContractService = {
  createWorkContract,
  getWorkContracts,
  getUserWorkContracts,
  getUserWorkHistory,
  getWorkContractById,
  updateWorkContract,
  deleteWorkContract,
};

export default WorkContractService;
