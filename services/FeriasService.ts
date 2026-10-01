import api from "./axios_config";
import {
  CreateFeriaDto,
  Feria,
  UpdateFeriaDto,
} from "@/interfaces/feria.interface";

const BASE = "/suarec/ferias";

const FeriasService = {
  getAllFerias: (): Promise<{ data: Feria[] }> => api.get(BASE),

  getAllFeriasAdmin: (): Promise<{ data: Feria[] }> =>
    api.get(`${BASE}/admin/all`),

  getFeriaById: (id: number): Promise<{ data: Feria }> =>
    api.get(`${BASE}/${id}`),

  createFeria: (
    dto: CreateFeriaDto,
    imageFile?: File,
  ): Promise<{ data: Feria }> => {
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

  updateFeria: (
    id: number,
    dto: UpdateFeriaDto,
    imageFile?: File,
  ): Promise<{ data: Feria }> => {
    const form = new FormData();
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });
    // Quitar el recinto: multipart no manda null; el backend lee "" como
    // "sin recinto" (RN-24)
    if (dto.recintoId === null) form.append("recintoId", "");
    if (imageFile) form.append("image", imageFile);
    return api.patch(`${BASE}/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  setVisibility: (id: number, visible: boolean): Promise<void> =>
    api.patch(`${BASE}/${id}/visibility`, { visible }),

  asignarEventos: (id: number, eventoIds: number[]): Promise<{ data: Feria }> =>
    api.patch(`${BASE}/${id}/eventos`, { eventoIds }),

  deleteFeria: (id: number): Promise<void> => api.delete(`${BASE}/${id}`),
};

export default FeriasService;
