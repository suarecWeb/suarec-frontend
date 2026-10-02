import type { ReactNode } from "react";
import { Download, Lock, MousePointerClick, Unlock, Users } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDisplayDate } from "@/lib/TimeZone";
import { FiguraEditor } from "../recintos/editor/figuras";
import {
  CUPOS_POR_PALCO,
  ESTILO_ESTADO,
  EstadoPalco,
  EventoConPalcos,
  PalcoOcupado,
} from "./estadosPalco";

interface PanelPalcoProps {
  evento: EventoConPalcos;
  // El palco elegido en el mapa (null: ninguno)
  palco: FiguraEditor | null;
  estado: EstadoPalco;
  ocupado?: PalcoOcupado;
  pasado: boolean;
}

const Fila = ({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) => (
  <div className="flex justify-between gap-3 text-sm">
    <dt className="text-gray-500">{etiqueta}</dt>
    <dd className="text-gray-800 font-medium text-right">{valor}</dd>
  </div>
);

// Acciones de la fase 7: se ven, pero todavia no hacen nada
const BotonFase7 = ({
  icono,
  children,
}: {
  icono: ReactNode;
  children: ReactNode;
}) => (
  <button
    type="button"
    disabled
    title="Disponible en la fase 7"
    className="w-full h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {icono}
    {children}
  </button>
);

// Detalle del palco elegido en el mapa del evento. Cambia segun su estado
export default function PanelPalco({
  evento,
  palco,
  estado,
  ocupado,
  pasado,
}: PanelPalcoProps) {
  if (!palco) {
    return (
      <aside className="w-full lg:w-72 flex-shrink-0 rounded-xl border border-dashed border-gray-200 p-6 flex flex-col items-center justify-center text-center gap-2">
        <MousePointerClick className="h-6 w-6 text-gray-300" />
        <p className="text-sm text-gray-500">
          Toca un palco del mapa para ver qué pasó con él en este evento.
        </p>
      </aside>
    );
  }

  const { etiqueta, color, marca } = ESTILO_ESTADO[estado];
  const totalPalco = evento.precioPalco + evento.cargoSuarec;

  return (
    <aside
      aria-label={`Detalle de ${palco.nombre}`}
      className="w-full lg:w-72 flex-shrink-0 rounded-xl border border-gray-200 p-4 flex flex-col gap-4"
    >
      <div>
        <h3 className="text-base font-semibold text-gray-900">
          {palco.nombre}
        </h3>
        <span
          className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ background: color }}
        >
          {marca && <span aria-hidden>{marca}</span>}
          {etiqueta}
        </span>
      </div>

      <dl className="flex flex-col gap-2">
        <Fila
          etiqueta="Capacidad"
          valor={
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              {CUPOS_POR_PALCO} personas
            </span>
          }
        />
        <Fila
          etiqueta="Precio del palco"
          valor={formatCurrency(evento.precioPalco)}
        />
        {/* RN-15: el cargo va UNA vez por palco */}
        <Fila
          etiqueta="Cargo SUAREC"
          valor={formatCurrency(evento.cargoSuarec)}
        />
        <Fila etiqueta="Total" valor={formatCurrency(totalPalco)} />
      </dl>

      <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
        {estado === "LIBRE" &&
          (pasado ? (
            <p className="text-sm text-gray-500">
              No se vendió. El evento ya pasó.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Disponible: cualquier comprador lo puede tomar desde la app.
              </p>
              <BotonFase7 icono={<Lock className="h-4 w-4" />}>
                Apartar palco
              </BotonFase7>
              <p className="text-[11px] text-gray-400 -mt-1">
                Apartar palcos llega en la fase 7 (RN-10).
              </p>
            </>
          ))}

        {estado === "EN_COMPRA" && (
          <>
            <p className="text-sm text-gray-600">
              Alguien lo está pagando
              {ocupado?.minutosRestantes !== undefined &&
                `: quedan ~${ocupado.minutosRestantes} min de reserva`}
              .
            </p>
            <p className="text-[11px] text-gray-400">
              Mientras dure la compra nadie lo puede apartar ni modificar
              (RN-06). Si no paga a tiempo, se libera solo.
            </p>
          </>
        )}

        {estado === "APARTADO" && ocupado && (
          <>
            <dl className="flex flex-col gap-2">
              <Fila etiqueta="Apartado por" valor={ocupado.apartadoPor} />
              {ocupado.nota && <Fila etiqueta="Nota" valor={ocupado.nota} />}
              {ocupado.fecha && (
                <Fila
                  etiqueta="Fecha"
                  valor={formatDisplayDate(ocupado.fecha)}
                />
              )}
            </dl>
            {!pasado && (
              <BotonFase7 icono={<Unlock className="h-4 w-4" />}>
                Liberar palco
              </BotonFase7>
            )}
            <BotonFase7 icono={<Download className="h-4 w-4" />}>
              Descargar boletas (PDF)
            </BotonFase7>
            <p className="text-[11px] text-gray-400 -mt-1">
              Liberar y descargar llegan en la fase 7 (PEN-13, PEN-18).
            </p>
          </>
        )}

        {estado === "VENDIDO" && ocupado && (
          <>
            <dl className="flex flex-col gap-2">
              <Fila etiqueta="Comprador" valor={ocupado.comprador} />
              {ocupado.monto !== undefined && (
                <Fila etiqueta="Pagó" valor={formatCurrency(ocupado.monto)} />
              )}
              {ocupado.fecha && (
                <Fila
                  etiqueta="Fecha de compra"
                  valor={formatDisplayDate(ocupado.fecha)}
                />
              )}
              <Fila etiqueta="Boletas" valor={CUPOS_POR_PALCO} />
            </dl>
            <BotonFase7 icono={<Download className="h-4 w-4" />}>
              Descargar boletas (PDF)
            </BotonFase7>
            <p className="text-[11px] text-gray-400 -mt-1">
              Descargar llega en la fase 7 (PEN-18).
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
