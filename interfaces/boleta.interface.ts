export enum BoletaEstado {
  ACTIVA = "activa",
  USADA = "usada",
  CANCELADA = "cancelada",
}

export interface BoletaSoporte {
  boletaId: number;
  qrToken: string;
  estado: BoletaEstado;
  precioPagado: number;
  pdfUrl: string | null;
  createdAt: string;
  compradorNombre: string;
  compradorEmail: string;
  eventoNombre: string;
  eventoFecha: string;
}

export enum TransaccionEstado {
  PENDIENTE = "pendiente",
  APROBADO = "aprobado",
  RECHAZADO = "rechazado",
}

export enum Pasarela {
  WOMPI = "wompi",
  PSE = "pse",
  STRIPE = "stripe",
}

export interface Comprador {
  id: number;
  name: string;
  email: string;
}

export interface EventoResumen {
  id: number;
  nombre: string;
  fechaEvento: string;
  ubicacion: string;
}

export interface TransaccionBoleta {
  id: number;
  pasarela: Pasarela;
  referencia: string;
  eventoId: number;
  evento?: EventoResumen;
  compradorId: number;
  comprador?: Comprador;
  cantidad: number;
  estadoPago: TransaccionEstado;
  monto: number;
  precioPorBoleta: number;
  comisionPorBoleta: number;
  boletaIds: number[] | null;
  createdAt: string;
}
