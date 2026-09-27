import api from "./axios_config";
import {
  Recinto,
  CreateRecintoDto,
  UpdateRecintoDto,
} from "@/interfaces/recinto.interface";

// Solo super admin (SuperAdminGuard en todo el controlador). JSON plano,
// sin multipart: el recinto no lleva imagen
const BASE = "/suarec/recintos";

const RecintosService = {
  getRecintos: (): Promise<{ data: Recinto[] }> => api.get(BASE),

  getRecintoById: (id: number): Promise<{ data: Recinto }> =>
    api.get(`${BASE}/${id}`),

  createRecinto: (dto: CreateRecintoDto): Promise<{ data: Recinto }> =>
    api.post(BASE, dto),

  updateRecinto: (
    id: number,
    dto: UpdateRecintoDto,
  ): Promise<{ data: Recinto }> => api.patch(`${BASE}/${id}`, dto),

  // Falla (409) si alguna feria lo usa o si tiene palcos con ventas
  deleteRecinto: (id: number): Promise<{ data: { message: string } }> =>
    api.delete(`${BASE}/${id}`),
};

export default RecintosService;
