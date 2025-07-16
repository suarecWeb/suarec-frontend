// services/RatingService.ts
import api from "./axios_config";

export interface CreateRatingDto {
  reviewerId: number;
  revieweeId: number;
  workContractId?: string;
  stars: number;
  comment?: string;
  category: string;
}

export interface Rating {
  id: string;
  stars: number;
  comment?: string;
  category: string;
  created_at: Date;
  reviewer: {
    id: number;
    name: string;
    profile_image?: string;
  };
  reviewee: {
    id: number;
    name: string;
    profile_image?: string;
  };
  workContract?: {
    id: string;
    title: string;
  };
}

export interface ContractReadyForRating {
  contractId: string;
  contractTitle: string;
  otherUser: {
    id: number;
    name: string;
    profile_image?: string;
  };
  userRole: "CLIENT" | "PROVIDER";
  canRate: boolean;
  alreadyRated: boolean;
  completedAt: Date;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
  categoryStats: { [category: string]: { average: number; count: number } };
}

export enum RatingCategory {
  SERVICE = "SERVICE",
  EMPLOYER = "EMPLOYER",
  EMPLOYEE = "EMPLOYEE",
}

class RatingService {
  // Crear una nueva calificación
  async createRating(ratingData: CreateRatingDto): Promise<Rating> {
    const response = await api.post("/suarec/ratings", ratingData);
    return response.data;
  }

  // Obtener calificaciones de un usuario
  async getUserRatings(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Rating[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const response = await api.get(
      `/suarec/ratings/user/${userId}?page=${page}&limit=${limit}`,
    );
    return response.data;
  }

  // Obtener estadísticas de calificación de un usuario
  async getUserRatingStats(userId: number): Promise<RatingStats> {
    const response = await api.get(`/suarec/ratings/user/${userId}/stats`);
    return response.data;
  }

  // Obtener contratos listos para calificar
  async getContractsReadyForRating(): Promise<ContractReadyForRating[]> {
    const response = await api.get("/suarec/ratings/ready-to-rate");
    return response.data;
  }

  // Actualizar una calificación
  async updateRating(
    ratingId: string,
    updateData: Partial<CreateRatingDto>,
  ): Promise<Rating> {
    const response = await api.put(`/suarec/ratings/${ratingId}`, updateData);
    return response.data;
  }

  // Eliminar una calificación
  async deleteRating(ratingId: string): Promise<{ message: string }> {
    const response = await api.delete(`/suarec/ratings/${ratingId}`);
    return response.data;
  }
}

export default new RatingService();
