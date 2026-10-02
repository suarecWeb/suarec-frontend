"use client";

import {
  KeyboardEvent,
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Recinto } from "@/interfaces/recinto.interface";
import {
  FiguraEditor,
  figurasDelRecinto,
  ordenDeDibujo,
  rellenoDe,
  colorDeTexto,
  RADIO_ESQUINAS_PX,
} from "../editor/figuras";

// Como se pinta un palco en el mapa de un evento: el color de su estado
// (en vez del suyo) y una marca junto al nombre
// La parte del recinto que se ve (en unidades del lienzo). Sin vista, se
// ve el recinto completo. Para acercar y mover el mapa de un evento
export interface VistaDelMapa {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export interface EstiloPalco {
  color: string;
  marca?: string;
  // Para lectores de pantalla: "Palco 3, vendido"
  descripcion?: string;
}

interface VistaPreviaRecintoProps {
  // Con sus figuras (getRecintoById)
  recinto: Recinto;
  className?: string;
  // Mapa de un evento: cada palco pintado segun su estado. Sin esto, cada
  // figura con su propio color (selector de recinto de la feria)
  estiloDePalco?: (f: FiguraEditor) => EstiloPalco;
  // Palcos tocables (clic o Enter). Las referencias nunca (RN-04)
  onElegirPalco?: (f: FiguraEditor) => void;
  // Palco elegido: se resalta con un borde
  palcoElegidoId?: number | null;
  // Acercar/alejar: la parte del recinto que se ve
  vista?: VistaDelMapa;
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
  estiloDePalco,
  onElegirPalco,
  palcoElegidoId,
  vista,
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
  // Al acercar o alejar cambia la escala: las esquinas siguen en 5 px
  useLayoutEffect(() => {
    setEscala(svgRef.current?.getScreenCTM()?.a ?? 0);
  }, [vista?.ancho]);

  return (
    <svg
      ref={svgRef}
      viewBox={
        vista
          ? `${vista.x} ${vista.y} ${vista.ancho} ${vista.alto}`
          : `0 0 ${recinto.lienzoAncho} ${recinto.lienzoAlto}`
      }
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
      {figuras.map((original) => {
        const esPalco = original.tipo === "PALCO";
        const estilo = esPalco ? estiloDePalco?.(original) : undefined;
        // Con estilo, el palco toma el color de su estado (y el texto se
        // ajusta solo a ese color)
        const f = estilo ? { ...original, color: estilo.color } : original;
        const tocable = esPalco && !!onElegirPalco;
        const elegido =
          esPalco && f.id !== undefined && f.id === palcoElegidoId;
        const borde = {
          fill: rellenoDe(f),
          stroke: elegido ? "#111827" : esPalco ? "#1f2937" : f.color,
          strokeWidth: elegido ? 3 : 1,
          strokeDasharray: esPalco ? undefined : "6 4",
          vectorEffect: "non-scaling-stroke" as const,
        };
        const texto = estilo?.marca
          ? `${estilo.marca} ${etiqueta(f)}`
          : etiqueta(f);
        return (
          <g
            key={f.clave}
            data-figura={f.tipo}
            data-palco-id={tocable ? f.id : undefined}
            transform={`translate(${f.x} ${f.y})`}
            {...(tocable && {
              role: "button",
              tabIndex: 0,
              "aria-label": estilo?.descripcion ?? f.nombre,
              "aria-pressed": elegido,
              className: "cursor-pointer outline-none focus-visible:opacity-80",
              onClick: () => onElegirPalco(original),
              onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onElegirPalco(original);
                }
              },
            })}
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
              pointerEvents="none"
            >
              {texto}
            </text>
          </g>
        );
      })}
    </svg>
  );
});

export default VistaPreviaRecinto;
