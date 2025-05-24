// services/ApplicationService.ts
import api from "./axios_config";
import { Application, CreateApplicationDto, UpdateApplicationDto } from "@/interfaces/application.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

const baseURL = "/applications";

// Obtener aplicaciones con paginación
const getApplications = (params?: PaginationParams) => 
  api.get<PaginationResponse<Application>>(baseURL, { params });

// Obtener aplicaciones de una empresa específica
const getCompanyApplications = (companyId: string, params?: PaginationParams) => 
  api.get<PaginationResponse<Application>>(`/companies/${companyId}/applications`, { params });

// Obtener aplicaciones de un usuario específico
const getUserApplications = (userId: string, params?: PaginationParams) => 
  api.get<PaginationResponse<Application>>(`/users/${userId}/applications`, { params });

// Obtener aplicaciones de una publicación específica
const getPublicationApplications = (publicationId: string, params?: PaginationParams) => 
  api.get<PaginationResponse<Application>>(`/publications/${publicationId}/applications`, { params });

// Obtener una aplicación por ID
const getApplicationById = (id: string) => 
  api.get<Application>(`${baseURL}/${id}`);

// Crear una nueva aplicación
const createApplication = (applicationData: CreateApplicationDto) => 
  api.post<Application>(baseURL, applicationData);

// Actualizar el estado de una aplicación
const updateApplication = (id: string, applicationData: UpdateApplicationDto) => 
  api.patch<Application>(`${baseURL}/${id}`, applicationData);

// Eliminar una aplicación
const deleteApplication = (id: string) => 
  api.delete(`${baseURL}/${id}`);

// Verificar si un usuario ya aplicó a una publicación
const checkUserApplication = (userId: string, publicationId: string) => 
  api.get<{ hasApplied: boolean, application?: Application }>(`${baseURL}/check/${userId}/${publicationId}`);

const ApplicationService = {
  getApplications,
  getCompanyApplications,
  getUserApplications,
  getPublicationApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  checkUserApplication,
};

export default ApplicationService;