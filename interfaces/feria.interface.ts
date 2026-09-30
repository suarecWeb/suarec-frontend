import { Evento, EventoFormat } from "./event.interface";

export interface Feria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  organizadorId?: number;
  visible?: boolean;
  eventos?: Evento[];
  formatId?: number | null;
  format?: EventoFormat | null;
  // Recinto (mapa de palcos) de la feria; null = sin recinto (RN-13)
  recintoId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeriaDto {
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  removeImage?: boolean;
  formatId?: number;
  recintoId?: number | null;
}

export interface UpdateFeriaDto extends Partial<CreateFeriaDto> {
  // RN-24: reenviar con true despues de que el admin confirma el aviso
  confirmarCambioRecinto?: boolean;
}

// 409 del backend cuando el cambio de recinto afecta palcos vendidos
export interface AvisoCambioRecinto {
  message: string;
  requiereConfirmacion: true;
  palcosAfectados: number;
}
