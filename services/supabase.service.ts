import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl!, supabaseKey!);

export interface UploadImageResult {
  url: string;
  path: string;
  error?: string;
}

const SupabaseService = {
  // Verificar configuración
  checkConfig() {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing. Please check your environment variables.');
    }
    return true;
  },

  // Subir una imagen a Supabase Storage
  async uploadImage(file: File, folder: string = 'profile-images'): Promise<UploadImageResult> {
    try {
      this.checkConfig();

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Uploading to Supabase:', {
        bucket: 'suarec-media',
        path: filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Subir archivo
      const { data, error } = await supabase.storage
        .from('suarec-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('suarec-media')
        .getPublicUrl(filePath);

      console.log('Upload successful:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error: any) {
      console.error('Error uploading image to Supabase:', error);
      return {
        url: '',
        path: '',
        error: error.message
      };
    }
  },

  // Subir múltiples imágenes para galería
  async uploadMultipleImages(files: File[], folder: string = 'gallery-images'): Promise<UploadImageResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  },

  // Eliminar una imagen
  async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.checkConfig();

      const { error } = await supabase.storage
        .from('suarec-media')
        .remove([path]);

      if (error) {
        throw new Error(`Error al eliminar imagen: ${error.message}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting image from Supabase:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Obtener URL pública de una imagen
  getPublicUrl(path: string): string {
    this.checkConfig();
    
    const { data } = supabase.storage
      .from('suarec-media')
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Listar imágenes en una carpeta
  async listImages(folder: string = 'gallery-images'): Promise<string[]> {
    try {
      this.checkConfig();

      const { data, error } = await supabase.storage
        .from('suarec-media')
        .list(folder);

      if (error) {
        throw new Error(`Error al listar imágenes: ${error.message}`);
      }

      return data?.map((file: any) => `${folder}/${file.name}`) || [];
    } catch (error: any) {
      console.error('Error listing images from Supabase:', error);
      return [];
    }
  },

  // Verificar si el bucket existe
  async checkBucketExists(): Promise<boolean> {
    try {
      this.checkConfig();

      const { data, error } = await supabase.storage
        .from('suarec-media')
        .list('', { limit: 1 });

      if (error) {
        console.error('Bucket check error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking bucket:', error);
      return false;
    }
  }
};

export default SupabaseService; 