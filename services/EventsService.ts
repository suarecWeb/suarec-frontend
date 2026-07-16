import api from "./axios_config";
import { CreateEventoDto, Evento } from "@/interfaces/event.interface";
import {
  BoletaSoporte,
  DetalleTransaccion,
  TransaccionBoleta,
} from "@/interfaces/boleta.interface";
import {
  VentasFisicasGlobalResponse,
  RecaudoGlobalFisicoResponse,
  ResumenEventoFisico,
  BoletasFisicasValidadasResponse,
  MetodoPagoFisico,
} from "@/interfaces/ventaFisica.interface";
import {
  GenerarLoteFisicoDto,
  GenerarLoteFisicoResponse,
  VenderBoletasFisicasDto,
  VenderBoletasFisicasResponse,
  ValidarBoletaFisicaDto,
  ValidarBoletaFisicaResponse,
  VentaFisicaConBoletasResponse,
  ContarBoletasFisicasDisponiblesResponse,
  ObtenerUltimoLoteFisicoResponse,
} from "@/interfaces/boleteria-fisica.interface";

const BASE = "/suarec/events";

const EventsService = {
  getAllEvents: (): Promise<{ data: Evento[] }> => api.get(BASE),

  getAllEventsAdmin: (): Promise<{ data: Evento[] }> =>
    api.get(`${BASE}/admin/all`),

  getEventById: (id: number): Promise<{ data: Evento }> =>
    api.get(`${BASE}/${id}`),

  createEvent: (
    dto: CreateEventoDto,
    imageFile?: File,
  ): Promise<{ data: Evento }> => {
    const form = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        form.append(key, String(value));
      }
    });
    if (imageFile) form.append("image", imageFile);
    return api.post(BASE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateEvent: (
    id: string,
    dto: Partial<CreateEventoDto>,
    imageFile?: File,
  ): Promise<{ data: Evento }> => {
    const form = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });

    if (imageFile) form.append("image", imageFile);
    return api.patch(`${BASE}/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  setVisibility: (id: number, visible: boolean): Promise<void> =>
    api.patch(`${BASE}/${id}/visibility`, { visible }),

  generarCodigosRegalo: (
    eventoId: number,
    cantidad: number,
  ): Promise<{ data: { cantidad: number; codigos: string[] } }> =>
    api.post(`${BASE}/${eventoId}/codigos-regalo`, { cantidad }),

  descargarCodigosRegalo: async (
    eventoId: number,
    nombreEvento?: string,
  ): Promise<void> => {
    const res = await api.get(`${BASE}/${eventoId}/codigos-regalo/export`, {
      responseType: "blob",
    });
    // Nombre del archivo con el nombre del evento (sin caracteres inválidos)
    const limpio = (nombreEvento ?? "").replace(/[\\/:*?"<>|]/g, "").trim();
    const filename = limpio
      ? `Códigos - ${limpio}.xlsx`
      : `codigos-evento-${eventoId}.xlsx`;
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteEvent: (id: string): Promise<void> => api.delete(`${BASE}/${id}`),

  getAllTransacciones: (
    onlyProduction?: boolean,
  ): Promise<{
    data: { transacciones: TransaccionBoleta[] };
  }> =>
    api.get(`${BASE}/boletas/transacciones`, {
      params: onlyProduction ? { environment: "production" } : {},
    }),

  getBoletasValidadas: (): Promise<{ data: { validadas: any[] } }> =>
    api.get(`${BASE}/boletas/validadas`),

  adminGetBoletasSoporte: (
    email?: string,
  ): Promise<{ data: { boletas: BoletaSoporte[] } }> =>
    api.get(`${BASE}/boletas/admin/soporte`, {
      params: email ? { email } : {},
    }),

  adminReenviarEmail: (
    boletaId: number,
  ): Promise<{ data: { success: boolean } }> =>
    api.post(`${BASE}/boletas/${boletaId}/admin-reenviar`),

  adminGetDetalleTransaccion: (
    id: number,
  ): Promise<{ data: DetalleTransaccion }> =>
    api.get(`${BASE}/boletas/transacciones/${id}/detalle`),

  adminSincronizarTransaccion: (
    id: number,
  ): Promise<{ data: { sincronizado: boolean; estadoFinal: string } }> =>
    api.post(`${BASE}/boletas/transacciones/${id}/sincronizar`),

  adminForzarGeneracion: (
    id: number,
    wompiTransactionId: string,
  ): Promise<{ data: { generado: boolean; boletaIds: number[] } }> =>
    api.post(`${BASE}/boletas/transacciones/${id}/forzar-generacion`, {
      wompiTransactionId,
    }),

  adminReenviarBoletasPorTransaccion: (
    id: number,
    email: string,
  ): Promise<{ data: { success: boolean; enviadas: number; email: string } }> =>
    api.post(`${BASE}/boletas/transacciones/${id}/reenviar-correo`, {
      email,
    }),

  getVentasFisicasGlobal: (
    page: number,
    metodoPago?: MetodoPagoFisico,
  ): Promise<{ data: VentasFisicasGlobalResponse }> =>
    api.get(`${BASE}/boletas-fisicas/ventas`, {
      params: { page, ...(metodoPago ? { metodoPago } : {}) },
    }),

  getRecaudoGlobalFisico: (): Promise<{ data: RecaudoGlobalFisicoResponse }> =>
    api.get(`${BASE}/boletas-fisicas/recaudo`),

  getResumenEventosFisicos: (): Promise<{ data: ResumenEventoFisico[] }> =>
    api.get(`${BASE}/boletas-fisicas/eventos-resumen`),

  getBoletasFisicasValidadas: (
    page: number,
    serial?: string,
  ): Promise<{ data: BoletasFisicasValidadasResponse }> =>
    api.get(`${BASE}/boletas-fisicas/validadas`, {
      params: { page, ...(serial ? { serial } : {}) },
    }),

  // ── Boletería física ─────────────────────────────────────────────────────

  generarLoteFisico: (
    eventoId: number,
    dto: GenerarLoteFisicoDto,
  ): Promise<{ data: GenerarLoteFisicoResponse }> =>
    api.post(`${BASE}/${eventoId}/boletas-fisicas/lote`, dto),

  obtenerUltimoLoteFisico: (
    eventoId: number,
  ): Promise<{ data: ObtenerUltimoLoteFisicoResponse }> =>
    api.get(`${BASE}/${eventoId}/boletas-fisicas/ultimo-lote`),

  venderBoletasFisicas: (
    eventoId: number,
    dto: VenderBoletasFisicasDto,
  ): Promise<{ data: VenderBoletasFisicasResponse }> =>
    api.post(`${BASE}/${eventoId}/boletas-fisicas/vender`, dto),

  validarBoletaFisica: (
    dto: ValidarBoletaFisicaDto,
  ): Promise<{ data: ValidarBoletaFisicaResponse }> =>
    api.post(`${BASE}/boletas-fisicas/validate`, dto),

  obtenerVentaFisica: (
    ventaId: number,
  ): Promise<{ data: VentaFisicaConBoletasResponse }> =>
    api.get(`${BASE}/boletas-fisicas/ventas/${ventaId}`),

  contarBoletasFisicasDisponibles: (
    eventoId: number,
  ): Promise<{ data: ContarBoletasFisicasDisponiblesResponse }> =>
    api.get(`${BASE}/${eventoId}/boletas-fisicas/disponibles`),
};

export default EventsService;
