// services/PublicationsService.ts
import api from "./axios_config";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Publication } from "@/interfaces/publication.interface";

const baseURL = "/publications";

// Estructura de respuesta de publicación
const getPublications = (params?: PaginationParams) => 
  { return api.get<PaginationResponse<Publication>>(baseURL, { params })};

const getPublicationById = (id: string) => 
  { return api.get<Publication>(`${baseURL}/${id}`)};

const createPublication = (publicationData: Publication) => 
  { 
    console.log('seding...: ' + publicationData.id)
    console.log('seding...: ' + publicationData.title)
    console.log('seding...: ' + publicationData.visitors)
    console.log('seding...: ' + publicationData.userId)
    console.log('seding...: ' + publicationData.user)
    console.log('seding...: ' + publicationData.image_url)
    console.log('seding...: ' + publicationData.description)
    console.log('seding...: ' + publicationData.created_at)
    console.log('seding...: ' + publicationData.comments)
    console.log('seding...: ' + publicationData.category)
    return api.post<Publication>(baseURL, publicationData)};

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