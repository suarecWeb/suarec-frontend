// ════════════════════════════════════════════════════════════════════════
// DATOS DE PRUEBA — BORRAR ESTE ARCHIVO cuando exista el endpoint del mapa
// del evento (fase 4). Solo sirven para ver como queda la seccion "Palcos"
// (01-10-2026). Nada de esto viene ni va a la base. Lo usan
// PalcosPorFeria.tsx y PalcosEvento.tsx: al borrarlo, esos dos pasan a
// pedir los datos reales.
// ════════════════════════════════════════════════════════════════════════

import { Recinto, RecintoFigura } from "@/interfaces/recinto.interface";
import { EventoConPalcos, FeriaConPalcos, PalcoOcupado } from "./estadosPalco";

let siguienteFigura = 90001;
const figura = (
  datos: Pick<
    RecintoFigura,
    "tipo" | "nombre" | "x" | "y" | "ancho" | "alto" | "color"
  > &
    Partial<RecintoFigura>,
): RecintoFigura => ({
  id: siguienteFigura++,
  recintoId: 9001,
  forma: "RECTANGULO",
  rotacion: 0,
  etiquetaRotada: false,
  bloqueada: false,
  capacidad: datos.tipo === "PALCO" ? 10 : null,
  zIndex: 0,
  ...datos,
});

// 20 palcos: dos filas de 8 frente a la tarima y 2 a cada costado
const palco = (n: number, x: number, y: number, rotacion = 0) =>
  figura({
    tipo: "PALCO",
    nombre: `Palco ${n}`,
    x,
    y,
    ancho: 80,
    alto: 50,
    rotacion,
    // Los de los costados (girados) llevan el nombre girado, como en el
    // editor (PEN-7): horizontal no cabe en 50 de ancho
    etiquetaRotada: rotacion !== 0,
    color: "#097EEC",
  });

const FIGURAS: RecintoFigura[] = [
  figura({
    tipo: "REFERENCIA",
    nombre: "Tarima",
    x: 500,
    y: 85,
    ancho: 360,
    alto: 90,
    color: "#6b7280",
  }),
  figura({
    tipo: "REFERENCIA",
    nombre: "Zona general",
    x: 500,
    y: 500,
    ancho: 640,
    alto: 90,
    color: "#9ca3af",
  }),
  figura({
    tipo: "REFERENCIA",
    nombre: "Entrada",
    x: 930,
    y: 560,
    ancho: 110,
    alto: 50,
    color: "#6b7280",
  }),
  // Decorativas sin nombre (migracion 065)
  figura({
    tipo: "REFERENCIA",
    nombre: null,
    forma: "CIRCULO",
    x: 250,
    y: 85,
    ancho: 40,
    alto: 40,
    color: "#a3a3a3",
  }),
  figura({
    tipo: "REFERENCIA",
    nombre: null,
    forma: "CIRCULO",
    x: 750,
    y: 85,
    ancho: 40,
    alto: 40,
    color: "#a3a3a3",
  }),
  ...Array.from({ length: 8 }, (_, i) => palco(i + 1, 185 + i * 90, 230)),
  ...Array.from({ length: 8 }, (_, i) => palco(i + 9, 185 + i * 90, 320)),
  palco(17, 70, 230, 90),
  palco(18, 70, 320, 90),
  palco(19, 930, 230, 90),
  palco(20, 930, 320, 90),
];

const RECINTO: Recinto = {
  id: 9001,
  nombre: "Coliseo de prueba",
  descripcion: null,
  lienzoAncho: 1000,
  lienzoAlto: 600,
  creadoPorId: 1,
  creadoPor: null,
  activo: true,
  createdAt: "2026-09-25T15:00:00.000Z",
  updatedAt: "2026-09-30T15:00:00.000Z",
  figuras: FIGURAS,
};

// "Palco N" -> id de su figura
const idDe = (n: number) =>
  FIGURAS.find((f) => f.nombre === `Palco ${n}`)?.id as number;

const PRECIO = 1000000;
const CARGO = 5000;
const vendido = (cliente: number, fecha: string): PalcoOcupado => ({
  estado: "VENDIDO",
  comprador: `Cliente de prueba ${cliente}`,
  monto: PRECIO + CARGO, // RN-15
  fecha,
});
const apartado = (nota: string, fecha: string): PalcoOcupado => ({
  estado: "APARTADO",
  apartadoPor: "Admin de prueba",
  nota,
  fecha,
});

const GANADERA = { id: 9100, nombre: "Feria Ganadera 2026 (prueba)" };
const COLOMBIA = { id: 9200, nombre: "Feria de Colombia (prueba)" };

const evento = (
  datos: Omit<
    EventoConPalcos,
    "precioPalco" | "cargoSuarec" | "feria" | "recinto"
  >,
  feria = GANADERA,
  recinto: Recinto | null = RECINTO,
): EventoConPalcos => ({
  precioPalco: PRECIO,
  cargoSuarec: CARGO,
  feria,
  recinto,
  ...datos,
});

// Fechas en hora de Colombia (-05:00)
const EVENTOS_GANADERA: EventoConPalcos[] = [
  // Ya paso: el mapa queda como historial
  evento({
    id: 9104,
    nombre: "Inauguración",
    fechaEvento: "2026-09-12T20:00:00-05:00",
    estado: "cerrado",
    palcos: Object.fromEntries([
      ...[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => [
        idDe(n),
        vendido(n, "2026-09-05T10:00:00-05:00"),
      ]),
      [idDe(7), apartado("Cortesía alcaldía", "2026-09-01T09:00:00-05:00")],
      [idDe(17), apartado("Patrocinador", "2026-09-01T09:00:00-05:00")],
    ]),
  }),
  evento({
    id: 9101,
    nombre: "Noche de palcos — Viernes",
    fechaEvento: "2026-11-20T20:00:00-05:00",
    estado: "venta",
    palcos: {
      [idDe(3)]: vendido(1, "2026-09-28T18:12:00-05:00"),
      [idDe(5)]: { estado: "EN_COMPRA", minutosRestantes: 6 },
      [idDe(7)]: apartado(
        "Cortesía para patrocinador",
        "2026-09-29T11:40:00-05:00",
      ),
      [idDe(9)]: vendido(2, "2026-09-29T20:03:00-05:00"),
      [idDe(12)]: vendido(3, "2026-09-30T09:27:00-05:00"),
      [idDe(17)]: apartado("Prensa", "2026-09-30T16:05:00-05:00"),
    },
  }),
  // El mismo Palco 3 que el viernes esta vendido, aqui esta libre (CA-11)
  evento({
    id: 9102,
    nombre: "Noche de palcos — Sábado",
    fechaEvento: "2026-11-21T20:00:00-05:00",
    estado: "preventa",
    palcos: {
      [idDe(7)]: apartado(
        "Cortesía para patrocinador",
        "2026-09-29T11:42:00-05:00",
      ),
      [idDe(10)]: vendido(4, "2026-09-30T21:15:00-05:00"),
    },
  }),
  evento({
    id: 9103,
    nombre: "Clausura — Domingo",
    fechaEvento: "2026-11-22T18:00:00-05:00",
    estado: "preventa",
    palcos: {},
  }),
];

export const FERIAS_DE_PRUEBA: FeriaConPalcos[] = [
  { ...GANADERA, recinto: RECINTO, eventos: EVENTOS_GANADERA },
  // Sin recinto: sus eventos PALCO no tienen mapa
  {
    ...COLOMBIA,
    recinto: null,
    eventos: [
      evento(
        {
          id: 9201,
          nombre: "Gran concierto",
          fechaEvento: "2026-12-05T19:00:00-05:00",
          estado: "preventa",
          palcos: {},
        },
        COLOMBIA,
        null,
      ),
    ],
  },
];

// El evento y los demas de su feria (para pasar al anterior/siguiente)
export const buscarEventoDePrueba = (id: number) => {
  for (const feria of FERIAS_DE_PRUEBA) {
    const evento = feria.eventos.find((e) => e.id === id);
    if (evento) return { evento, deLaFeria: feria.eventos };
  }
  return null;
};
