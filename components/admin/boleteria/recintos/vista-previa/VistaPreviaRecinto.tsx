"use client";

import {
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
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

export interface ComoSeEligio {
  shift: boolean;
  tactil: boolean;
}

export interface EstiloPalco {
  color: string;
  marca?: string;
  // Para lectores de pantalla: "Palco 3, vendido"
  descripcion?: string;
  // Segunda linea debajo del nombre (el precio del palco)
  detalle?: string;
}

interface VistaPreviaRecintoProps {
  // Con sus figuras (getRecintoById)
  recinto: Recinto;
  className?: string;
  // Mapa de un evento: cada palco pintado segun su estado. Sin esto, cada
  // figura con su propio color (selector de recinto de la feria)
  estiloDePalco?: (f: FiguraEditor) => EstiloPalco;
  // Palcos tocables (clic o Enter). Las referencias nunca (RN-04). Llega
  // si venia con Shift y si fue con el dedo (para elegir varios)
  onElegirPalco?: (f: FiguraEditor, como: ComoSeEligio) => void;
  // Palco elegido: se resalta con un borde
  palcoElegidoId?: number | null;
  // Varios palcos elegidos a la vez (precios de la pagina de evento)
  elegidos?: ReadonlySet<number>;
  // Arrastrar con el mouse dibuja un recuadro; al soltar llega la zona en
  // unidades del lienzo (elegir varios palcos de una vez)
  onRecuadro?: (zona: VistaDelMapa, conShift: boolean) => void;
  // Clic en el mapa fuera de los palcos (quitar la seleccion)
  onClicFondo?: () => void;
  // Acercar/alejar: la parte del recinto que se ve
  vista?: VistaDelMapa;
}

// Mismo tamano de letra que el editor (FiguraNodo)
const tamanoFuente = (f: FiguraEditor) =>
  Math.min(Math.max(Math.min(f.ancho, f.alto) * 0.28, 8), 40);

// SVG no corta el texto: si no cabe en el ancho, se recorta
const recortar = (texto: string, f: FiguraEditor, fuente: number) => {
  const caben = Math.max(1, Math.floor(f.ancho / (fuente * 0.6)));
  return texto.length > caben
    ? `${texto.slice(0, Math.max(1, caben - 1))}…`
    : texto;
};
const etiqueta = (f: FiguraEditor) => recortar(f.nombre, f, tamanoFuente(f));

// Menos de esto (en pixeles de pantalla) es un clic, no un recuadro
const ARRASTRE_MINIMO_PX = 4;

interface Punto {
  x: number;
  y: number;
}

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
  elegidos,
  onRecuadro,
  onClicFondo,
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

  // Recuadro: donde empezo y donde va el mouse (unidades del lienzo). Si
  // hubo arrastre, el clic que sigue al soltar no elige el palco
  const inicio = useRef<{ punto: Punto; pantalla: Punto } | null>(null);
  const huboArrastre = useRef(false);
  // El ultimo puntero fue un dedo: cada toque suma o quita un palco
  const tactil = useRef(false);
  const [recuadro, setRecuadro] = useState<VistaDelMapa | null>(null);

  const aLienzo = (clientX: number, clientY: number): Punto | null => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };
  const zonaHasta = (fin: Punto): VistaDelMapa | null => {
    const desde = inicio.current?.punto;
    if (!desde) return null;
    return {
      x: Math.min(desde.x, fin.x),
      y: Math.min(desde.y, fin.y),
      ancho: Math.abs(fin.x - desde.x),
      alto: Math.abs(fin.y - desde.y),
    };
  };
  // Solo con mouse: en el celular arrastrar mueve la pagina
  const recuadroEventos = onRecuadro && {
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => {
      tactil.current = e.pointerType !== "mouse";
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const punto = aLienzo(e.clientX, e.clientY);
      if (!punto) return;
      inicio.current = { punto, pantalla: { x: e.clientX, y: e.clientY } };
      huboArrastre.current = false;
    },
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
      const desde = inicio.current;
      if (!desde) return;
      const lejos =
        Math.hypot(e.clientX - desde.pantalla.x, e.clientY - desde.pantalla.y) >
        ARRASTRE_MINIMO_PX;
      if (!huboArrastre.current && !lejos) return;
      if (!huboArrastre.current) {
        huboArrastre.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      const punto = aLienzo(e.clientX, e.clientY);
      if (punto) setRecuadro(zonaHasta(punto));
    },
    onPointerUp: (e: PointerEvent<SVGSVGElement>) => {
      const punto = aLienzo(e.clientX, e.clientY);
      const zona = huboArrastre.current && punto ? zonaHasta(punto) : null;
      inicio.current = null;
      setRecuadro(null);
      if (zona) onRecuadro(zona, e.shiftKey);
    },
  };
  const clicEnElMapa = (e: MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-palco-id]")) return;
    if (huboArrastre.current) {
      huboArrastre.current = false;
      return;
    }
    onClicFondo?.();
  };

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
      className={`${className ?? ""} ${onRecuadro ? "select-none" : ""}`}
      {...recuadroEventos}
      onClick={onClicFondo ? clicEnElMapa : undefined}
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
          esPalco &&
          f.id !== undefined &&
          (f.id === palcoElegidoId || !!elegidos?.has(f.id));
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
        const fuente = tamanoFuente(f);
        const elegir = (e: MouseEvent<SVGGElement>) => {
          // Soltar un recuadro encima de un palco no lo elige ademas
          if (huboArrastre.current) {
            huboArrastre.current = false;
            return;
          }
          onElegirPalco?.(original, {
            shift: e.shiftKey,
            tactil: tactil.current,
          });
        };
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
              onClick: elegir,
              onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onElegirPalco(original, { shift: e.shiftKey, tactil: false });
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
            <g
              transform={f.etiquetaRotada ? `rotate(${f.rotacion})` : undefined}
              fill={colorDeTexto(f)}
              pointerEvents="none"
            >
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y={estilo?.detalle ? -fuente * 0.55 : 0}
                fontSize={fuente}
                fontWeight={esPalco ? "bold" : "normal"}
              >
                {texto}
              </text>
              {estilo?.detalle && (
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  y={fuente * 0.65}
                  fontSize={fuente * 0.8}
                >
                  {recortar(estilo.detalle, f, fuente * 0.8)}
                </text>
              )}
            </g>
          </g>
        );
      })}
      {recuadro && (
        <rect
          x={recuadro.x}
          y={recuadro.y}
          width={recuadro.ancho}
          height={recuadro.alto}
          fill="#097EEC"
          fillOpacity={0.08}
          stroke="#097EEC"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      )}
    </svg>
  );
});

export default VistaPreviaRecinto;
