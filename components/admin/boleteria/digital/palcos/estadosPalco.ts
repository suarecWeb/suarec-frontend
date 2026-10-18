import { Recinto } from "@/interfaces/recinto.interface";
import {
  AvisoPalcoAdmin,
  MapaEventoPalco,
  PalcoOcupadoAdmin,
} from "@/interfaces/palcos.interface";

// Estado de un palco EN UN EVENTO. El recinto es solo el plano: lo que se
// vende es el palco en un evento, y el mismo palco puede estar vendido el
// viernes y libre el sabado
//   LIBRE      se puede comprar o apartar
//   EN_COMPRA  alguien lo esta pagando: nadie lo puede tocar
//   APARTADO   lo aparto el admin: no vence; se marca vendido o se libera
//   VENDIDO    pagado
export type EstadoPalco = "LIBRE" | "EN_COMPRA" | "APARTADO" | "VENDIDO";

// Cupos y boletas de un palco (CUPOS_POR_PALCO del backend)
export const CUPOS_POR_PALCO = 10;

// Aviso de ventas que no se ven en el mapa de hoy, igual en la lista y en
// el mapa: el palco se borro del dibujo, dejo de ser PALCO o la feria
// cambio de recinto
export const textoVentasFueraDelMapa = (n: number) =>
  `${n} venta(s) en palcos que ya no están en el mapa (se borraron, cambiaron de tipo o la feria cambió de recinto)`;

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

export type EstadoEventoPalco = "preventa" | "venta" | "cerrado" | "cancelado";

export const ETIQUETA_ESTADO_EVENTO: Record<EstadoEventoPalco, string> = {
  preventa: "Preventa",
  venta: "En venta",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

export const esPasado = (fechaEvento: string) =>
  new Date(fechaEvento).getTime() < Date.now();

// El evento sigue en pie hasta las 3:00 a. m. de Colombia (UTC-5) del dia
// siguiente: la misma regla del backend
export const finDelEvento = (fechaEvento: string) => {
  const colombia = new Date(new Date(fechaEvento).getTime() - 5 * 3600 * 1000);
  return Date.UTC(
    colombia.getUTCFullYear(),
    colombia.getUTCMonth(),
    colombia.getUTCDate() + 1,
    8,
  );
};

// Apartar: solo en preventa o venta y con el evento en pie (ahora: hora
// del servidor)
export const sePuedeApartar = (
  evento: { estado: string; fechaEvento: string },
  ahora: number,
) =>
  (evento.estado === "preventa" || evento.estado === "venta") &&
  ahora < finDelEvento(evento.fechaEvento);

// Vender o liberar un apartado ya hecho: también con las ventas cerradas,
// mientras el evento no esté cancelado ni haya pasado
export const sePuedeResolverApartado = (
  evento: { estado: string; fechaEvento: string },
  ahora: number,
) =>
  ["preventa", "venta", "cerrado"].includes(evento.estado) &&
  ahora < finDelEvento(evento.fechaEvento);

// Hasta cuando corre una compra: el margen con el banco si ya empezo, si
// no la reserva
export const finDeLaCompra = (p?: PalcoOcupadoAdmin) =>
  p?.graciaHasta ?? p?.reservadoHasta ?? null;

// Segundos que faltan (0 si ya paso); null sin hora
export const segundosRestantes = (hasta: string | null, ahora: number) =>
  hasta === null
    ? null
    : Math.max(0, Math.floor((new Date(hasta).getTime() - ahora) / 1000));

// "7:05"
export const cuentaRegresiva = (segundos: number) =>
  `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;

export const hayContador = (palcos: PalcoOcupadoAdmin[]) =>
  palcos.some((p) => p.estado === "EN_COMPRA" && finDeLaCompra(p) !== null);

// El mapa despues del aviso de un palco: libre sale de la lista; si no,
// toma el estado nuevo. Lo que el aviso no trae (el monto) se conserva
// solo si el estado no cambio
export const conAviso = (
  mapa: MapaEventoPalco,
  aviso: AvisoPalcoAdmin,
): MapaEventoPalco => {
  const { figuraId, estado } = aviso;
  if (figuraId === undefined || !estado) return mapa;
  const previo = mapa.palcos.find((p) => p.figuraId === figuraId);
  const resto = mapa.palcos.filter((p) => p.figuraId !== figuraId);
  if (estado === "LIBRE") return { ...mapa, palcos: resto };
  const mismo = previo?.estado === estado ? previo : undefined;
  return {
    ...mapa,
    palcos: [
      ...resto,
      {
        figuraId,
        estado,
        palcoNombre: previo?.palcoNombre ?? "",
        reservadoEn: aviso.reservadoEn ?? null,
        reservadoHasta: aviso.reservadoHasta ?? null,
        graciaHasta: aviso.graciaHasta ?? null,
        monto: mismo?.monto ?? null,
        comprador: aviso.comprador ?? null,
        apartadoPor:
          aviso.apartadoPor !== undefined
            ? aviso.apartadoPor
            : (mismo?.apartadoPor ?? null),
        nota: aviso.nota !== undefined ? aviso.nota : (mismo?.nota ?? null),
        cliente:
          aviso.cliente !== undefined
            ? aviso.cliente
            : (mismo?.cliente ?? null),
        actualizadoEn: mismo?.actualizadoEn ?? aviso.cambiadoEn,
      },
    ],
  };
};

// Los palcos ocupados del evento por id de figura
export const ocupadosPorFigura = (palcos: PalcoOcupadoAdmin[]) =>
  new Map(palcos.map((p) => [p.figuraId, p]));

// Cuantos palcos hay en cada estado, contando SOLO los que estan dibujados
// (total = palcos del recinto). fueraDelDibujo: ventas de palcos
// que ya no estan en el dibujo (borrados despues de un evento pasado)
export const contarMapa = (
  recinto: Recinto,
  ocupados: Map<number, PalcoOcupadoAdmin>,
) => {
  const conteo: Record<EstadoPalco, number> = {
    LIBRE: 0,
    EN_COMPRA: 0,
    APARTADO: 0,
    VENDIDO: 0,
  };
  const palcos = (recinto.figuras ?? []).filter((f) => f.tipo === "PALCO");
  const dibujados = new Set(palcos.map((f) => f.id));
  palcos.forEach((f) => conteo[ocupados.get(f.id)?.estado ?? "LIBRE"]++);
  const fueraDelDibujo = Array.from(ocupados.keys()).filter(
    (id) => !dibujados.has(id),
  ).length;
  return { conteo, total: palcos.length, fueraDelDibujo };
};
