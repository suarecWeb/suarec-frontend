import api from './axios_config';

export interface GalleryImage {
  id: number;
  image_url: string;
  image_path: string;
  description?: string;
  order_index: number;
  created_at: string;
}

export interface UploadGalleryImagesRequest {
  image_urls: string[];
  image_paths: string[];
  description?: string;
}

export interface UpdateGalleryImageRequest {
  description?: string;
  order_index?: number;
}

export class GalleryService {
  // Obtener galería de usuario
  static async getUserGallery(): Promise<GalleryImage[]> {
    const response = await api.get('/suarec/users/me/gallery');
    return response.data;
  }

  // Agregar imagen a galería de usuario
  static async addImageToUserGallery(imageUrl: string, imagePath: string, description?: string): Promise<GalleryImage> {
    const response = await api.post('/suarec/users/me/gallery', {
      image_url: imageUrl,
      image_path: imagePath,
      description,
    });
    return response.data;
  }

  // Subir múltiples imágenes a galería de usuario
  static async uploadMultipleImagesToUserGallery(uploadData: UploadGalleryImagesRequest): Promise<GalleryImage[]> {
    const response = await api.post('/suarec/users/me/gallery/upload-multiple', uploadData);
    return response.data;
  }

  // Actualizar imagen de galería de usuario
  static async updateUserGalleryImage(imageId: number, updateData: UpdateGalleryImageRequest): Promise<GalleryImage> {
    const response = await api.patch(`/suarec/users/me/gallery/${imageId}`, updateData);
    return response.data;
  }

  // Eliminar imagen de galería de usuario
  static async deleteUserGalleryImage(imageId: number): Promise<void> {
    await api.delete(`/suarec/users/me/gallery/${imageId}`);
  }

  // Reordenar imágenes de galería de usuario
  static async reorderUserGalleryImages(imageIds: number[]): Promise<GalleryImage[]> {
    const response = await api.post('/suarec/users/me/gallery/reorder', { imageIds });
    return response.data;
  }

  // Obtener galería de empresa
  static async getCompanyGallery(): Promise<GalleryImage[]> {
    const response = await api.get('/suarec/companies/me/gallery');
    return response.data;
  }

  // Agregar imagen a galería de empresa
  static async addImageToCompanyGallery(imageUrl: string, imagePath: string, description?: string): Promise<GalleryImage> {
    const response = await api.post('/suarec/companies/me/gallery', {
      image_url: imageUrl,
      image_path: imagePath,
      description,
    });
    return response.data;
  }

  // Subir múltiples imágenes a galería de empresa
  static async uploadMultipleImagesToCompanyGallery(uploadData: UploadGalleryImagesRequest): Promise<GalleryImage[]> {
    const response = await api.post('/suarec/companies/me/gallery/upload-multiple', uploadData);
    return response.data;
  }

  // Actualizar imagen de galería de empresa
  static async updateCompanyGalleryImage(imageId: number, updateData: UpdateGalleryImageRequest): Promise<GalleryImage> {
    const response = await api.patch(`/suarec/companies/me/gallery/${imageId}`, updateData);
    return response.data;
  }

  // Eliminar imagen de galería de empresa
  static async deleteCompanyGalleryImage(imageId: number): Promise<void> {
    await api.delete(`/suarec/companies/me/gallery/${imageId}`);
  }

  // Reordenar imágenes de galería de empresa
  static async reorderCompanyGalleryImages(imageIds: number[]): Promise<GalleryImage[]> {
    const response = await api.post('/suarec/companies/me/gallery/reorder', { imageIds });
    return response.data;
  }
} 