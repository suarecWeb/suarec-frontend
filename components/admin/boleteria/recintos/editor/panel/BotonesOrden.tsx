"use client";

import { BringToFront, ChevronUp, ChevronDown, SendToBack } from "lucide-react";
import { Orden } from "../acomodar";

interface BotonesOrdenProps {
  // Si ya esta arriba (o abajo) de su grupo, esos botones se apagan
  puedeSubir: boolean;
  puedeBajar: boolean;
  deshabilitado: boolean;
  // Aclaracion bajo los botones (ej: "Entre los palcos")
  nota: string;
  onOrdenar: (modo: Orden) => void;
}

const BOTONES: {
  modo: Orden;
  titulo: string;
  atajo: string;
  Icono: typeof BringToFront;
}[] = [
  {
    modo: "frente",
    titulo: "Traer al frente",
    atajo: "Ctrl/Cmd + Shift + ↑",
    Icono: BringToFront,
  },
  {
    modo: "subir",
    titulo: "Subir una capa",
    atajo: "Ctrl/Cmd + ↑",
    Icono: ChevronUp,
  },
  {
    modo: "bajar",
    titulo: "Bajar una capa",
    atajo: "Ctrl/Cmd + ↓",
    Icono: ChevronDown,
  },
  {
    modo: "fondo",
    titulo: "Enviar al fondo",
    atajo: "Ctrl/Cmd + Shift + ↓",
    Icono: SendToBack,
  },
];

// Orden de dibujo (capas), como en Canva. Solo dentro de su grupo: una
// referencia nunca pasa encima de un palco (RN-04)
export default function BotonesOrden({
  puedeSubir,
  puedeBajar,
  deshabilitado,
  nota,
  onOrdenar,
}: BotonesOrdenProps) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1">Orden</p>
      <div className="grid grid-cols-4 gap-1">
        {BOTONES.map(({ modo, titulo, atajo, Icono }) => {
          const sube = modo === "frente" || modo === "subir";
          const apagado = deshabilitado || (sube ? !puedeSubir : !puedeBajar);
          return (
            <button
              key={modo}
              type="button"
              onClick={() => onOrdenar(modo)}
              disabled={apagado}
              aria-label={titulo}
              title={`${titulo} (${atajo})`}
              className="h-8 rounded-lg border border-gray-200 text-gray-600 inline-flex items-center justify-center hover:bg-gray-50 hover:text-[#097EEC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icono className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-[11px] text-gray-400">{nota}</p>
    </div>
  );
}
