"use client";

import { ReactNode } from "react";
import { Trash2, Lock, Unlock } from "lucide-react";
import { Alineacion, Distribucion, Orden } from "../acomodar";
import BotonesOrden from "./BotonesOrden";
import BotonesAlinear from "./BotonesAlinear";
import BotonesDistribuir from "./BotonesDistribuir";

interface PanelGrupoProps {
  // Piezas que comparte con el panel de una figura
  resumen: ReactNode;
  botonesCopiar: ReactNode;
  totalSeleccionadas: number;
  // Cuantas de las seleccionadas estan bloqueadas (como Canva)
  bloqueadasEnSeleccion: number;
  onBloquear: (bloquear: boolean) => void;
  onAlinear: (modo: Alineacion) => void;
  onDistribuir: (eje: Distribucion) => void;
  onOrdenar: (modo: Orden) => void;
  onBorrar: () => void;
}

// Varias figuras seleccionadas: solo acciones de grupo. El grupo se mueve
// arrastrando cualquiera; por ahora no se estira ni se rota. Como no hay
// "Tamaño", el candado del grupo va arriba
export default function PanelGrupo({
  resumen,
  botonesCopiar,
  totalSeleccionadas,
  bloqueadasEnSeleccion,
  onBloquear,
  onAlinear,
  onDistribuir,
  onOrdenar,
  onBorrar,
}: PanelGrupoProps) {
  const todasBloqueadas = bloqueadasEnSeleccion === totalSeleccionadas;

  return (
    // overflow-y-auto: con alinear y orden, en pantallas bajas se desplaza
    <aside className="w-64 flex-shrink-0 rounded-xl border border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
      {resumen}

      <div>
        <button
          type="button"
          onClick={() => onBloquear(!todasBloqueadas)}
          aria-pressed={todasBloqueadas}
          title={
            todasBloqueadas ? "Clic para desbloquear" : "Clic para bloquear"
          }
          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
            todasBloqueadas
              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {todasBloqueadas ? (
            <Lock className="h-3.5 w-3.5" />
          ) : (
            <Unlock className="h-3.5 w-3.5" />
          )}
          {todasBloqueadas
            ? `${totalSeleccionadas} bloqueadas`
            : `Bloquear ${totalSeleccionadas} figuras`}
        </button>
        {todasBloqueadas && (
          <p className="mt-1 text-[11px] text-amber-700">
            No se mueven, estiran, rotan ni borran. Clic en el candado para
            desbloquear.
          </p>
        )}
      </div>

      {/* Alinear (PEN-24): la referencia es todo lo seleccionado; una
          bloqueada sirve de ancla y no se mueve */}
      <BotonesAlinear
        respecto="grupo"
        deshabilitado={todasBloqueadas}
        motivoDeshabilitado="Están todas bloqueadas"
        onAlinear={onAlinear}
      />

      <BotonesDistribuir
        deshabilitado={totalSeleccionadas - bloqueadasEnSeleccion < 3}
        onDistribuir={onDistribuir}
      />

      <BotonesOrden
        puedeSubir
        puedeBajar
        deshabilitado={todasBloqueadas}
        nota="Cada una dentro de su grupo: los palcos siempre quedan encima de las referencias."
        onOrdenar={onOrdenar}
      />

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
        <p className="text-sm font-semibold text-gray-700">
          {totalSeleccionadas} figuras seleccionadas
        </p>
        <p className="text-xs text-gray-400">
          Arrastra cualquiera para moverlas juntas; las esquinas del recuadro
          las agrandan o achican juntas. Shift + clic agrega o quita una.
        </p>
        {bloqueadasEnSeleccion > 0 && (
          <p className="flex items-center gap-1 text-xs text-amber-700">
            <Lock className="h-3 w-3" />
            {bloqueadasEnSeleccion} bloqueada
            {bloqueadasEnSeleccion === 1 ? "" : "s"}: no se mueve
            {bloqueadasEnSeleccion === 1 ? "" : "n"} ni se borra
            {bloqueadasEnSeleccion === 1 ? "" : "n"}
          </p>
        )}
      </div>

      {botonesCopiar}
      <button
        type="button"
        onClick={onBorrar}
        className="inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Borrar {totalSeleccionadas} figuras
      </button>
    </aside>
  );
}
