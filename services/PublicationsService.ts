// services/PublicationsService.ts
import api from "./axios_config";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Publication, PublicationType } from "@/interfaces/publication.interface";

const baseURL = "/suarec/publications";

// Estructura de respuesta de publicación
const getPublications = (params?: PaginationParams & { type?: PublicationType }) => {
  return api.get<PaginationResponse<Publication>>(baseURL, { params });
};

const getServiceOffers = (params?: PaginationParams) => {
  return api.get<PaginationResponse<Publication>>(`${baseURL}/service-offers`, { params });
};

const getServiceRequests = (params?: PaginationParams) => {
  return api.get<PaginationResponse<Publication>>(`${baseURL}/service-requests`, { params });
};

const getPublicationById = (id: string) => {
  return api.get<Publication>(`${baseURL}/${id}`);
};

const createPublication = (publicationData: Publication) => {
  return api.post<Publication>(baseURL, publicationData);
};

const updatePublication = (
  id: string,
  publicationData: Partial<Publication>,
) => {
  return api.patch<Publication>(`${baseURL}/${id}`, publicationData);
};

// Soft delete - ahora marca como eliminada en lugar de eliminar físicamente
const deletePublication = (id: string) => {
  return api.delete(`${baseURL}/${id}`);
};

// Obtener publicaciones eliminadas (solo para admins)
const getDeletedPublications = (params?: PaginationParams) => {
  return api.get<PaginationResponse<Publication>>(`${baseURL}/deleted`, { params });
};

// Restaurar publicación eliminada (solo para admins)
const restorePublication = (id: string) => {
  return api.post<Publication>(`${baseURL}/${id}/restore`);
};

const PublicationService = {
  getPublications,
  getServiceOffers,
  getServiceRequests,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  getDeletedPublications,
  restorePublication,
};

export default PublicationService;
