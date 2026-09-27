"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Ruler,
  Square,
  Circle as CircleIcon,
  AlertTriangle,
  History,
} from "lucide-react";
import { Recinto, RecintoFiguraForma } from "@/interfaces/recinto.interface";
import { useVistaLienzo } from "./useVistaLienzo";
import { useFiguras } from "./useFiguras";
import {
  FiguraEditor,
  COLOR_PALCO,
  claveNueva,
  desdeBackend,
  limitarAlLienzo,
  ordenDeDibujo,
  siguienteNombrePalco,
  validarFiguras,
} from "./figuras";
import { useBorradorRecinto, horaCorta } from "./useBorradorRecinto";
import FiguraNodo from "./FiguraNodo";
import PanelPropiedades from "./PanelPropiedades";
import CoordenadasCursor, {
  CoordenadasCursorHandle,
} from "./CoordenadasCursor";

// Zoom de los botones, centrado en la pantalla
const FACTOR_BOTON = 1.25;
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

interface RecintoEditorProps {
  recinto: Recinto;
}

// Editor del recinto. Konva dibuja en canvas y solo corre en el
// navegador: este componente se carga con next/dynamic y ssr:false
export default function RecintoEditor({ recinto }: RecintoEditorProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const capaRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const coordenadasRef = useRef<CoordenadasCursorHandle>(null);
  const ajustadoInicial = useRef(false);
  const [pantalla, setPantalla] = useState({ ancho: 0, alto: 0 });
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const lienzo = { ancho: recinto.lienzoAncho, alto: recinto.lienzoAlto };
  const { vista, zoomRelativo, ajustar, zoomEn, mover, aPuntoLogico } =
    useVistaLienzo(lienzo, pantalla);

  // Lo que esta guardado en el sistema, en su orden de apilado. Fijo
  // mientras la pagina este abierta: es la base del borrador (y de guardar)
  const [figurasGuardadas] = useState(() =>
    [...(recinto.figuras ?? [])]
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(desdeBackend),
  );
  const { figuras, agregar, actualizar, borrar, reemplazar } = useFiguras(
    () => figurasGuardadas,
  );
  const borrador = useBorradorRecinto(recinto.id, figuras, figurasGuardadas);

  const recuperarBorrador = () => {
    const figurasBorrador = borrador.recuperar();
    if (figurasBorrador) {
      reemplazar(figurasBorrador);
      setSeleccion(null);
    }
  };
  const errores = useMemo(
    () =>
      validarFiguras(figuras, {
        ancho: recinto.lienzoAncho,
        alto: recinto.lienzoAlto,
      }),
    [figuras, recinto.lienzoAncho, recinto.lienzoAlto],
  );
  const figurasEnOrden = useMemo(() => ordenDeDibujo(figuras), [figuras]);
  const figuraSeleccionada = figuras.find((f) => f.clave === seleccion) ?? null;

  // El Stage de Konva necesita medidas en pixeles: sigue al contenedor
  useEffect(() => {
    const el = contenedorRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() =>
      setPantalla({ ancho: el.clientWidth, alto: el.clientHeight }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // La primera vez que se conoce el tamano, el lienzo entra completo.
  // useLayoutEffect: se ajusta antes de pintar, sin un cuadro a escala 1
  useLayoutEffect(() => {
    if (!ajustadoInicial.current && pantalla.ancho > 0 && pantalla.alto > 0) {
      ajustar();
      ajustadoInicial.current = true;
    }
  }, [pantalla, ajustar]);

  // El Transformer (cajita para estirar y rotar) sigue a la seleccion
  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const nodo = seleccion ? capaRef.current?.findOne(`#${seleccion}`) : null;
    transformer.nodes(nodo ? [nodo] : []);
    transformer.getLayer()?.batchDraw();
  }, [seleccion, figuras]);

  const borrarSeleccion = useCallback(() => {
    if (!seleccion) return;
    borrar(seleccion);
    setSeleccion(null);
  }, [seleccion, borrar]);

  // Supr / Backspace borra la seleccionada, salvo si se esta escribiendo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      borrarSeleccion();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [borrarSeleccion]);

  const centroPantalla = { x: pantalla.ancho / 2, y: pantalla.alto / 2 };

  // Nueva figura en el centro de lo que se esta viendo (o en el borde del
  // lienzo si la vista esta corrida afuera), ya seleccionada. Tamano
  // relativo al lienzo, para que sirva igual en una discoteca o un estadio
  const agregarFigura = (forma: RecintoFiguraForma) => {
    const centro = limitarAlLienzo(aPuntoLogico(centroPantalla), lienzo);
    const base = Math.round(Math.min(lienzo.ancho, lienzo.alto) * 0.08);
    const nueva: FiguraEditor = {
      clave: claveNueva(),
      tipo: "PALCO",
      forma,
      nombre: siguienteNombrePalco(figuras),
      x: centro.x,
      y: centro.y,
      ancho: forma === "CIRCULO" ? Math.round(base * 0.75) : base,
      alto:
        forma === "CIRCULO"
          ? Math.round(base * 0.75)
          : Math.round(base * 0.625),
      rotacion: 0,
      color: COLOR_PALCO,
      etiquetaRotada: false,
    };
    agregar(nueva);
    setSeleccion(nueva.clave);
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault(); // que la rueda no haga scroll de la pagina
    const puntero = e.target.getStage()?.getPointerPosition();
    if (!puntero) return;
    // deltaMode 1 = lineas (algunos mouse): se lleva a pixeles
    const delta = e.evt.deltaMode === 1 ? e.evt.deltaY * 33 : e.evt.deltaY;
    zoomEn(puntero, Math.pow(SENSIBILIDAD_RUEDA, -delta));
  };

  // Arrastrar el fondo desplaza la vista. Solo cuenta si lo arrastrado es
  // el Stage mismo: arrastrar una figura la mueve a ella
  const handleDrag = (e: KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage();
    if (e.target === stage) mover(stage.x(), stage.y());
  };

  // Clic en el fondo o en el lienzo vacio: quita la seleccion
  const handleClickFondo = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === "lienzo")
      setSeleccion(null);
  };

  // No usa estado del editor: le avisa al cartel de coordenadas por ref,
  // asi mover el mouse no redibuja el lienzo
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const puntero = e.target.getStage()?.getPointerPosition();
    coordenadasRef.current?.mostrar(puntero ? aPuntoLogico(puntero) : null);
  };

  const esCirculo = figuraSeleccionada?.forma === "CIRCULO";
  const totalPalcos = figuras.filter((f) => f.tipo === "PALCO").length;
  const totalErrores = Object.keys(errores).length;

  const botonClase =
    "h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center";

  return (
    <div className="flex flex-col gap-3">
      {/* Barra superior: agregar figuras, tamano del lienzo y zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => agregarFigura("RECTANGULO")}
            className={`${botonClase} px-3 gap-1.5 text-xs font-medium`}
          >
            <Square className="h-3.5 w-3.5" />
            Rectángulo
          </button>
          <button
            type="button"
            onClick={() => agregarFigura("CIRCULO")}
            className={`${botonClase} px-3 gap-1.5 text-xs font-medium`}
          >
            <CircleIcon className="h-3.5 w-3.5" />
            Círculo
          </button>
          <p className="ml-2 flex items-center gap-1.5 text-xs text-gray-500">
            <Ruler className="h-3.5 w-3.5" />
            Lienzo {lienzo.ancho} × {lienzo.alto}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoomEn(centroPantalla, 1 / FACTOR_BOTON)}
            aria-label="Alejar"
            title="Alejar"
            className={`${botonClase} w-8`}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-14 text-center text-xs font-medium text-gray-600 tabular-nums">
            {Math.round(zoomRelativo * 100)}%
          </span>
          <button
            type="button"
            onClick={() => zoomEn(centroPantalla, FACTOR_BOTON)}
            aria-label="Acercar"
            title="Acercar"
            className={`${botonClase} w-8`}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={ajustar}
            aria-label="Ajustar a la pantalla"
            title="Ajustar a la pantalla"
            className={`${botonClase} ml-1 px-3 gap-1.5 text-xs font-medium`}
          >
            <Maximize className="h-3.5 w-3.5" />
            Ajustar
          </button>
        </div>
      </div>

      {/* Borrador en esta pestana (sessionStorage). Hasta el item 6
          (guardar) es lo unico que evita perder el dibujo al recargar */}
      {borrador.pendiente ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
          <span className="flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 flex-shrink-0" />
            Tienes un borrador sin guardar de las{" "}
            {horaCorta(borrador.pendiente.guardadoEn)} en esta pestaña.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={recuperarBorrador}
              className="px-3 py-1 rounded-md bg-[#097EEC] text-white font-medium hover:bg-[#0562C7]"
            >
              Recuperar
            </button>
            <button
              type="button"
              onClick={borrador.descartar}
              className="px-3 py-1 rounded-md border border-blue-200 text-blue-700 font-medium hover:bg-blue-100"
            >
              Descartar
            </button>
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {borrador.guardadoEn
            ? `Borrador guardado en esta pestaña a las ${horaCorta(borrador.guardadoEn)}. `
            : "Sin cambios. "}
          Todavía no se guarda en el sistema: si cierras la pestaña, el borrador
          se pierde.
        </p>
      )}

      <div className="flex gap-3 h-[calc(100vh-360px)] min-h-[480px]">
        {/* Mesa de trabajo: el gris es fuera del lienzo */}
        <div
          ref={contenedorRef}
          className="relative flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-100 overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {pantalla.ancho > 0 && (
            <Stage
              width={pantalla.ancho}
              height={pantalla.alto}
              x={vista.x}
              y={vista.y}
              scaleX={vista.escala}
              scaleY={vista.escala}
              draggable
              onWheel={handleWheel}
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
                  fill="#ffffff"
                  stroke="#d1d5db"
                  strokeWidth={1}
                  strokeScaleEnabled={false}
                  shadowColor="#000000"
                  shadowOpacity={0.08}
                  shadowBlur={12}
                  shadowForStrokeEnabled={false}
                />
                {/* Referencias debajo, palcos encima (RN-04) */}
                {figurasEnOrden.map((figura) => (
                  <FiguraNodo
                    key={figura.clave}
                    figura={figura}
                    lienzoAncho={lienzo.ancho}
                    lienzoAlto={lienzo.alto}
                    conError={!!errores[figura.clave]}
                    onSeleccionar={setSeleccion}
                    onCambiar={actualizar}
                  />
                ))}
                <Transformer
                  ref={transformerRef}
                  rotationSnaps={ANGULOS_GUIA}
                  rotationSnapTolerance={5}
                  flipEnabled={false}
                  ignoreStroke
                  // El circulo solo crece parejo, desde las esquinas
                  keepRatio={esCirculo}
                  enabledAnchors={esCirculo ? ANCLAS_ESQUINAS : ANCLAS_TODAS}
                  boundBoxFunc={(anterior, nueva) =>
                    nueva.width < 5 || nueva.height < 5 ? anterior : nueva
                  }
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

        <PanelPropiedades
          figura={figuraSeleccionada}
          error={seleccion ? errores[seleccion] : undefined}
          totalPalcos={totalPalcos}
          totalReferencias={figuras.length - totalPalcos}
          totalErrores={totalErrores}
          onCambiar={(cambios) => seleccion && actualizar(seleccion, cambios)}
          onBorrar={borrarSeleccion}
        />
      </div>

      <p className="text-[11px] text-gray-400">
        Rueda del mouse: zoom · Arrastrar el fondo: mover la vista · Arrastrar
        una figura: moverla · Supr: borrar la seleccionada
      </p>
    </div>
  );
}
