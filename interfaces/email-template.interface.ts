// Plantillas de correo + campañas (roadmap email-templates-campanas.txt).
// Espejo de las entidades del backend src/email-templates/.

export interface EmailTemplate {
  id: number;
  /** Nombre interno, visible solo en el admin */
  nombre: string;
  /** Subject del correo */
  asunto: string;
  /** Encabezado visible dentro del correo */
  titulo: string;
  /** Párrafos con saltos de línea */
  cuerpo: string;
  imagenUrl: string | null;
  ctaTexto: string | null;
  ctaUrl: string | null;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateDto {
  nombre: string;
  asunto: string;
  titulo: string;
  cuerpo: string;
  ctaTexto?: string;
  ctaUrl?: string;
}

// No se deriva con Partial<CreateEmailTemplateDto>: la intersección con
// los nullables anularía el `null` (y null explícito = quitar imagen/CTA).
export interface UpdateEmailTemplateDto {
  nombre?: string;
  asunto?: string;
  titulo?: string;
  cuerpo?: string;
  /** null explícito = quitar la imagen */
  imagenUrl?: string | null;
  ctaTexto?: string | null;
  ctaUrl?: string | null;
}

export interface CupoHoy {
  tope: number;
  usados: number;
  restantes: number;
}

export interface ResultadoCampana {
  campanaId: number;
  destinatariosTotal: number;
  enviados: number;
  fallidos: number;
  cupoRestante?: number;
}

export interface EmailCampaign {
  id: number;
  templateId: number | null;
  template: { id: number; nombre: string } | null;
  enviadoPorId: number | null;
  destinatariosTotal: number;
  enviados: number;
  fallidos: number;
  esPrueba: boolean;
  createdAt: string;
}
