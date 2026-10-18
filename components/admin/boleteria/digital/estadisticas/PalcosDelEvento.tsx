"use client";

import { useMemo } from "react";
import { Armchair } from "lucide-react";
import PalcosService from "@/services/PalcosService";
import { formatCurrency } from "@/lib/formatCurrency";
import { MapaEventoPalco } from "@/interfaces/palcos.interface";
import { useCarga } from "../palcos/hooks/usePalcosEventos";
import { ESTILO_ESTADO } from "../palcos/estadosPalco";

type EstadoFila = "VENDIDO" | "APARTADO" | "LIBRE";

interface FilaPalco {
  figuraId: number;
  nombre: string;
  // null: palco del admin, que no pasa por la app
  precio: number | null;
  estado: EstadoFila;
}

// Cada palco del evento con su precio y su estado. Precio: el cobrado en la
// compra si se vendió por la app; el propio o el base si está libre; los del
// admin (apartados o vendidos por fuera) no llevan precio. Una compra en
// curso cuenta como libre hasta que se pague, como en el aforo
const filasDePalcos = (mapa: MapaEventoPalco): FilaPalco[] => {
  const precioPropio = new Map(mapa.precios.map((p) => [p.figuraId, p.precio]));
  const ocupado = new Map(mapa.palcos.map((p) => [p.figuraId, p]));
  const precioDe = (figuraId: number): number | null => {
    const palco = ocupado.get(figuraId);
    if (palco?.estado === "APARTADO" || palco?.apartadoPor) return null;
    if (palco?.estado === "VENDIDO" && palco.precioVenta != null) {
      return palco.precioVenta;
    }
    return precioPropio.get(figuraId) ?? mapa.evento.precioPalco;
  };
  const estadoDe = (figuraId: number): EstadoFila => {
    const estado = ocupado.get(figuraId)?.estado;
    return estado === "VENDIDO" || estado === "APARTADO" ? estado : "LIBRE";
  };

  const delDibujo = (mapa.recinto?.figuras ?? [])
    .filter((f) => f.tipo === "PALCO")
    .map((f) => ({
      figuraId: f.id,
      nombre: f.nombre ?? `Palco ${f.id}`,
      precio: precioDe(f.id),
      estado: estadoDe(f.id),
    }));
  // Un palco vendido que después se borró del dibujo sigue siendo una venta
  const enElDibujo = new Set(delDibujo.map((f) => f.figuraId));
  const fueraDelDibujo = mapa.palcos
    .filter((p) => !enElDibujo.has(p.figuraId) && p.estado !== "EN_COMPRA")
    .map((p) => ({
      figuraId: p.figuraId,
      nombre: p.palcoNombre,
      precio: precioDe(p.figuraId),
      estado: estadoDe(p.figuraId),
    }));

  return [...delDibujo, ...fueraDelDibujo].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { numeric: true }),
  );
};

// Lista de palcos de un evento PALCO en el detalle de Estadísticas: nombre,
// precio y si está vendido. Sin recinto no hay palcos dibujados
export default function PalcosDelEvento({ eventoId }: { eventoId: number }) {
  const { carga, reintentar } = useCarga<MapaEventoPalco>(
    () => PalcosService.getMapaEvento(eventoId),
    "No se pudieron cargar los palcos",
    eventoId,
  );
  const filas = useMemo(
    () => (carga.estado === "listo" ? filasDePalcos(carga.datos) : []),
    [carga],
  );

  if (carga.estado === "cargando") {
    return <p className="text-xs text-gray-400">Cargando palcos...</p>;
  }
  if (carga.estado === "error") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
        <span>{carga.mensaje}</span>
        {!carga.noEncontrado && (
          <button
            type="button"
            onClick={reintentar}
            className="font-medium underline"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }
  if (!carga.datos.recinto) return null;

  return (
    <section aria-label="Palcos del evento">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Armchair className="h-3.5 w-3.5 text-gray-400" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          Palcos del evento
        </p>
      </div>
      {filas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-4 text-center text-xs text-gray-500">
          El recinto todavía no tiene palcos dibujados.
        </p>
      ) : (
        <ul className="divide-y divide-gray-50 rounded-xl border border-gray-100">
          {filas.map((f) => {
            const { etiqueta, color, marca } = ESTILO_ESTADO[f.estado];
            return (
              <li
                key={f.figuraId}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="font-medium text-gray-800">{f.nombre}</span>
                <span className="flex items-center gap-3">
                  {f.precio === null ? (
                    <span className="text-xs text-gray-400">
                      fuera de la app
                    </span>
                  ) : (
                    <span className="tabular-nums text-gray-700">
                      {formatCurrency(f.precio)}
                    </span>
                  )}
                  <span
                    className="inline-flex min-w-[5.5rem] items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ background: color }}
                  >
                    {marca && <span aria-hidden>{marca}</span>}
                    {etiqueta}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
