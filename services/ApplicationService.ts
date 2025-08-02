// services/ApplicationService.ts
import api from "./axios_config";
import {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "@/interfaces/application.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

const baseURL = "/suarec/applications";

// Obtener aplicaciones con paginación
const getApplications = (params?: PaginationParams) =>
  api.get<PaginationResponse<Application>>(baseURL, { params });

// Obtener aplicaciones de una empresa específica
const getCompanyApplications = (companyId: string, params?: PaginationParams) =>
  api.get<PaginationResponse<Application>>(
    `/suarec/companies/${companyId}/applications`,
    { params },
  );

// Obtener aplicaciones de un usuario específico
const getUserApplications = (userId: string, params?: PaginationParams) =>
  api.get<PaginationResponse<Application>>(
    `/suarec/users/${userId}/applications`,
    { params },
  );

// Obtener aplicaciones de una publicación específica
const getPublicationApplications = (
  publicationId: string,
  params?: PaginationParams,
) =>
  api.get<PaginationResponse<Application>>(
    `/suarec/publications/${publicationId}/applications`,
    { params },
  );

// Obtener una aplicación por ID
const getApplicationById = (id: string) =>
  api.get<Application>(`${baseURL}/${id}`);

// Crear una nueva aplicación
const createApplication = (applicationData: CreateApplicationDto) =>
  api.post<Application>(baseURL, applicationData);

// Actualizar el estado de una aplicación con auto-agregado de empleado
const updateApplication = async (
  id: string,
  applicationData: UpdateApplicationDto,
) => {
  try {
    // Primero actualizamos la aplicación
    const response = await api.patch<Application>(
      `${baseURL}/${id}`,
      applicationData,
    );
    console.log("ACTUALIZANDO APLICACION");

    // Si la aplicación fue aceptada, automáticamente agregar como empleado
    if (applicationData.status === "ACCEPTED") {
      const application = response.data;

      // Verificar que tenemos toda la información necesaria
      const userId = application.user?.id || application.userId;
      const companyId = application.publication?.user?.company?.id;

      if (userId && companyId && !isNaN(Number(userId))) {
        try {
          // Agregar el usuario como empleado de la empresa
          await api.post(`suarec/companies/${companyId}/employees/${userId}`);
          console.log(
            `Usuario ${userId} agregado como empleado de la empresa ${companyId}`,
          );
        } catch (employeeError) {
          console.warn(
            "Error al agregar empleado automáticamente:",
            employeeError,
          );
          // No lanzamos el error para no afectar la actualización de la aplicación
        }
      } else {
        console.warn(
          `No se pudo agregar empleado automáticamente: userId=${userId}, companyId=${companyId}`,
        );
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// Eliminar una aplicación
const deleteApplication = (id: string) => api.delete(`${baseURL}/${id}`);

// Verificar si un usuario ya aplicó a una publicación
const checkUserApplication = (userId: string, publicationId: string) =>
  api.get<{ hasApplied: boolean; application?: Application }>(
    `${baseURL}/check/${userId}/${publicationId}`,
  );

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
