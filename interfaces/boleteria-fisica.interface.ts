export enum MetodoPagoFisico {
  EFECTIVO = "efectivo",
  TRANSFERENCIA = "transferencia",
}

export interface GenerarLoteFisicoDto {
  cantidad: number;
}

export interface GenerarLoteFisicoResponse {
  loteId: number;
  generadas: number;
}

export interface VenderBoletasFisicasDto {
  cantidad: number;
  metodoPago: MetodoPagoFisico;
  billeteRecibido?: number;
}

export interface VenderBoletasFisicasResponse {
  ventaId: number;
  boletaIds: string[];
  cambio: number | null;
}

export interface ValidarBoletaFisicaDto {
  qrToken: string;
}

export interface ValidarBoletaFisicaResponse {
  message: string;
  boleta: {
    id: string;
    estado: string;
    eventoId: number;
  };
}

export interface BoletaFisicaConQR {
  id: string;
  estado: string;
  qrToken: string;
}

export interface VentaFisicaConBoletasResponse {
  ventaId: number;
  eventoId: number;
  adminId: number;
  cantidad: number;
  metodoPago: MetodoPagoFisico;
  montoTotal: number;
  cambio: number | null;
  comision: number;
  createdAt: string;
  boletas: BoletaFisicaConQR[];
}

export interface ContarBoletasFisicasDisponiblesResponse {
  eventoId: number;
  disponibles: number;
  vendidas: number;
  total: number;
}
