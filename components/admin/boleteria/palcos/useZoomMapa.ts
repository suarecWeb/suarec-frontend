"use client";

import {
  PointerEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VistaDelMapa } from "../recintos/vista-previa/VistaPreviaRecinto";

interface Punto {
  x: number;
  y: number;
}

// Igual que el editor de recintos (RecintoEditor y Lienzo)
const FACTOR_BOTON = 1.25;
const SENSIBILIDAD_RUEDA = 1.0015;
// 1 = todo el recinto a la vista; hasta 10 veces mas cerca
const ZOOM_MAXIMO = 10;
// Menos que esto no es arrastrar: es un clic sobre el palco
const UMBRAL_ARRASTRE_PX = 4;

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(Math.max(valor, minimo), maximo);

// Acercar o alejar dejando QUIETO el punto indicado (el puntero, el centro
// del pellizco o el centro de la vista). Nunca sale del recinto
const zoomAlrededor = (
  vista: VistaDelMapa,
  punto: Punto,
  factor: number,
  lienzo: { ancho: number; alto: number },
): VistaDelMapa => {
  const ancho = limitar(
    vista.ancho / factor,
    lienzo.ancho / ZOOM_MAXIMO,
    lienzo.ancho,
  );
  const proporcion = ancho / vista.ancho;
  return moverDentro(
    {
      ancho,
      alto: (ancho * lienzo.alto) / lienzo.ancho,
      x: punto.x - (punto.x - vista.x) * proporcion,
      y: punto.y - (punto.y - vista.y) * proporcion,
    },
    lienzo,
  );
};

const moverDentro = (
  vista: VistaDelMapa,
  lienzo: { ancho: number; alto: number },
): VistaDelMapa => ({
  ...vista,
  x: limitar(vista.x, 0, lienzo.ancho - vista.ancho),
  y: limitar(vista.y, 0, lienzo.alto - vista.alto),
});

// Acercar, alejar y mover el mapa de un evento:
// - botones (+, -, Ajustar)
// - Ctrl/Cmd + rueda, o pellizcar en el trackpad (llega como Ctrl + rueda).
//   La rueda sola sigue bajando la pagina: el mapa ocupa casi toda la
//   pantalla y si no, uno quedaria "atrapado" al hacer scroll
// - arrastrar para moverse (solo si esta acercado)
// - en pantallas tactiles, pellizcar con dos dedos
// La vista es la parte del recinto que se ve (viewBox del SVG): no hay
// librerias nuevas y los palcos se siguen tocando igual
export function useZoomMapa(
  contenedorRef: RefObject<HTMLElement>,
  lienzo: { ancho: number; alto: number },
) {
  const { ancho, alto } = lienzo;
  const completa = useMemo(() => ({ x: 0, y: 0, ancho, alto }), [ancho, alto]);
  const [vista, setVista] = useState<VistaDelMapa>(completa);
  useEffect(() => setVista(completa), [completa]);
  const zoom = ancho / vista.ancho;

  // Punto de la pantalla -> punto del recinto
  const aRecinto = useCallback(
    (clientX: number, clientY: number): Punto | null => {
      const svg = contenedorRef.current?.querySelector("svg");
      const matriz = svg?.getScreenCTM();
      if (!matriz) return null;
      const p = new DOMPoint(clientX, clientY).matrixTransform(
        matriz.inverse(),
      );
      return { x: p.x, y: p.y };
    },
    [contenedorRef],
  );

  const zoomAlCentro = useCallback(
    (factor: number) =>
      setVista((v) =>
        zoomAlrededor(
          v,
          { x: v.x + v.ancho / 2, y: v.y + v.alto / 2 },
          factor,
          { ancho, alto },
        ),
      ),
    [ancho, alto],
  );
  const acercar = useCallback(() => zoomAlCentro(FACTOR_BOTON), [zoomAlCentro]);
  const alejar = useCallback(
    () => zoomAlCentro(1 / FACTOR_BOTON),
    [zoomAlCentro],
  );
  const ajustar = useCallback(() => setVista(completa), [completa]);

  // Rueda: listener propio porque React lo registra pasivo y asi no se
  // puede frenar el zoom de la pagina del navegador
  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const alGirar = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const punto = aRecinto(e.clientX, e.clientY);
      if (!punto) return;
      // deltaMode 1 = lineas (algunos mouse): se lleva a pixeles
      const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      setVista((v) =>
        zoomAlrededor(v, punto, Math.pow(SENSIBILIDAD_RUEDA, -delta), {
          ancho,
          alto,
        }),
      );
    };
    contenedor.addEventListener("wheel", alGirar, { passive: false });
    return () => contenedor.removeEventListener("wheel", alGirar);
  }, [contenedorRef, aRecinto, ancho, alto]);

  // ─── Arrastrar y pellizcar ───────────────────────────────────────────
  const punteros = useRef(new Map<number, Punto>());
  const arrastre = useRef<{
    id: number;
    inicio: Punto;
    vista: VistaDelMapa;
    // pixeles de pantalla por unidad del recinto al empezar
    escala: number;
  } | null>(null);
  const pellizco = useRef<{
    distancia: number;
    centro: Punto;
    vista: VistaDelMapa;
  } | null>(null);
  // Si hubo arrastre o pellizco, el clic que viene al soltar NO elige palco
  const movio = useRef(false);
  const [arrastrando, setArrastrando] = useState(false);
  const vistaActual = useRef(vista);
  vistaActual.current = vista;

  const distanciaYCentro = () => {
    const [a, b] = Array.from(punteros.current.values());
    return {
      distancia: Math.hypot(a.x - b.x, a.y - b.y),
      centro: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    };
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (punteros.current.size === 1) {
      movio.current = false;
      const matriz = contenedorRef.current
        ?.querySelector("svg")
        ?.getScreenCTM();
      arrastre.current = {
        id: e.pointerId,
        inicio: { x: e.clientX, y: e.clientY },
        vista: vistaActual.current,
        escala: matriz?.a ?? 1,
      };
    } else if (punteros.current.size === 2) {
      const { distancia, centro } = distanciaYCentro();
      const puntoCentro = aRecinto(centro.x, centro.y);
      arrastre.current = null;
      movio.current = true;
      if (puntoCentro && distancia > 0) {
        pellizco.current = {
          distancia,
          centro: puntoCentro,
          vista: vistaActual.current,
        };
      }
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pellizco.current && punteros.current.size === 2) {
      const { distancia } = distanciaYCentro();
      const inicial = pellizco.current;
      setVista(
        zoomAlrededor(
          inicial.vista,
          inicial.centro,
          distancia / inicial.distancia,
          { ancho, alto },
        ),
      );
      return;
    }

    const actual = arrastre.current;
    if (!actual || actual.id !== e.pointerId) return;
    // Sin acercar, todo el recinto ya esta a la vista: no hay a donde ir
    if (actual.vista.ancho >= ancho) return;
    const dx = e.clientX - actual.inicio.x;
    const dy = e.clientY - actual.inicio.y;
    if (!movio.current) {
      if (Math.hypot(dx, dy) < UMBRAL_ARRASTRE_PX) return;
      movio.current = true;
      setArrastrando(true);
      // Recien aqui se captura el puntero: si se capturara al presionar,
      // el clic de un palco iria al contenedor y no al palco
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setVista(
      moverDentro(
        {
          ...actual.vista,
          x: actual.vista.x - dx / actual.escala,
          y: actual.vista.y - dy / actual.escala,
        },
        { ancho, alto },
      ),
    );
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    punteros.current.delete(e.pointerId);
    if (punteros.current.size < 2) pellizco.current = null;
    if (punteros.current.size === 0) {
      arrastre.current = null;
      setArrastrando(false);
    }
  };

  // Va en fase de captura: frena el clic antes de que llegue al palco
  const onClickCapture = (e: MouseEvent<HTMLElement>) => {
    if (!movio.current) return;
    movio.current = false;
    e.stopPropagation();
    e.preventDefault();
  };

  return {
    vista,
    zoom,
    acercar,
    alejar,
    ajustar,
    puedeAcercar: zoom < ZOOM_MAXIMO - 0.001,
    puedeAlejar: zoom > 1.001,
    arrastrando,
    // Para el contenedor del mapa
    eventos: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onClickCapture,
    },
  };
}
