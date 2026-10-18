"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Armchair, X } from "lucide-react";
import { PrecioPalco } from "@/interfaces/palcos.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDisplayDate } from "@/lib/TimeZone";

export interface ResumenEventoPalco {
  // datetime-local en hora de Colombia ("2026-11-20T20:00")
  fechaEvento: string;
  feria: string;
  recinto: string;
  palcos: number;
  precioBase?: number;
  preciosPropios: PrecioPalco[];
}

interface ConfirmarEventoPalcoProps {
  // crear: antes de crear un PALCO. cambiarFeria: al editar un PALCO y
  // cambiarle la feria (RN-25)
  modo: "crear" | "cambiarFeria";
  resumen: ResumenEventoPalco;
  avisos: string[];
  guardando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

// Colombia no cambia de hora: UTC-5 todo el año
const fechaLegible = (local: string) =>
  local ? formatDisplayDate(`${local}:00-05:00`) : "";

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="text-gray-500">{etiqueta}</dt>
      <dd className="font-medium text-gray-800 text-right">{valor}</dd>
    </div>
  );
}

// Resumen para revisar antes de guardar: un PALCO no cambia de tipo
// despues y sus precios dependen del recinto de la feria
export default function ConfirmarEventoPalco({
  modo,
  resumen,
  avisos,
  guardando,
  onConfirmar,
  onCancelar,
}: ConfirmarEventoPalcoProps) {
  const confirmarRef = useRef<HTMLButtonElement>(null);
  useEffect(() => confirmarRef.current?.focus(), []);
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !guardando) onCancelar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [guardando, onCancelar]);

  // Como en el boceto: "15 a $1.000.000 · 5 a $2.500.000" (primero el
  // base, luego los propios del mas caro al mas barato)
  const porPrecio = new Map<number, number>();
  resumen.preciosPropios.forEach(({ precio }) =>
    porPrecio.set(precio, (porPrecio.get(precio) ?? 0) + 1),
  );
  const alBase = resumen.palcos - resumen.preciosPropios.length;
  const precios = [
    ...(alBase > 0
      ? [`${alBase} a ${formatCurrency(resumen.precioBase)} (base)`]
      : []),
    ...Array.from(porPrecio.entries())
      .sort(([a], [b]) => b - a)
      .map(([precio, cantidad]) => `${cantidad} a ${formatCurrency(precio)}`),
  ].join(" · ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-palco-titulo"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Armchair className="h-5 w-5 text-[#097EEC]" />
            <h2
              id="confirmar-palco-titulo"
              className="text-base font-semibold text-gray-800"
            >
              {modo === "crear"
                ? "Confirmar evento PALCO"
                : "Confirmar cambio de feria"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <dl className="divide-y divide-gray-100">
            <Fila etiqueta="Feria" valor={resumen.feria} />
            <Fila
              etiqueta="Recinto"
              valor={`${resumen.recinto} · ${resumen.palcos} palcos`}
            />
            <Fila etiqueta="Precios" valor={precios} />
            <Fila etiqueta="Fecha" valor={fechaLegible(resumen.fechaEvento)} />
          </dl>

          <ul className="space-y-1">
            {avisos.map((aviso) => (
              <li
                key={aviso}
                className="flex gap-1.5 text-[11px] text-amber-700"
              >
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                {aviso}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            Volver
          </button>
          <button
            ref={confirmarRef}
            type="button"
            onClick={onConfirmar}
            disabled={guardando}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {guardando
              ? "Guardando..."
              : modo === "crear"
                ? "Sí, crear evento"
                : "Sí, guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
