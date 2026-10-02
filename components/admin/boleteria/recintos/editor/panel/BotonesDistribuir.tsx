"use client";

import {
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
} from "lucide-react";
import { Distribucion } from "../acomodar";

interface BotonesDistribuirProps {
  // Hacen falta 3 figuras libres (las bloqueadas no se mueven ni cuentan)
  deshabilitado: boolean;
  onDistribuir: (eje: Distribucion) => void;
}

const BOTONES: {
  eje: Distribucion;
  texto: string;
  titulo: string;
  Icono: typeof AlignHorizontalSpaceBetween;
}[] = [
  {
    eje: "horizontal",
    texto: "Horizontal",
    titulo: "Mismo espacio entre figuras, de izquierda a derecha",
    Icono: AlignHorizontalSpaceBetween,
  },
  {
    eje: "vertical",
    texto: "Vertical",
    titulo: "Mismo espacio entre figuras, de arriba hacia abajo",
    Icono: AlignVerticalSpaceBetween,
  },
];

// Distribuir (PEN-24): el mismo espacio entre las figuras elegidas; las de
// los extremos no se mueven
export default function BotonesDistribuir({
  deshabilitado,
  onDistribuir,
}: BotonesDistribuirProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Distribuir</p>
      <div className="grid grid-cols-2 gap-1">
        {BOTONES.map(({ eje, texto, titulo, Icono }) => (
          <button
            key={eje}
            type="button"
            onClick={() => onDistribuir(eje)}
            disabled={deshabilitado}
            aria-label={`Distribuir en ${eje}`}
            title={
              deshabilitado ? "Elige 3 o más figuras sin bloquear" : titulo
            }
            className="h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 inline-flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-[#097EEC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Icono className="h-4 w-4" />
            {texto}
          </button>
        ))}
      </div>
    </div>
  );
}
