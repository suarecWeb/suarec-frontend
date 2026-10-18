import api from "./axios_config";
import {
  CreateEmailTemplateDto,
  CupoHoy,
  EmailCampaign,
  EmailTemplate,
  ResultadoCampana,
  UpdateEmailTemplateDto,
} from "@/interfaces/email-template.interface";

// Plantillas de correo + campañas (roadmap email-templates-campanas.txt).
// Todos los endpoints son SOLO súper admin en backend (SuperAdminGuard) —
// si un usuario sin rol los llama, el 403 viene del servidor, no de acá.
const BASE_TEMPLATES = "/suarec/email-templates";
const BASE_CAMPAIGNS = "/suarec/email-campaigns";

const EmailTemplatesService = {
  // ─── Plantillas ────────────────────────────────────────────────────────
  getTemplates: (): Promise<{ data: EmailTemplate[] }> =>
    api.get(BASE_TEMPLATES),

  getTemplate: (id: number): Promise<{ data: EmailTemplate }> =>
    api.get(`${BASE_TEMPLATES}/${id}`),

  createTemplate: (
    dto: CreateEmailTemplateDto,
  ): Promise<{ data: EmailTemplate }> => api.post(BASE_TEMPLATES, dto),

  // UC-1: crear desde la prediseñada o duplicar cualquier existente
  duplicateTemplate: (id: number): Promise<{ data: EmailTemplate }> =>
    api.post(`${BASE_TEMPLATES}/${id}/duplicar`),

  updateTemplate: (
    id: number,
    dto: UpdateEmailTemplateDto,
  ): Promise<{ data: EmailTemplate }> =>
    api.patch(`${BASE_TEMPLATES}/${id}`, dto),

  deleteTemplate: (id: number): Promise<{ data: void }> =>
    api.delete(`${BASE_TEMPLATES}/${id}`),

  // UC-2: el preview usa el MISMO generador HTML del backend — no miente
  getPreviewHtml: (id: number): Promise<{ data: { html: string } }> =>
    api.get(`${BASE_TEMPLATES}/${id}/preview`),

  // UC-3: una imagen por correo, subida a Supabase vía backend
  uploadImagen: (id: number, file: File): Promise<{ data: EmailTemplate }> => {
    const form = new FormData();
    form.append("imagen", file);
    return api.post(`${BASE_TEMPLATES}/${id}/imagen`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ─── Campañas ──────────────────────────────────────────────────────────
  // UC-6: el editor consulta el cupo ANTES de confirmar el envío
  getCupoHoy: (): Promise<{ data: CupoHoy }> =>
    api.get(`${BASE_CAMPAIGNS}/cupo-hoy`),

  getHistorial: (): Promise<{ data: EmailCampaign[] }> =>
    api.get(BASE_CAMPAIGNS),

  // UC-5: envío a todos los usuarios con email verificado (tope diario en
  // servidor — si el lote no cabe, el backend responde 409 sin enviar nada)
  enviarCampana: (templateId: number): Promise<{ data: ResultadoCampana }> =>
    api.post(`${BASE_CAMPAIGNS}/${templateId}/send`),

  // BORRAR-EN-PROD: envío de prueba a los 5 colegas (UC-4). Este método y
  // el botón que lo llama se eliminan al pasar a producción.
  enviarPruebaColegas: (
    templateId: number,
  ): Promise<{ data: ResultadoCampana }> =>
    api.post(`${BASE_CAMPAIGNS}/${templateId}/prueba`),
};

export default EmailTemplatesService;
