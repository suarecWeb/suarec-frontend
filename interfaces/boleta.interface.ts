export enum BoletaEstado {
  ACTIVA = "activa",
  USADA = "usada",
  CANCELADA = "cancelada",
}

export interface ValidacionUsuario {
  nombre: boolean;
  telefono: boolean;
  cedula: boolean;
  email: boolean;
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
  validacion?: ValidacionUsuario | null;
}

export enum TransaccionEstado {
  PENDIENTE = "pendiente",
  APROBADO = "aprobado",
  RECHAZADO = "rechazado",
  CANCELADO = "cancelado",
  EXPIRADO = "expirado",
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
  tipo?: "GENERAL" | "VIP" | null;
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
  cargoPorBoleta: number;
  boletaIds: number[] | null;
  wompiEnvironment: string | null;
  createdAt: string;
}

export interface WompiIntento {
  id: string;
  status: string;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  payment_method_type: string;
  created_at: string;
  finalized_at: string | null;
}

export interface DetalleTransaccion {
  transaccion: TransaccionBoleta;
  wompiData: WompiIntento | null;
  wompiError: string | null;
}
