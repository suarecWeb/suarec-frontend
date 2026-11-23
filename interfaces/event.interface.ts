import type {
  ClaveImagenBoletaDedicada,
  RecorteImagen,
} from "./plantilla-dedicada.interface";

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
  PALCO = "PALCO",
  PALCO_INDIVIDUAL = "PALCO_INDIVIDUAL",
}

// Modalidad del evento — canal exclusivo: digital (online) o físico (taquilla)
export enum EventoModalidad {
  DIGITAL = "DIGITAL",
  FISICO = "FISICO",
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
  plantillaTicketUrl?: string | null;
  logoPatrocinadoresUrl?: string | null;
  boletaImagenes?: Record<string, string> | null;
  // Encuadre de cada imagen de la boleta (fracciones 0..1 de la fuente).
  boletaImagenesRecorte?: Record<string, RecorteImagen> | null;
  aforoTotal?: number;
  aforoDisponible?: number;
  precioBase?: number;
  comision?: number;
  cargoSuarec?: number;
  tipo?: EventoTipo;
  nombreOrganizador?: string;
  permiteCodigoRegalo?: boolean;
  aforoRegalo?: number;
  regalosCanjeados?: number;
  estado: EventoEstado;
  modalidad?: EventoModalidad;
  formatId?: number;
  format?: EventoFormat;
  feriaId?: number;
  feria?: {
    id: number;
    nombre: string;
    visible?: boolean;
    // Sin recinto, un evento PALCO se vende sin mapa (RN-13)
    recintoId?: number | null;
  };
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
  nombreOrganizador?: string;
  estado?: EventoEstado;
  modalidad?: EventoModalidad;
  formatId?: number;
  feriaId?: number;
  removeImage?: boolean;
  removePlantillaTicket?: boolean;
  removeLogoPatrocinadores?: boolean;
  removeBoletaImagenes?: ClaveImagenBoletaDedicada[];
  // Encuadre por ranura: { "imagenArtista": {x,y,w,h} }. El servicio lo
  // serializa como JSON porque el endpoint recibe multipart/form-data.
  boletaImagenesRecorte?: Record<string, RecorteImagen> | null;
}
