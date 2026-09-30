"use client";

import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Recinto } from "@/interfaces/recinto.interface";
import {
  FiguraEditor,
  figurasDelRecinto,
  ordenDeDibujo,
  rellenoDe,
  colorDeTexto,
  RADIO_ESQUINAS_PX,
} from "../editor/figuras";

interface VistaPreviaRecintoProps {
  // Con sus figuras (getRecintoById)
  recinto: Recinto;
  className?: string;
}

// Mismo tamano de letra que el editor (FiguraNodo)
const tamanoFuente = (f: FiguraEditor) =>
  Math.min(Math.max(Math.min(f.ancho, f.alto) * 0.28, 8), 40);

// SVG no corta el texto: si el nombre no cabe en el ancho, se recorta
const etiqueta = (f: FiguraEditor) => {
  const caben = Math.max(1, Math.floor(f.ancho / (tamanoFuente(f) * 0.6)));
  return f.nombre.length > caben
    ? `${f.nombre.slice(0, Math.max(1, caben - 1))}…`
    : f.nombre;
};

// El recinto dibujado SOLO para mirar (sin mover ni seleccionar). SVG y
// no Konva: es liviano y la app movil tambien pinta en SVG. Misma
// convencion que el editor: x, y = centro, rotacion alrededor del centro,
// referencias debajo de los palcos (RN-04)
const VistaPreviaRecinto = memo(function VistaPreviaRecinto({
  recinto,
  className,
}: VistaPreviaRecintoProps) {
  const figuras = useMemo(
    () => ordenDeDibujo(figurasDelRecinto(recinto)),
    [recinto],
  );
  // Cuantos pixeles de pantalla mide una unidad del lienzo, para que las
  // esquinas midan 5 px igual que en el editor sin importar el tamano
  const svgRef = useRef<SVGSVGElement>(null);
  const [escala, setEscala] = useState(0);
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const medir = () => setEscala(svg.getScreenCTM()?.a ?? 0);
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${recinto.lienzoAncho} ${recinto.lienzoAlto}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Mapa del recinto ${recinto.nombre}`}
      className={className}
    >
      <rect
        width={recinto.lienzoAncho}
        height={recinto.lienzoAlto}
        rx={escala > 0 ? RADIO_ESQUINAS_PX / escala : 0}
        fill="#ffffff"
        stroke="#d1d5db"
        vectorEffect="non-scaling-stroke"
      />
      {figuras.map((f) => {
        const esPalco = f.tipo === "PALCO";
        const borde = {
          fill: rellenoDe(f),
          stroke: esPalco ? "#1f2937" : f.color,
          strokeDasharray: esPalco ? undefined : "6 4",
          vectorEffect: "non-scaling-stroke" as const,
        };
        return (
          <g
            key={f.clave}
            data-figura={f.tipo}
            transform={`translate(${f.x} ${f.y})`}
          >
            <g transform={`rotate(${f.rotacion})`}>
              {f.forma === "CIRCULO" ? (
                <circle r={f.ancho / 2} {...borde} />
              ) : (
                <rect
                  x={-f.ancho / 2}
                  y={-f.alto / 2}
                  width={f.ancho}
                  height={f.alto}
                  {...borde}
                />
              )}
            </g>
            <text
              transform={f.etiquetaRotada ? `rotate(${f.rotacion})` : undefined}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={tamanoFuente(f)}
              fontWeight={esPalco ? "bold" : "normal"}
              fill={colorDeTexto(f)}
            >
              {etiqueta(f)}
            </text>
          </g>
        );
      })}
    </svg>
  );
});

export default VistaPreviaRecinto;
