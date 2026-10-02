import { Recinto } from "@/interfaces/recinto.interface";

// Estado de un palco EN UN EVENTO. El recinto es solo el plano: lo que se
// vende es el palco en un evento, y el mismo palco puede estar vendido el
// viernes y libre el sabado (CA-11)
//   LIBRE      se puede comprar o apartar
//   EN_COMPRA  alguien lo esta pagando (RN-06): nadie lo puede tocar
//   APARTADO   lo aparto el admin (RN-10, PEN-13): no vence, se puede liberar
//   VENDIDO    pagado (RN-08)
export type EstadoPalco = "LIBRE" | "EN_COMPRA" | "APARTADO" | "VENDIDO";

// Cupos y boletas de un palco (RN-01; CUPOS_POR_PALCO del backend)
export const CUPOS_POR_PALCO = 10;

export const ESTADOS_PALCO: EstadoPalco[] = [
  "LIBRE",
  "EN_COMPRA",
  "APARTADO",
  "VENDIDO",
];

// Color y marca de cada estado. La marca va junto al nombre del palco para
// que el estado no dependa solo del color (daltonismo, impresion)
export const ESTILO_ESTADO: Record<
  EstadoPalco,
  { etiqueta: string; plural: string; color: string; marca: string }
> = {
  LIBRE: { etiqueta: "Libre", plural: "Libres", color: "#16a34a", marca: "" },
  EN_COMPRA: {
    etiqueta: "En compra",
    plural: "En compra",
    color: "#f59e0b",
    marca: "⏱",
  },
  APARTADO: {
    etiqueta: "Apartado",
    plural: "Apartados",
    color: "#4f46e5",
    marca: "★",
  },
  VENDIDO: {
    etiqueta: "Vendido",
    plural: "Vendidos",
    color: "#dc2626",
    marca: "✓",
  },
};

// Lo que se sabe de un palco ocupado en un evento. Los datos de quien lo
// compro o aparto solo los ve el admin (PEN-5 aplica a la app)
export interface PalcoOcupado {
  estado: Exclude<EstadoPalco, "LIBRE">;
  // EN_COMPRA: cuanto le queda a la reserva (RN-06)
  minutosRestantes?: number;
  // APARTADO (RN-10, PEN-14)
  apartadoPor?: string;
  nota?: string;
  // VENDIDO (RN-19)
  comprador?: string;
  monto?: number;
  // Cuando se aparto o se vendio
  fecha?: string;
}

export type EstadoEventoPalco = "preventa" | "venta" | "cerrado" | "cancelado";

// Un evento PALCO con su mapa. palcos: id de figura -> ocupado; el que no
// esta, esta libre
export interface EventoConPalcos {
  id: number;
  nombre: string;
  fechaEvento: string;
  estado: EstadoEventoPalco;
  precioPalco: number;
  // Cargo SUAREC: una sola vez por palco (RN-15)
  cargoSuarec: number;
  feria: { id: number; nombre: string };
  // El de su feria (RN-13); null si la feria no tiene recinto
  recinto: Recinto | null;
  palcos: Record<number, PalcoOcupado>;
}

export interface FeriaConPalcos {
  id: number;
  nombre: string;
  recinto: Recinto | null;
  eventos: EventoConPalcos[];
}

export const estadoDe = (
  evento: EventoConPalcos,
  figuraId: number,
): EstadoPalco => evento.palcos[figuraId]?.estado ?? "LIBRE";

// Cuantos palcos hay en cada estado. Total = palcos dibujados (RN-20)
export const contarEstados = (evento: EventoConPalcos) => {
  const conteo: Record<EstadoPalco, number> = {
    LIBRE: 0,
    EN_COMPRA: 0,
    APARTADO: 0,
    VENDIDO: 0,
  };
  const palcos = (evento.recinto?.figuras ?? []).filter(
    (f) => f.tipo === "PALCO",
  );
  palcos.forEach((f) => conteo[estadoDe(evento, f.id)]++);
  return { conteo, total: palcos.length };
};

export const esPasado = (evento: EventoConPalcos) =>
  new Date(evento.fechaEvento).getTime() < Date.now();

export const ETIQUETA_ESTADO_EVENTO: Record<EstadoEventoPalco, string> = {
  preventa: "Preventa",
  venta: "En venta",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};
