import { Evento, EventoFormat } from "./event.interface";

export interface Feria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  // Coordenadas de la feria (ver roadmap google-maps-evento-ubicacion.txt) --
  // null = todavía sin geolocalizar. Los eventos de esta feria heredan esta
  // ubicación para el preview de mapa, no tienen la suya propia.
  latitud?: number | null;
  longitud?: number | null;
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
  latitud?: number | null;
  longitud?: number | null;
  removeImage?: boolean;
  formatId?: number;
  recintoId?: number | null;
}

export interface UpdateFeriaDto extends Partial<CreateFeriaDto> {
  // RN-25: reenviar con true despues de que el admin confirma el aviso
  confirmarCambioRecinto?: boolean;
}

// 409 del backend al cambiar o quitar el recinto de una feria con eventos
// PALCO sin ventas: su mapa cambia y se borran sus precios por palco. Con
// ventas el backend bloquea (RN-25) y no hay nada que confirmar
export interface AvisoCambioRecinto {
  message: string;
  requiereConfirmacion: true;
  eventosPalco: number;
}
