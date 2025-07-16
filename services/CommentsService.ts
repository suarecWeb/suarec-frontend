// services/CommentService.ts
import api from "./axios_config";
import { Comment } from "@/interfaces/comment.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

const baseURL = "/suarec/comments";

// Función para obtener comentarios con paginación
const getComments = (params?: PaginationParams) =>
  api.get<PaginationResponse<Comment>>(baseURL, { params });

// Función para obtener comentarios de una publicación específica
const getPublicationComments = (
  publicationId: string,
  params?: PaginationParams,
) =>
  api.get<PaginationResponse<Comment>>(
    `/suarec/publications/${publicationId}/comments`,
    { params },
  );

// Función para obtener un comentario por ID
const getCommentById = (id: string) => api.get<Comment>(`${baseURL}/${id}`);

// Función para crear un nuevo comentario
const createComment = (commentData: {
  description: string;
  created_at: Date;
  publicationId: string;
  userId: string | number;
}) => api.post<Comment>(baseURL, commentData);

// Función para actualizar un comentario existente
const updateComment = (id: string, commentData: Partial<Comment>) =>
  api.patch<Comment>(`${baseURL}/${id}`, commentData);

// Función para eliminar un comentario
const deleteComment = (id: string) => api.delete(`${baseURL}/${id}`);

const CommentService = {
  getComments,
  getPublicationComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};

export default CommentService;
