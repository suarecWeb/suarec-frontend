import api from "./axios_config";
import { CreateEventoDto, Evento } from "@/interfaces/event.interface";

const BASE = "/suarec/events";

const EventsService = {
  getAllEvents: (): Promise<{ data: Evento[] }> => api.get(BASE),

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

  deleteEvent: (id: string): Promise<void> => api.delete(`${BASE}/${id}`),
};

export default EventsService;
