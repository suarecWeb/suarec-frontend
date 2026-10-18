"use client";

import {
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
} from "lucide-react";
import { Alineacion } from "../acomodar";

interface BotonesAlinearProps {
  // "grupo": las elegidas entre si; "lienzo": una figura contra el lienzo
  respecto: "grupo" | "lienzo";
  deshabilitado: boolean;
  motivoDeshabilitado: string;
  onAlinear: (modo: Alineacion) => void;
}

const ICONOS: Record<Alineacion, typeof AlignStartVertical> = {
  izquierda: AlignStartVertical,
  centro: AlignCenterVertical,
  derecha: AlignEndVertical,
  arriba: AlignStartHorizontal,
  medio: AlignCenterHorizontal,
  abajo: AlignEndHorizontal,
};

// Tres para el eje horizontal y tres para el vertical, como Canva
const TITULOS: Record<"grupo" | "lienzo", Record<Alineacion, string>> = {
  grupo: {
    izquierda: "Alinear a la izquierda",
    centro: "Centrar en horizontal",
    derecha: "Alinear a la derecha",
    arriba: "Alinear arriba",
    medio: "Centrar en vertical",
    abajo: "Alinear abajo",
  },
  lienzo: {
    izquierda: "Pegar al borde izquierdo del lienzo",
    centro: "Centrar en el lienzo (horizontal)",
    derecha: "Pegar al borde derecho del lienzo",
    arriba: "Pegar al borde de arriba del lienzo",
    medio: "Centrar en el lienzo (vertical)",
    abajo: "Pegar al borde de abajo del lienzo",
  },
};

// Botones de alinear (PEN-24). Con varias figuras las alinea entre si; con
// una sola, la ubica en el lienzo (como "Posición" en Canva)
export default function BotonesAlinear({
  respecto,
  deshabilitado,
  motivoDeshabilitado,
  onAlinear,
}: BotonesAlinearProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">
        {respecto === "grupo" ? "Alinear" : "Posición en el lienzo"}
      </p>
      <div className="grid grid-cols-6 gap-1">
        {(Object.keys(ICONOS) as Alineacion[]).map((modo) => {
          const Icono = ICONOS[modo];
          const titulo = TITULOS[respecto][modo];
          return (
            <button
              key={modo}
              type="button"
              onClick={() => onAlinear(modo)}
              disabled={deshabilitado}
              aria-label={titulo}
              title={deshabilitado ? motivoDeshabilitado : titulo}
              className="h-8 rounded-lg border border-gray-200 text-gray-600 inline-flex items-center justify-center hover:bg-gray-50 hover:text-[#097EEC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icono className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
