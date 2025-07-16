// services/PublicationsService.ts
import api from "./axios_config";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Publication } from "@/interfaces/publication.interface";

const baseURL = "/suarec/publications";

// Estructura de respuesta de publicación
const getPublications = (params?: PaginationParams) => {
  return api.get<PaginationResponse<Publication>>(baseURL, { params });
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

const deletePublication = (id: string) => {
  return api.delete(`${baseURL}/${id}`);
};

const PublicationService = {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
};

export default PublicationService;
