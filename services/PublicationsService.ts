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

const getPublications = () => api.get<Publication[]>(baseURL);

const getPublicationById = (id: string) => api.get<Publication>(`${baseURL}/${id}`);

const createPublication = (publicationData: Publication) => api.post<Publication>(baseURL, publicationData);

const updatePublication = (id: string, publicationData: Partial<Publication>) => api.patch<Publication>(`${baseURL}/${id}`, publicationData);

const deletePublication = (id: string) => api.delete(`${baseURL}/${id}`);

const PublicationService = {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
};

export default PublicationService;
