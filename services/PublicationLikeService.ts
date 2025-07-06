import api from './axios_config';

export interface LikeResponse {
  id: number;
  userId: number;
  publicationId: string;
  created_at: string;
}

export interface LikeCountResponse {
  count: number;
}

export interface UserLikeResponse {
  hasLiked: boolean;
}

class PublicationLikeService {
  // Dar like a una publicación
  static async likePublication(publicationId: string): Promise<LikeResponse> {
    const response = await api.post(`/suarec/publications/${publicationId}/like`);
    return response.data;
  }

  // Quitar like de una publicación
  static async unlikePublication(publicationId: string): Promise<{ message: string }> {
    const response = await api.delete(`/suarec/publications/${publicationId}/like`);
    return response.data;
  }

  // Obtener likes de una publicación
  static async getPublicationLikes(publicationId: string): Promise<LikeResponse[]> {
    const response = await api.get(`/suarec/publications/${publicationId}/likes`);
    return response.data;
  }

  // Contar likes de una publicación
  static async getPublicationLikesCount(publicationId: string): Promise<LikeCountResponse> {
    const response = await api.get(`/suarec/publications/${publicationId}/likes/count`);
    return response.data;
  }

  // Verificar si el usuario actual dio like
  static async checkUserLike(publicationId: string): Promise<UserLikeResponse> {
    const response = await api.get(`/suarec/publications/${publicationId}/like/check`);
    return response.data;
  }

  // Obtener likes del usuario actual
  static async getUserLikes(): Promise<LikeResponse[]> {
    const response = await api.get('/suarec/publications/user/likes');
    return response.data;
  }
}

export default PublicationLikeService; 