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
