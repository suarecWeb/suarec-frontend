export enum EventoEstado {
  PREVENTA = "preventa",
  VENTA = "venta",
  CERRADO = "cerrado",
  CANCELADO = "cancelado",
}

// Tipo de evento — los valores deben coincidir EXACTAMENTE con el enum de la BD (mayúsculas)
export enum EventoTipo {
  GENERAL = "GENERAL",
  VIP = "VIP",
}

export type ImageFormat = "phone" | "web";

export interface EventoFormat {
  id: number;
  nombre: string;
  resolucion: string;
  ratio: string;
}

export interface Evento {
  id?: number;
  nombre: string;
  descripcion?: string;
  fechaEvento: string;
  ubicacion: string;
  imagenUrl?: string;
  aforoTotal?: number;
  aforoDisponible?: number;
  precioBase?: number;
  comision?: number;
  cargoSuarec?: number;
  tipo?: EventoTipo;
  permiteCodigoRegalo?: boolean;
  aforoRegalo?: number;
  regalosCanjeados?: number;
  estado: EventoEstado;
  formatId?: number;
  format?: EventoFormat;
  organizadorId?: number;
  visible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventoDto {
  nombre: string;
  descripcion?: string;
  fechaEvento: string;
  ubicacion: string;
  aforoTotal?: number;
  precioBase?: number;
  comision?: number;
  cargoSuarec?: number;
  tipo?: EventoTipo;
  estado?: EventoEstado;
  formatId?: number;
  removeImage?: boolean;
}
