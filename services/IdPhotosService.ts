import api from "./axios_config";

export interface IdPhoto {
  id: number;
  image_url: string;
  image_path: string;
  description?: string;
  photo_type: "front" | "back";
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  user_id: number;
  reviewed_by?: number;
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateIdPhotoRequest {
  image_url: string;
  image_path: string;
  description?: string;
  photo_type: "front" | "back";
}

export interface UpdateIdPhotoRequest {
  image_url?: string;
  image_path?: string;
  description?: string;
  photo_type?: "front" | "back";
}

export interface ReviewIdPhotoRequest {
  status: "approved" | "rejected";
  description?: string;
}

export class IdPhotosService {
  // Obtener fotos de cédula del usuario autenticado
  static async getMyIdPhotos(): Promise<IdPhoto[]> {
    const response = await api.get("/suarec/users/me/id-photos");
    return response.data;
  }

  // Subir nueva foto de cédula
  static async addIdPhoto(photoData: CreateIdPhotoRequest): Promise<IdPhoto> {
    const response = await api.post("/suarec/users/me/id-photos", photoData);
    return response.data;
  }

  // Actualizar foto de cédula existente
  static async updateIdPhoto(
    photoId: number,
    updateData: UpdateIdPhotoRequest,
  ): Promise<IdPhoto> {
    const response = await api.put(
      `/suarec/users/me/id-photos/${photoId}`,
      updateData,
    );
    return response.data;
  }

  // Eliminar foto de cédula
  static async deleteIdPhoto(photoId: number): Promise<void> {
    await api.delete(`/suarec/users/me/id-photos/${photoId}`);
  }

  // ====== MÉTODOS PARA ADMINISTRADORES ======

  // Obtener fotos pendientes de revisión (Solo Admin)
  static async getPendingIdPhotos(): Promise<IdPhoto[]> {
    const response = await api.get("/suarec/users/id-photos/pending");
    return response.data;
  }

  // Revisar foto de cédula (Solo Admin)
  static async reviewIdPhoto(
    photoId: number,
    reviewData: ReviewIdPhotoRequest,
  ): Promise<IdPhoto> {
    const response = await api.patch(
      `/suarec/users/id-photos/${photoId}/review`,
      reviewData,
    );
    return response.data;
  }

  // Obtener foto de cédula por ID (Solo Admin)
  static async getIdPhotoById(photoId: number): Promise<IdPhoto> {
    const response = await api.get(`/suarec/users/id-photos/${photoId}`);
    return response.data;
  }

  // Obtener fotos de cédula de un usuario específico (Solo Admin)
  static async getUserIdPhotosById(userId: number): Promise<IdPhoto[]> {
    const response = await api.get(`/suarec/users/${userId}/id-photos`);
    return response.data;
  }
}
