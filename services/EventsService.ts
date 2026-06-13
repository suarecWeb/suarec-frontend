import api from "./axios_config";
import { CreateEventoDto, Evento } from "@/interfaces/event.interface";
import {
  BoletaSoporte,
  DetalleTransaccion,
  TransaccionBoleta,
} from "@/interfaces/boleta.interface";

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

  deleteEvent: (id: string): Promise<void> => api.delete(`${BASE}/${id}`),

  getAllTransacciones: (): Promise<{
    data: { transacciones: TransaccionBoleta[] };
  }> => api.get(`${BASE}/boletas/transacciones`),

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
  ): Promise<{ data: { generado: boolean; boletaIds: number[] } }> =>
    api.post(`${BASE}/boletas/transacciones/${id}/forzar-generacion`),
};

export default EventsService;
