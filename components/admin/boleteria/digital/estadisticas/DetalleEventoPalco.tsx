"use client";

import { BadgePercent, Ticket, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import PalcosDelEvento from "./PalcosDelEvento";

export interface VentasPalco {
  recaudado: number;
  valorPalcos: number;
  cargoReunido: number;
  palcosVendidos: number;
}

// Detalle de un evento PALCO con mapa en Estadísticas: el precio es de cada
// palco (va en la lista), así que no hay precio por boleta. Las ventas son
// las pagadas por la app; cada palco son 10 boletas
export default function DetalleEventoPalco({
  eventoId,
  cargo,
  libres,
  ventas,
}: {
  eventoId: number;
  cargo: number;
  libres: number;
  ventas: VentasPalco;
}) {
  const { recaudado, valorPalcos, cargoReunido, palcosVendidos } = ventas;

  return (
    <>
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3">
        <div className="mb-1 flex items-center gap-1.5">
          <BadgePercent className="h-3.5 w-3.5 text-blue-500" />
          <p className="text-[11px] font-medium uppercase tracking-wider text-blue-600">
            Cargo SUAREC del evento
          </p>
        </div>
        <p className="text-base font-semibold text-blue-700">
          {formatCurrency(cargo)}
        </p>
      </div>

      <PalcosDelEvento eventoId={eventoId} />

      {palcosVendidos === 0 ? (
        <div className="py-8 text-center">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">
            Este evento aún no registra palcos pagados por la app
          </p>
          <p className="mt-1 text-xs text-gray-400">
            El recaudo aparecerá aquí cuando se pague el primer palco
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">
                Recaudado por este evento
              </p>
            </div>
            <p className="text-xl font-bold text-emerald-700">
              {formatCurrency(recaudado)}
            </p>
            <p className="mt-0.5 text-[11px] text-emerald-500">
              {palcosVendidos}{" "}
              {palcosVendidos === 1
                ? "palco vendido por la app"
                : "palcos vendidos por la app"}{" "}
              ({palcosVendidos * 10} boletas)
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-50 py-1.5">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Ticket className="h-3.5 w-3.5" />
                Valor de los palcos
              </span>
              <span className="font-medium text-gray-700">
                {formatCurrency(valorPalcos)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 py-1.5">
              <span className="flex items-center gap-1.5 text-gray-400">
                <BadgePercent className="h-3.5 w-3.5" />
                Cargo SUAREC reunido
              </span>
              <span className="font-medium text-gray-700">
                {formatCurrency(cargoReunido)}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">Palcos libres</span>
              <span
                className={`font-medium ${libres === 0 ? "text-red-500" : "text-gray-700"}`}
              >
                {libres}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400">
            Valor de los palcos + cargo SUAREC = recaudado del evento. Solo
            cuenta lo pagado por la app.
          </p>
        </>
      )}
    </>
  );
}
