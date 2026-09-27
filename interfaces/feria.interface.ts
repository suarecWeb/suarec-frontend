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
}
