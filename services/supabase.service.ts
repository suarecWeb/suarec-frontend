import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Supabase configuration missing. Please check your environment variables.",
  );
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
      throw new Error(
        "Supabase configuration missing. Please check your environment variables.",
      );
    }
    return true;
  },

  // Subir una imagen a Supabase Storage
  async uploadImage(
    file: File,
    folder: string = "profile-images",
  ): Promise<UploadImageResult> {
    try {
      this.checkConfig();

      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log("Uploading to Supabase:", {
        bucket: "suarec-media",
        path: filePath,
        fileSize: file.size,
        fileType: file.type,
      });

      // Subir archivo
      const { data, error } = await supabase.storage
        .from("suarec-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("suarec-media")
        .getPublicUrl(filePath);

      console.log("Upload successful:", urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error: any) {
      console.error("Error uploading image to Supabase:", error);
      return {
        url: "",
        path: "",
        error: error.message,
      };
    }
  },

  // Subir múltiples imágenes para galería
  async uploadMultipleImages(
    files: File[],
    folder: string = "gallery-images",
  ): Promise<UploadImageResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  },

  // Eliminar una imagen
  async deleteImage(
    path: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.checkConfig();

      const { error } = await supabase.storage
        .from("suarec-media")
        .remove([path]);

      if (error) {
        throw new Error(`Error al eliminar imagen: ${error.message}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting image from Supabase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Obtener URL pública de una imagen
  getPublicUrl(path: string): string {
    this.checkConfig();

    const { data } = supabase.storage.from("suarec-media").getPublicUrl(path);

    return data.publicUrl;
  },

  // Listar imágenes en una carpeta
  async listImages(folder: string = "gallery-images"): Promise<string[]> {
    try {
      this.checkConfig();

      const { data, error } = await supabase.storage
        .from("suarec-media")
        .list(folder);

      if (error) {
        throw new Error(`Error al listar imágenes: ${error.message}`);
      }

      return data?.map((file: any) => `${folder}/${file.name}`) || [];
    } catch (error: any) {
      console.error("Error listing images from Supabase:", error);
      return [];
    }
  },

  // Verificar si el bucket existe
  async checkBucketExists(): Promise<boolean> {
    try {
      this.checkConfig();

      const { data, error } = await supabase.storage
        .from("suarec-media")
        .list("", { limit: 1 });

      if (error) {
        console.error("Bucket check error:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking bucket:", error);
      return false;
    }
  },

  getPathFromUrl(publicUrl: string): string | null {
    try {
      const url = new URL(publicUrl);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.indexOf("public");

      if (bucketIndex !== -1 && pathParts.length > bucketIndex + 2) {
        const path = pathParts.slice(bucketIndex + 2).join("/");
        return path;
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  async deleteIdPhotoFromStorage(
    imagePath: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.checkConfig();

      const { error } = await supabase.storage
        .from("suarec-media")
        .remove([imagePath]);

      if (error) {
        throw new Error(
          `Error al eliminar imagen del storage: ${error.message}`,
        );
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // ==================== SEGURO SOCIAL BUCKET ====================

  // Subir documento de seguro social a la carpeta user_segurosoc dentro de suarec-media
  async uploadSocialSecurityDoc(
    file: File,
    userId: string,
    documentType: string,
  ): Promise<UploadImageResult> {
    try {
      this.checkConfig();

      // Generar nombre único para el archivo: user_segurosoc/userId/documentType_timestamp.pdf
      const fileName = `${documentType}_${Date.now()}.pdf`;
      const filePath = `user_segurosoc/${userId}/${fileName}`;

      console.log("Uploading social security doc to Supabase:", {
        bucket: "suarec-media",
        path: filePath,
        fileSize: file.size,
        fileType: file.type,
      });

      // Subir archivo al bucket suarec-media en la carpeta user_segurosoc
      const { data, error } = await supabase.storage
        .from("suarec-media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Permitir sobrescribir si ya existe
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Error al subir documento: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("suarec-media")
        .getPublicUrl(filePath);

      console.log("Social security doc upload successful:", urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error: any) {
      console.error("Error uploading social security doc to Supabase:", error);
      return {
        url: "",
        path: "",
        error: error.message,
      };
    }
  },

  // Eliminar documento de seguro social
  async deleteSocialSecurityDoc(
    path: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.checkConfig();

      const { error } = await supabase.storage
        .from("suarec-media")
        .remove([path]);

      if (error) {
        throw new Error(`Error al eliminar documento: ${error.message}`);
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting social security doc from Supabase:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Listar documentos de seguro social de un usuario
  async listSocialSecurityDocs(userId: string): Promise<{
    files: { name: string; path: string; url: string }[];
    error?: string;
  }> {
    try {
      this.checkConfig();

      // Listar archivos en la carpeta user_segurosoc/userId
      const { data, error } = await supabase.storage
        .from("suarec-media")
        .list(`user_segurosoc/${userId}`);

      if (error) {
        throw new Error(`Error al listar documentos: ${error.message}`);
      }

      const files = (data || []).map((file: any) => {
        const filePath = `user_segurosoc/${userId}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from("suarec-media")
          .getPublicUrl(filePath);

        return {
          name: file.name,
          path: filePath,
          url: urlData.publicUrl,
        };
      });

      return { files };
    } catch (error: any) {
      console.error("Error listing social security docs from Supabase:", error);
      return {
        files: [],
        error: error.message,
      };
    }
  },

  // Obtener URL pública de un documento de seguro social
  getSocialSecurityDocUrl(path: string): string {
    this.checkConfig();

    const { data } = supabase.storage.from("suarec-media").getPublicUrl(path);

    return data.publicUrl;
  },
};

export default SupabaseService;
