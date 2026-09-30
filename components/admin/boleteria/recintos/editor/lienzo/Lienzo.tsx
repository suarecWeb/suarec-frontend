"use client";

import { useEffect, useRef } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Vector2d } from "konva/lib/types";
import { FiguraEditor, TamanoLienzo, RADIO_ESQUINAS_PX } from "../figuras";
import { Punto } from "../hooks/useVistaLienzo";
import { useRecuadroSeleccion } from "../hooks/useRecuadroSeleccion";
import FiguraNodo, { GuiaArrastre } from "./FiguraNodo";
import Cuadricula from "./Cuadricula";
import CoordenadasCursor, {
  CoordenadasCursorHandle,
} from "./CoordenadasCursor";

// Sensibilidad de la rueda: un "clic" de mouse (deltaY ~100) es ~14%;
// el trackpad manda deltas chicos y queda suave
const SENSIBILIDAD_RUEDA = 1.0015;
// Al rotar, se "pega" a estos angulos si pasa cerca (±5°)
const ANGULOS_GUIA = [0, 45, 90, 135, 180, 225, 270, 315];
const ANCLAS_ESQUINAS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];
const ANCLAS_TODAS = [
  ...ANCLAS_ESQUINAS,
  "top-center",
  "middle-left",
  "middle-right",
  "bottom-center",
];

interface Tamano {
  ancho: number;
  alto: number;
}

interface LienzoProps {
  lienzo: TamanoLienzo;
  pantalla: Tamano;
  // El Stage de Konva necesita medidas en pixeles: se avisa al editor
  onCambiarPantalla: (pantalla: Tamano) => void;
  vista: { escala: number; x: number; y: number };
  zoomEn: (punto: Punto, factor: number) => void;
  mover: (x: number, y: number) => void;
  aPuntoLogico: (punto: Punto) => Punto;
  // Ya en orden de dibujo: referencias debajo, palcos encima (RN-04)
  figuras: FiguraEditor[];
  errores: Record<string, string>;
  // Tamano de celda si la cuadrícula esta prendida; null si no
  cuadricula: number | null;
  seleccionadas: FiguraEditor[];
  // Las que el recuadro de Shift puede elegir (sin las bloqueadas)
  clavesLibres: string[];
  onPresionar: (clave: string, conShift: boolean) => void;
  onClic: (clave: string, conShift: boolean) => void;
  onCambiar: (clave: string, cambios: Partial<FiguraEditor>) => void;
  onSeleccionar: (claves: string[]) => void;
  onLimpiarSeleccion: () => void;
}

// El lienzo del editor: lo que dibuja Konva y sus eventos de mouse (zoom
// con la rueda, mover la vista, recuadro de Shift, manijas de la figura).
// Konva usa canvas y solo corre en el navegador
export default function Lienzo({
  lienzo,
  pantalla,
  onCambiarPantalla,
  vista,
  zoomEn,
  mover,
  aPuntoLogico,
  figuras,
  errores,
  cuadricula,
  seleccionadas,
  clavesLibres,
  onPresionar,
  onClic,
  onCambiar,
  onSeleccionar,
  onLimpiarSeleccion,
}: LienzoProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const capaRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const recuadroRef = useRef<Konva.Rect>(null);
  const coordenadasRef = useRef<CoordenadasCursorHandle>(null);
  // Si el arrastre empezo sobre una figura bloqueada, no pasa nada: ni la
  // figura ni la vista se mueven (bloqueada = fija, como Canva)
  const presionoBloqueada = useRef(false);
  // La figura que se agarro: guia del imán de la cuadrícula en un grupo
  const guia = useRef<GuiaArrastre | null>(null);

  const recuadro = useRecuadroSeleccion({
    capaRef,
    recuadroRef,
    aPuntoLogico,
    claves: clavesLibres,
    onSeleccionar,
  });

  // Una sola figura: el Transformer completo. Varias: solo moverlas
  const figuraSeleccionada =
    seleccionadas.length === 1 ? seleccionadas[0] : null;
  // El circulo siempre crece parejo
  const proporcionFija = figuraSeleccionada?.forma === "CIRCULO";
  // Imán al estirar: solo rectangulos derechos (0°, 90°...), donde las
  // manijas quedan sobre los bordes; el circulo y los girados, libres
  const imanAlEstirar =
    cuadricula !== null &&
    figuraSeleccionada !== null &&
    figuraSeleccionada.forma === "RECTANGULO" &&
    figuraSeleccionada.rotacion % 90 === 0;

  // La manija que se arrastra cae sobre una linea de la cuadrícula. Konva
  // la entrega en pixeles de pantalla: se pasa a unidades del lienzo
  const pegarManija = (anterior: Vector2d, nueva: Vector2d): Vector2d => {
    if (!imanAlEstirar || cuadricula === null) return nueva;
    const pegar = (valor: number, corrimiento: number) =>
      Math.round((valor - corrimiento) / vista.escala / cuadricula) *
        cuadricula *
        vista.escala +
      corrimiento;
    return { x: pegar(nueva.x, vista.x), y: pegar(nueva.y, vista.y) };
  };

  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      onCambiarPantalla({ ancho: el.clientWidth, alto: el.clientHeight }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onCambiarPantalla]);

  // El Transformer sigue a la seleccion. Con varias figuras, al arrastrar
  // una Konva arrastra todas (y cada una respeta el borde del lienzo)
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    // En un grupo, las bloqueadas no se enganchan: no se mueven con las demas.
    // Una sola bloqueada si, para que se vea elegida (sin manijas)
    const nodos = seleccionadas
      .filter((f) => seleccionadas.length === 1 || !f.bloqueada)
      .map((f) => capaRef.current?.findOne(`#${f.clave}`))
      .filter((nodo): nodo is Konva.Node => !!nodo);
    transformer.nodes(nodos);
    transformer.getLayer()?.batchDraw();
  }, [seleccionadas]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault(); // que la rueda no haga scroll de la pagina
    const puntero = e.target.getStage()?.getPointerPosition();
    if (!puntero) return;
    // deltaMode 1 = lineas (algunos mouse): se lleva a pixeles
    const delta = e.evt.deltaMode === 1 ? e.evt.deltaY * 33 : e.evt.deltaY;
    zoomEn(puntero, Math.pow(SENSIBILIDAD_RUEDA, -delta));
  };

  // Arrastrar sobre una figura bloqueada NO mueve la vista: se veria como
  // si la figura se moviera. Se corta el arrastre apenas empieza
  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (e.target === stage && presionoBloqueada.current) stage.stopDrag();
  };

  // Arrastrar el fondo desplaza la vista. Solo cuenta si lo arrastrado es
  // el Stage mismo: arrastrar una figura la mueve a ella
  const handleDrag = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (e.target === stage) mover(stage.x(), stage.y());
  };

  const esFondo = (e: KonvaEventObject<MouseEvent | TouchEvent>) =>
    e.target === e.target.getStage() || e.target.name() === "lienzo";

  // Clic en el fondo o en el lienzo vacio: quita la seleccion. Con Shift
  // no: ese clic es el final de un recuadro de seleccion
  const handleClickFondo = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!e.evt.shiftKey && esFondo(e)) onLimpiarSeleccion();
  };

  // Shift + presionar el fondo empieza el recuadro de seleccion. Una figura
  // bloqueada cuenta como fondo (ej: empezar el recuadro sobre la tarima)
  const handleMouseDownFondo = (e: KonvaEventObject<MouseEvent>) => {
    presionoBloqueada.current = e.target.hasName("bloqueada");
    if (!e.evt.shiftKey || !(esFondo(e) || presionoBloqueada.current)) return;
    const puntero = e.target.getStage()?.getPointerPosition();
    if (puntero) recuadro.empezar(puntero);
  };

  // No usa estado de React: le avisa al cartel de coordenadas por ref,
  // asi mover el mouse no redibuja el lienzo (y el recuadro tampoco)
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const puntero = e.target.getStage()?.getPointerPosition();
    coordenadasRef.current?.mostrar(puntero ? aPuntoLogico(puntero) : null);
    if (puntero) recuadro.actualizar(puntero);
  };

  return (
    // Mesa de trabajo: el gris es fuera del lienzo
    <div
      ref={contenedorRef}
      className={`relative flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-100 overflow-hidden ${
        recuadro.shiftPresionado
          ? "cursor-crosshair"
          : "cursor-grab active:cursor-grabbing"
      }`}
    >
      {pantalla.ancho > 0 && (
        <Stage
          width={pantalla.ancho}
          height={pantalla.alto}
          x={vista.x}
          y={vista.y}
          scaleX={vista.escala}
          scaleY={vista.escala}
          // Con Shift el fondo selecciona en vez de mover la vista
          draggable={!recuadro.shiftPresionado}
          onWheel={handleWheel}
          onMouseDown={handleMouseDownFondo}
          onDragStart={handleDragStart}
          onTouchStart={(e) => {
            presionoBloqueada.current = e.target.hasName("bloqueada");
          }}
          onDragMove={handleDrag}
          onDragEnd={handleDrag}
          onClick={handleClickFondo}
          onTap={handleClickFondo}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => coordenadasRef.current?.mostrar(null)}
        >
          <Layer ref={capaRef}>
            {/* El lienzo: el area donde se dibuja el recinto */}
            <Rect
              name="lienzo"
              x={0}
              y={0}
              width={lienzo.ancho}
              height={lienzo.alto}
              // En unidades del lienzo: dividido por el zoom da 5 px en pantalla
              cornerRadius={RADIO_ESQUINAS_PX / vista.escala}
              fill="#ffffff"
              stroke="#d1d5db"
              strokeWidth={1}
              strokeScaleEnabled={false}
              shadowColor="#000000"
              shadowOpacity={0.08}
              shadowBlur={12}
              shadowForStrokeEnabled={false}
            />
            {cuadricula !== null && (
              <Cuadricula
                lienzo={lienzo}
                tamano={cuadricula}
                escala={vista.escala}
              />
            )}
            {figuras.map((figura) => (
              <FiguraNodo
                key={figura.clave}
                figura={figura}
                lienzoAncho={lienzo.ancho}
                lienzoAlto={lienzo.alto}
                conError={!!errores[figura.clave]}
                cuadricula={cuadricula}
                guia={guia}
                onPresionar={onPresionar}
                onClic={onClic}
                onCambiar={onCambiar}
              />
            ))}
            {/* Recuadro de Shift + arrastrar (lo dibuja el hook) */}
            <Rect
              ref={recuadroRef}
              visible={false}
              fill="rgba(9, 126, 236, 0.08)"
              stroke="#097EEC"
              strokeWidth={1}
              strokeScaleEnabled={false}
              dash={[4, 4]}
              listening={false}
            />
            <Transformer
              ref={transformerRef}
              // Un grupo por ahora solo se mueve: sin estirar ni rotar
              resizeEnabled={
                figuraSeleccionada !== null && !figuraSeleccionada.bloqueada
              }
              rotateEnabled={
                figuraSeleccionada !== null && !figuraSeleccionada.bloqueada
              }
              rotationSnaps={ANGULOS_GUIA}
              rotationSnapTolerance={5}
              flipEnabled={false}
              ignoreStroke
              // Proporcion fija: solo esquinas (las manijas de los lados
              // estirarian un solo lado y romperian la proporcion)
              keepRatio={proporcionFija}
              // Shift es para seleccionar varias: que no altere la proporcion
              shiftBehavior="none"
              enabledAnchors={proporcionFija ? ANCLAS_ESQUINAS : ANCLAS_TODAS}
              boundBoxFunc={(anterior, nueva) =>
                nueva.width < 5 || nueva.height < 5 ? anterior : nueva
              }
              anchorDragBoundFunc={pegarManija}
            />
          </Layer>
        </Stage>
      )}

      <CoordenadasCursor
        ref={coordenadasRef}
        lienzoAncho={lienzo.ancho}
        lienzoAlto={lienzo.alto}
      />
    </div>
  );
}
