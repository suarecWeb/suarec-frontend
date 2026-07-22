export enum MetodoPagoFisico {
  EFECTIVO = "efectivo",
  TRANSFERENCIA = "transferencia",
}

export interface VentaFisicaGlobal {
  id: number;
  eventoId: number;
  eventoNombre: string;
  adminId: number;
  cantidad: number;
  metodoPago: MetodoPagoFisico;
  montoTotal: number;
  cambio: number | null;
  comision: number;
  createdAt: string;
}

export interface VentasFisicasGlobalResponse {
  ventas: VentaFisicaGlobal[];
  total: number;
  page: number;
  totalPaginas: number;
}

export interface RecaudoGlobalFisicoResponse {
  recaudado: number;
  boletasVendidas: number;
  totalVentas: number;
}

export interface RecaudoMetodoPago {
  monto: number;
  ventas: number;
}

export interface RecaudoEventoFisicoResponse {
  eventoId: number;
  eventoNombre: string;
  precioBase: number;
  recaudado: number;
  comisionTotal: number;
  neto: number;
  boletasVendidas: number;
  totalVentas: number;
  efectivo: RecaudoMetodoPago;
  transferencia: RecaudoMetodoPago;
}

export interface ResumenEventoFisico {
  eventoId: number;
  eventoNombre: string;
  disponibles: number;
  vendidas: number;
  total: number;
}

export interface BoletaFisicaValidada {
  id: string;
  eventoNombre: string;
  validadorNombre: string;
  validadorEmail: string;
  escaneadaAt: string;
}

export interface ValidadorResumen {
  validadorId: number | null;
  validadorNombre: string;
  validadorEmail: string;
  cantidad: number;
}

export interface BoletasFisicasValidadasResponse {
  boletas: BoletaFisicaValidada[];
  total: number;
  page: number;
  totalPaginas: number;
  // Conteo por validador sobre todo el filtro activo (opcional por
  // compatibilidad con backend sin actualizar)
  resumenValidadores?: ValidadorResumen[];
}
