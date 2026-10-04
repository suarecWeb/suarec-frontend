"use client";

import { useState } from "react";
import {
  ComoSeEligio,
  VistaDelMapa,
} from "../../../recintos/vista-previa/VistaPreviaRecinto";
import { FiguraEditor } from "../../../recintos/editor/figuras";

export type Palco = FiguraEditor & { id: number };

// Caja que ocupa un palco en el lienzo, con su rotación (x, y = centro)
const cajaDe = (p: Palco) => {
  const rad = (p.rotacion * Math.PI) / 180;
  const medioAncho =
    Math.abs((p.ancho / 2) * Math.cos(rad)) +
    Math.abs((p.alto / 2) * Math.sin(rad));
  const medioAlto =
    Math.abs((p.ancho / 2) * Math.sin(rad)) +
    Math.abs((p.alto / 2) * Math.cos(rad));
  return {
    x1: p.x - medioAncho,
    x2: p.x + medioAncho,
    y1: p.y - medioAlto,
    y2: p.y + medioAlto,
  };
};

// Elegir palcos igual que en el editor de recintos: clic (solo ese),
// Shift + clic (sumar o quitar), recuadro (los que toca; con Shift se
// suman) y clic en el fondo (ninguno). En el celular cada toque suma o
// quita
export function useSeleccionPalcos(palcos: Palco[]) {
  const [elegidos, setElegidos] = useState<Set<number>>(new Set());

  const elegirPalco = (f: FiguraEditor, como: ComoSeEligio) => {
    const id = f.id!;
    if (como.shift || como.tactil)
      setElegidos((prev) => {
        const sig = new Set(prev);
        if (sig.has(id)) sig.delete(id);
        else sig.add(id);
        return sig;
      });
    else setElegidos(new Set([id]));
  };

  const elegirEnZona = (z: VistaDelMapa, conShift: boolean) => {
    const tocados = palcos
      .filter((p) => {
        const c = cajaDe(p);
        return (
          c.x2 >= z.x &&
          c.x1 <= z.x + z.ancho &&
          c.y2 >= z.y &&
          c.y1 <= z.y + z.alto
        );
      })
      .map((p) => p.id);
    setElegidos((prev) =>
      conShift ? new Set([...Array.from(prev), ...tocados]) : new Set(tocados),
    );
  };

  return {
    elegidos,
    elegirPalco,
    elegirEnZona,
    elegirVarios: (ids: number[]) => setElegidos(new Set(ids)),
    elegirTodos: () => setElegidos(new Set(palcos.map((p) => p.id))),
    limpiar: () => setElegidos(new Set()),
  };
}
