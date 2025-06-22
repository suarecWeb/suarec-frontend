// services/RatingService.ts
import api from "./axios_config";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

export enum RatingCategory {
  SERVICE = 'SERVICE',
  EMPLOYER = 'EMPLOYER',
  EMPLOYEE = 'EMPLOYEE'
}

export interface Rating {
  id?: string;
  stars: number;
  comment?: string;
  category: RatingCategory;
  created_at: Date;
  updated_at?: Date;
  reviewer: {
    id: number;
    name: string;
    email: string;
  };
  reviewee: {
    id: number;
    name: string;
    email: string;
  };
  workContract?: {
    id: string;
    title: string;
  };
}

export interface CreateRatingDto {
  reviewerId: number;
  revieweeId: number;
  stars: number;
  comment?: string;
  category: RatingCategory;
  workContractId?: string;
}

export interface UpdateRatingDto {
  stars?: number;
  comment?: string;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
  categoryStats: { [category: string]: { average: number; count: number } };
}

const baseURL = "/ratings";

// Crear una nueva calificación
const createRating = (ratingData: CreateRatingDto) => 
  api.post<Rating>(baseURL, ratingData);

// Obtener todas las calificaciones (admin)
const getAllRatings = (params?: PaginationParams) => 
  api.get<PaginationResponse<Rating>>(baseURL, { params });

// Obtener calificaciones de un usuario específico
const getUserRatings = (userId: number, params?: PaginationParams) => 
  api.get<PaginationResponse<Rating>>(`${baseURL}/user/${userId}`, { params });

// Obtener estadísticas de calificaciones de un usuario
const getUserRatingStats = (userId: number) => 
  api.get<RatingStats>(`${baseURL}/user/${userId}/stats`);

// Obtener una calificación por ID
const getRatingById = (id: string) => 
  api.get<Rating>(`${baseURL}/${id}`);

// Actualizar una calificación
const updateRating = (id: string, ratingData: UpdateRatingDto) => 
  api.put<Rating>(`${baseURL}/${id}`, ratingData);

// Eliminar una calificación
const deleteRating = (id: string) => 
  api.delete(`${baseURL}/${id}`);

const RatingService = {
  createRating,
  getAllRatings,
  getUserRatings,
  getUserRatingStats,
  getRatingById,
  updateRating,
  deleteRating,
};

export default RatingService;