// interfaces/comment.interface.ts

// Interfaz simplificada para representar usuario en comentarios (solo para UI)
export interface CommentUser {
  id: string | number;
  name: string;
  profile_image?: string;
  email?: string;
}

export interface Comment {
  id?: string;
  description: string;
  created_at: Date;
  publicationId?: string;
  userId?: string | number;

  // Relaciones - para visualización en la UI, no para envío al backend
  publication?: {
    id: string;
    title?: string;
  };
  user?: CommentUser;
}
