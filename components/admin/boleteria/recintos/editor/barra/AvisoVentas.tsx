"use client";

import { useState } from "react";
import { ChevronDown, Info, Ticket } from "lucide-react";
import { ImpactoRecinto } from "@/interfaces/recinto.interface";
import { formatDisplayDate } from "@/lib/TimeZone";

const plural = (n: number, una: string, varias: string) =>
  `${n} ${n === 1 ? una : varias}`;

// RN-09 y CA-06: qué palcos están protegidos y qué eventos futuros usan
// el recinto (TODOS: a todos les afecta el cambio del dibujo, tengan o no
// ventas), de cuántas ferias
export const resumenVentas = (impacto: ImpactoRecinto) => {
  const eventos = impacto.eventosFuturos;
  const conVentas = eventos.filter((e) => e.vendidos + e.apartados > 0);
  const ferias = new Set(eventos.map((e) => e.feria?.id ?? 0)).size;
  return {
    palcos: `${plural(impacto.palcosProtegidos.length, "palco", "palcos")} con ventas o apartados`,
    eventos: `${plural(eventos.length, "evento futuro", "eventos futuros")} de ${plural(ferias, "feria", "ferias")} (${conVentas.length} con ventas)`,
  };
};

// Aviso del ítem 7 (RN-09, CA-06): el recinto tiene palcos vendidos o
// apartados. Con la lista desplegable de TODOS los eventos futuros que lo
// usan, de todas las ferias, y cuántos palcos tiene cada uno
export default function AvisoVentas({
  impacto,
  error,
}: {
  impacto: ImpactoRecinto | null;
  error: boolean;
}) {
  const [abierto, setAbierto] = useState(false);

  if (error) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs text-gray-600">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        No se pudo revisar si el recinto tiene ventas. Al guardar, el sistema
        igual protege los palcos vendidos.
      </p>
    );
  }
  if (!impacto?.tieneVentas) return null;

  const resumen = resumenVentas(impacto);

  return (
    <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs text-indigo-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-start gap-1.5">
          <Ticket className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
          <span>
            <strong>Este recinto tiene {resumen.palcos}.</strong> Lo usan{" "}
            {resumen.eventos}: los cambios se verán en todos.{" "}
            <strong>✓ Vendido:</strong> se puede mover, cambiar de tamaño o de
            color (pide confirmar), no renombrar ni borrar.{" "}
            <strong>★ Apartado:</strong> no se puede tocar.
          </span>
        </p>
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          aria-expanded={abierto}
          className="inline-flex items-center gap-1 font-medium text-indigo-700 hover:underline"
        >
          {abierto ? "Ocultar eventos" : "Ver eventos"}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${abierto ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {abierto && (
        <ul className="mt-2 divide-y divide-indigo-100 border-t border-indigo-100">
          {impacto.eventosFuturos.map((e) => (
            <li
              key={e.eventoId}
              className="flex flex-wrap items-center justify-between gap-2 py-1.5"
            >
              <span>
                <strong>{e.nombre}</strong> · {formatDisplayDate(e.fechaEvento)}
                {e.feria && ` · ${e.feria.nombre}`}
              </span>
              <span className="text-indigo-700">
                {e.vendidos + e.apartados === 0 && (
                  <span className="text-indigo-400">sin ventas</span>
                )}
                {e.vendidos > 0 && plural(e.vendidos, "vendido", "vendidos")}
                {e.vendidos > 0 && e.apartados > 0 && " · "}
                {e.apartados > 0 &&
                  plural(e.apartados, "apartado", "apartados")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
