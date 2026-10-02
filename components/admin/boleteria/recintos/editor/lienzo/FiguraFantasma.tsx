"use client";

import { memo } from "react";
import { Rect, Circle, Text } from "react-konva";
import { FiguraEditor, rellenoDe, colorDeTexto } from "../figuras";

// Copia que todavia no existe: vista previa de "Repetir" (fila o
// abanico). Semitransparente, con borde punteado y sin eventos: no se
// puede tocar ni tapa los clics
const FiguraFantasma = memo(function FiguraFantasma({
  figura,
}: {
  figura: FiguraEditor;
}) {
  const comunes = {
    x: figura.x,
    y: figura.y,
    rotation: figura.rotacion,
    fill: rellenoDe(figura),
    opacity: 0.45,
    stroke: "#097EEC",
    strokeWidth: 1.5,
    strokeScaleEnabled: false,
    dash: [6, 4],
    listening: false,
    perfectDrawEnabled: false,
  };
  const tamanoFuente = Math.min(
    Math.max(Math.min(figura.ancho, figura.alto) * 0.28, 8),
    40,
  );
  return (
    <>
      {figura.forma === "CIRCULO" ? (
        <Circle {...comunes} radius={figura.ancho / 2} />
      ) : (
        <Rect
          {...comunes}
          width={figura.ancho}
          height={figura.alto}
          offsetX={figura.ancho / 2}
          offsetY={figura.alto / 2}
        />
      )}
      <Text
        x={figura.x}
        y={figura.y}
        width={figura.ancho}
        height={figura.alto}
        offsetX={figura.ancho / 2}
        offsetY={figura.alto / 2}
        rotation={figura.etiquetaRotada ? figura.rotacion : 0}
        text={figura.nombre}
        fontSize={tamanoFuente}
        fill={colorDeTexto(figura)}
        opacity={0.6}
        align="center"
        verticalAlign="middle"
        wrap="none"
        ellipsis
        listening={false}
      />
    </>
  );
});

export default FiguraFantasma;
