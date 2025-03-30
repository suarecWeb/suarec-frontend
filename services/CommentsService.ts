import api from "./axios_config";

const baseURL = "/comments";

interface Comment {
  id?: string;
  description: string;
  created_at: Date;
  publicationId: string;
  userId: string;
}

// Estructura de parámetros de paginación
// Añadimos la estructura de parámetros de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Añadimos la estructura de respuesta paginada
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

// Estructura de respuesta de comentarios
// Añadimos la función para obtener comentarios con paginación
const getComments = (params?: PaginationParams) => 
  api.get<PaginationResponse<Comment>>(baseURL, { params });

// Función para obtener un comentario por ID
const getCommentById = (id: string) => api.get<Comment>(`${baseURL}/${id}`);

// Función para crear un nuevo comentario
const createComment = (commentData: Comment) => api.post<Comment>(baseURL, commentData);

// Función para actualizar un comentario existente
const updateComment = (id: string, commentData: Partial<Comment>) => api.patch<Comment>(`${baseURL}/${id}`, commentData);

// Función para eliminar un comentario por ID
const deleteComment = (id: string) => api.delete(`${baseURL}/${id}`);


const CommentService = {
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};

export default CommentService;