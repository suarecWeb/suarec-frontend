// services/PublicationsService.ts
import api from "./axios_config";

const baseURL = "/publications";

interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: Date;
  modified_at: Date;
  category: string;
  image_url?: string;
  visitors?: number;
  userId: string;
}

// Estructura de parámetros de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Estructura de respuesta paginada
interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Estructura de respuesta de publicación
const getPublications = (params?: PaginationParams) => 
  { return api.get<PaginationResponse<Publication>>(baseURL, { params })};

const getPublicationById = (id: string) => 
  { return api.get<Publication>(`${baseURL}/${id}`)};

const createPublication = (publicationData: Publication) => 
  { return api.post<Publication>(baseURL, publicationData)};

const updatePublication = (id: string, publicationData: Partial<Publication>) => 
  { return api.patch<Publication>(`${baseURL}/${id}`, publicationData)};

const deletePublication = (id: string) => 
  { return api.delete(`${baseURL}/${id}`)};

const PublicationService = {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
};

export default PublicationService;