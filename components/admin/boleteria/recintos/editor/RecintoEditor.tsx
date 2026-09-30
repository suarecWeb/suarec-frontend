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
  Save,
  Loader2,
  ClipboardPaste,
} from "lucide-react";
import toast from "react-hot-toast";
import { Recinto, RecintoFiguraForma } from "@/interfaces/recinto.interface";
import { useVistaLienzo } from "./hooks/useVistaLienzo";
import { useFiguras } from "./hooks/useFiguras";
import {
  FiguraEditor,
  COLOR_PALCO,
  claveNueva,
  figurasDelRecinto,
  limitarAlLienzo,
  ordenDeDibujo,
  siguienteNombrePalco,
  validarFiguras,
} from "./figuras";
import { useBorradorRecinto } from "./hooks/useBorradorRecinto";
import { useGuardarDibujo } from "./hooks/useGuardarDibujo";
import { usePortapapeles } from "./hooks/usePortapapeles";
import { useSeleccion } from "./hooks/useSeleccion";
import { useRecuadroSeleccion } from "./hooks/useRecuadroSeleccion";
import AvisosEditor from "./barra/AvisosEditor";
import FiguraNodo from "./lienzo/FiguraNodo";
import PanelPropiedades from "./panel/PanelPropiedades";
import CoordenadasCursor, {
  CoordenadasCursorHandle,
} from "./lienzo/CoordenadasCursor";

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
  const recuadroRef = useRef<Konva.Rect>(null);
  // Si el arrastre empezo sobre una figura bloqueada, no pasa nada: ni la
  // figura ni la vista se mueven (bloqueada = fija, como Canva)
  const presionoBloqueada = useRef(false);
  const coordenadasRef = useRef<CoordenadasCursorHandle>(null);
  const ajustadoInicial = useRef(false);
  const [pantalla, setPantalla] = useState({ ancho: 0, alto: 0 });
  const { seleccion, setSeleccion, alPresionar, alHacerClic, limpiar } =
    useSeleccion();

  const lienzo = useMemo(
    () => ({ ancho: recinto.lienzoAncho, alto: recinto.lienzoAlto }),
    [recinto.lienzoAncho, recinto.lienzoAlto],
  );
  const { vista, zoomRelativo, ajustar, zoomEn, mover, aPuntoLogico } =
    useVistaLienzo(lienzo, pantalla);

  // Lo que esta guardado en el sistema y su version (updatedAt). Es la base
  // para saber si hay cambios, para el borrador y para guardar sin pisar
  // a otro admin. Cambia cada vez que se guarda
  const [base, setBase] = useState(() => ({
    version: recinto.updatedAt,
    figuras: figurasDelRecinto(recinto),
  }));
  const {
    figuras,
    agregar,
    agregarVarias,
    actualizar,
    borrarVarias,
    reemplazar,
  } = useFiguras(() => base.figuras);
  const borrador = useBorradorRecinto(recinto.id, figuras, base.figuras);
  const { hayCopia, copiar, pegar, duplicar } = usePortapapeles(
    figuras,
    lienzo,
    agregarVarias,
  );
  const guardado = useGuardarDibujo(recinto.id);
  const hayCambios = useMemo(
    () => JSON.stringify(figuras) !== JSON.stringify(base.figuras),
    [figuras, base.figuras],
  );

  const recuperarBorrador = () => {
    const figurasBorrador = borrador.recuperar();
    if (figurasBorrador) {
      reemplazar(figurasBorrador);
      limpiar();
    }
  };
  // Los del editor mandan; los del backend (del ultimo intento de guardar)
  // se muestran hasta que se vuelve a tocar el dibujo
  const errores = useMemo(
    () => ({
      ...guardado.erroresPorFigura,
      ...validarFiguras(figuras, {
        ancho: recinto.lienzoAncho,
        alto: recinto.lienzoAlto,
      }),
    }),
    [
      figuras,
      guardado.erroresPorFigura,
      recinto.lienzoAncho,
      recinto.lienzoAlto,
    ],
  );
  const { limpiarErrores } = guardado;
  useEffect(() => limpiarErrores(), [figuras, limpiarErrores]);

  // Si se intenta cerrar o recargar con cambios sin guardar, el navegador
  // pregunta (el borrador de la pestana igual los respalda)
  useEffect(() => {
    if (!hayCambios) return;
    const avisar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hayCambios]);

  const guardarDibujo = async () => {
    const recintoGuardado = await guardado.guardar(figuras, base.version);
    if (!recintoGuardado) return;
    // Las nuevas vuelven con su id: el dibujo guardado es la nueva base
    const figurasGuardadas = figurasDelRecinto(recintoGuardado);
    reemplazar(figurasGuardadas);
    setBase({ version: recintoGuardado.updatedAt, figuras: figurasGuardadas });
    limpiar();
    toast.success("Recinto guardado");
  };
  const figurasEnOrden = useMemo(() => ordenDeDibujo(figuras), [figuras]);
  const seleccionadas = useMemo(
    () => figuras.filter((f) => seleccion.includes(f.clave)),
    [figuras, seleccion],
  );
  // El panel de propiedades y el Transformer completo, solo con UNA
  const figuraSeleccionada =
    seleccionadas.length === 1 ? seleccionadas[0] : null;
  // El recuadro y Ctrl/Cmd+A ignoran las bloqueadas (como Canva): se pueden
  // seleccionar palcos encima de una tarima bloqueada sin arrastrarla
  const clavesLibres = useMemo(
    () => figuras.filter((f) => !f.bloqueada).map((f) => f.clave),
    [figuras],
  );
  const recuadro = useRecuadroSeleccion({
    capaRef,
    recuadroRef,
    aPuntoLogico,
    claves: clavesLibres,
    onSeleccionar: setSeleccion,
  });

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

  const borrarSeleccion = useCallback(() => {
    if (seleccionadas.length === 0) return;
    const libres = seleccionadas.filter((f) => !f.bloqueada);
    const bloqueadas = seleccionadas.filter((f) => f.bloqueada);
    if (libres.length > 0) borrarVarias(libres.map((f) => f.clave));
    if (bloqueadas.length > 0) {
      toast(
        bloqueadas.length === 1
          ? `${bloqueadas[0].nombre} está bloqueada: desbloquéala para borrarla`
          : `${bloqueadas.length} figuras bloqueadas no se borraron`,
        { icon: "🔒" },
      );
    }
    // Quedan elegidas solo las que no se pudieron borrar
    setSeleccion(bloqueadas.map((f) => f.clave));
  }, [seleccionadas, borrarVarias, setSeleccion]);

  // Bloquear o desbloquear lo seleccionado (una o un grupo)
  const bloquearSeleccion = useCallback(
    (bloquear: boolean) => {
      seleccionadas.forEach((f) =>
        actualizar(f.clave, { bloqueada: bloquear }),
      );
    },
    [seleccionadas, actualizar],
  );

  const copiarSeleccion = useCallback(() => {
    if (seleccionadas.length === 0) return;
    copiar(seleccionadas);
    toast.success(
      seleccionadas.length === 1
        ? `Copiada: ${seleccionadas[0].nombre}`
        : `Copiadas: ${seleccionadas.length} figuras`,
      { duration: 1500 },
    );
  }, [seleccionadas, copiar]);

  // Las copias pegadas quedan seleccionadas, como en Canva
  const pegarCopia = useCallback(() => {
    const nuevas = pegar();
    if (nuevas.length > 0) setSeleccion(nuevas.map((f) => f.clave));
  }, [pegar, setSeleccion]);

  const duplicarSeleccion = useCallback(() => {
    const nuevas = duplicar(seleccionadas);
    if (nuevas.length > 0) setSeleccion(nuevas.map((f) => f.clave));
  }, [seleccionadas, duplicar, setSeleccion]);

  // Atajos, salvo si se esta escribiendo en un campo: Supr/Backspace
  // borra, Esc quita la seleccion; Ctrl/Cmd + A, C, V, D selecciona todo,
  // copia, pega y duplica
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      const conModificador = e.ctrlKey || e.metaKey;
      if (!conModificador) {
        if (e.key === "Delete" || e.key === "Backspace") borrarSeleccion();
        if (e.key === "Escape") limpiar();
        return;
      }
      const tecla = e.key.toLowerCase();
      const haySeleccion = seleccionadas.length > 0;
      if (tecla === "a") {
        e.preventDefault(); // sin esto, selecciona el texto de la pagina
        setSeleccion(clavesLibres);
      } else if (tecla === "c" && haySeleccion) {
        e.preventDefault();
        copiarSeleccion();
      } else if (tecla === "v" && hayCopia) {
        e.preventDefault();
        pegarCopia();
      } else if (tecla === "d" && haySeleccion) {
        e.preventDefault(); // Ctrl+D del navegador es "agregar a favoritos"
        duplicarSeleccion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    borrarSeleccion,
    copiarSeleccion,
    pegarCopia,
    duplicarSeleccion,
    seleccionadas,
    clavesLibres,
    hayCopia,
    limpiar,
    setSeleccion,
  ]);

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
      bloqueada: false,
    };
    agregar(nueva);
    setSeleccion([nueva.clave]);
  };

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
    if (!e.evt.shiftKey && esFondo(e)) limpiar();
  };

  // Shift + presionar el fondo empieza el recuadro de seleccion. Una figura
  // bloqueada cuenta como fondo (ej: empezar el recuadro sobre la tarima)
  const handleMouseDownFondo = (e: KonvaEventObject<MouseEvent>) => {
    presionoBloqueada.current = e.target.hasName("bloqueada");
    if (!e.evt.shiftKey || !(esFondo(e) || presionoBloqueada.current)) return;
    const puntero = e.target.getStage()?.getPointerPosition();
    if (puntero) recuadro.empezar(puntero);
  };

  // No usa estado del editor: le avisa al cartel de coordenadas por ref,
  // asi mover el mouse no redibuja el lienzo (y el recuadro tampoco)
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const puntero = e.target.getStage()?.getPointerPosition();
    coordenadasRef.current?.mostrar(puntero ? aPuntoLogico(puntero) : null);
    if (puntero) recuadro.actualizar(puntero);
  };

  const esCirculo = figuraSeleccionada?.forma === "CIRCULO";
  // El circulo siempre crece parejo (el candado de proporcion se retiro:
  // el unico candado del panel bloquea la figura entera)
  const proporcionFija = esCirculo;
  const totalPalcos = figuras.filter((f) => f.tipo === "PALCO").length;
  const totalErrores = Object.keys(errores).length;
  const puedeGuardar =
    hayCambios &&
    totalErrores === 0 &&
    !guardado.guardando &&
    !borrador.pendiente;
  const motivoGuardar = borrador.pendiente
    ? "Primero decide qué hacer con el borrador"
    : totalErrores > 0
      ? "Corrige las figuras en rojo"
      : !hayCambios
        ? "No hay cambios por guardar"
        : "Guardar el dibujo en el sistema";

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
          <button
            type="button"
            onClick={pegarCopia}
            disabled={!hayCopia}
            title={
              hayCopia
                ? "Pegar (Ctrl/Cmd + V)"
                : "Primero copia una figura (Ctrl/Cmd + C)"
            }
            className={`${botonClase} px-3 gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Pegar
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
          <button
            type="button"
            onClick={guardarDibujo}
            disabled={!puedeGuardar}
            title={motivoGuardar}
            className="ml-2 h-8 px-4 rounded-lg bg-[#097EEC] text-white text-xs font-medium hover:bg-[#0562C7] inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {guardado.guardando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {guardado.guardando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <AvisosEditor
        borradorPendiente={borrador.pendiente}
        borradorGuardadoEn={borrador.guardadoEn}
        hayCambios={hayCambios}
        erroresGenerales={guardado.erroresGenerales}
        onRecuperar={recuperarBorrador}
        onDescartar={borrador.descartar}
      />

      <div className="flex gap-3 h-[calc(100vh-360px)] min-h-[480px]">
        {/* Mesa de trabajo: el gris es fuera del lienzo */}
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
                    onPresionar={alPresionar}
                    onClic={alHacerClic}
                    onCambiar={actualizar}
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
                  // Proporcion fija: solo esquinas (las manijas de los
                  // lados estirarian un solo lado y romperian la proporcion)
                  keepRatio={proporcionFija}
                  // Shift es para seleccionar varias: que no invierta el candado
                  shiftBehavior="none"
                  enabledAnchors={
                    proporcionFija ? ANCLAS_ESQUINAS : ANCLAS_TODAS
                  }
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
          totalSeleccionadas={seleccion.length}
          error={
            figuraSeleccionada ? errores[figuraSeleccionada.clave] : undefined
          }
          lienzoAncho={lienzo.ancho}
          lienzoAlto={lienzo.alto}
          totalPalcos={totalPalcos}
          totalReferencias={figuras.length - totalPalcos}
          totalErrores={totalErrores}
          onCambiar={(cambios) =>
            figuraSeleccionada && actualizar(figuraSeleccionada.clave, cambios)
          }
          onCopiar={copiarSeleccion}
          onDuplicar={duplicarSeleccion}
          onBorrar={borrarSeleccion}
          bloqueadasEnSeleccion={
            seleccionadas.filter((f) => f.bloqueada).length
          }
          onBloquear={bloquearSeleccion}
        />
      </div>

      <p className="text-[11px] text-gray-400">
        Rueda: zoom · Arrastrar el fondo: mover la vista · Shift + arrastrar:
        seleccionar varias · Shift + clic: agregar o quitar · Supr: borrar ·
        Esc: quitar selección · Ctrl/Cmd + A, C, V, D: todo, copiar, pegar,
        duplicar
      </p>
    </div>
  );
}
