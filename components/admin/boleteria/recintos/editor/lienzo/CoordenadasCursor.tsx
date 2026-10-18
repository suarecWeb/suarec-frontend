"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Crosshair } from "lucide-react";
import { Punto } from "../hooks/useVistaLienzo";

export interface CoordenadasCursorHandle {
  mostrar: (punto: Punto | null) => void;
}

interface CoordenadasCursorProps {
  lienzoAncho: number;
  lienzoAlto: number;
}

// Posicion del cursor en unidades del lienzo (PEN-25). Tiene su propio
// estado a proposito: el editor le avisa por ref en cada movimiento del
// mouse, asi solo se redibuja este cartel y no todo el lienzo con sus
// figuras
const CoordenadasCursor = forwardRef<
  CoordenadasCursorHandle,
  CoordenadasCursorProps
>(function CoordenadasCursor({ lienzoAncho, lienzoAlto }, ref) {
  const [cursor, setCursor] = useState<Punto | null>(null);

  useImperativeHandle(ref, () => ({ mostrar: setCursor }), []);

  const dentro =
    cursor !== null &&
    cursor.x >= 0 &&
    cursor.y >= 0 &&
    cursor.x <= lienzoAncho &&
    cursor.y <= lienzoAlto;

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-white/90 px-2 py-1 text-[11px] text-gray-500 shadow-sm tabular-nums">
      <Crosshair className="h-3 w-3" />
      {dentro ? `x: ${cursor.x}  y: ${cursor.y}` : "Fuera del lienzo"}
    </div>
  );
});

export default CoordenadasCursor;
