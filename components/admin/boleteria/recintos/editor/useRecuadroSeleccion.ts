import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import type Konva from "konva";
import { Punto } from "./useVistaLienzo";

interface Caja {
  x: number;
  y: number;
  width: number;
  height: number;
}

const seTocan = (a: Caja, b: Caja) =>
  !(
    b.x > a.x + a.width ||
    b.x + b.width < a.x ||
    b.y > a.y + a.height ||
    b.y + b.height < a.y
  );

interface Opciones {
  capaRef: RefObject<Konva.Layer>;
  recuadroRef: RefObject<Konva.Rect>;
  aPuntoLogico: (punto: Punto) => Punto;
  // Las que el recuadro puede elegir (el editor no pasa las bloqueadas)
  claves: string[];
  onSeleccionar: (claves: string[]) => void;
}

// Shift + arrastrar sobre el fondo dibuja un recuadro y, al soltar,
// selecciona las figuras que toca (opcion B: sin Shift, arrastrar el fondo
// sigue moviendo la vista). El recuadro se dibuja directo en Konva, sin
// estado de React, para no redibujar todas las figuras en cada movimiento
export const useRecuadroSeleccion = ({
  capaRef,
  recuadroRef,
  aPuntoLogico,
  claves,
  onSeleccionar,
}: Opciones) => {
  // Con Shift presionado el fondo deja de mover la vista
  const [shiftPresionado, setShiftPresionado] = useState(false);
  const inicio = useRef<Punto | null>(null);

  useEffect(() => {
    const bajar = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftPresionado(true);
    };
    const subir = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftPresionado(false);
    };
    // Si la ventana pierde el foco con Shift abajo, no llega el keyup
    const soltar = () => setShiftPresionado(false);
    window.addEventListener("keydown", bajar);
    window.addEventListener("keyup", subir);
    window.addEventListener("blur", soltar);
    return () => {
      window.removeEventListener("keydown", bajar);
      window.removeEventListener("keyup", subir);
      window.removeEventListener("blur", soltar);
    };
  }, []);

  const dibujar = useCallback(
    (desde: Punto, hasta: Punto) => {
      recuadroRef.current?.setAttrs({
        x: Math.min(desde.x, hasta.x),
        y: Math.min(desde.y, hasta.y),
        width: Math.abs(hasta.x - desde.x),
        height: Math.abs(hasta.y - desde.y),
        visible: true,
      });
      recuadroRef.current?.getLayer()?.batchDraw();
    },
    [recuadroRef],
  );

  const empezar = useCallback(
    (puntoPantalla: Punto) => {
      const punto = aPuntoLogico(puntoPantalla);
      inicio.current = punto;
      dibujar(punto, punto);
    },
    [aPuntoLogico, dibujar],
  );

  const actualizar = useCallback(
    (puntoPantalla: Punto) => {
      if (inicio.current) dibujar(inicio.current, aPuntoLogico(puntoPantalla));
    },
    [aPuntoLogico, dibujar],
  );

  // Al soltar (dentro o fuera del lienzo) se eligen las que toca el
  // recuadro. La caja de cada figura ya incluye su rotacion
  const terminar = useCallback(() => {
    const recuadro = recuadroRef.current;
    const capa = capaRef.current;
    if (!inicio.current || !recuadro || !capa) return;
    inicio.current = null;
    const caja = {
      x: recuadro.x(),
      y: recuadro.y(),
      width: recuadro.width(),
      height: recuadro.height(),
    };
    recuadro.visible(false);
    capa.batchDraw();

    // Menos de 4 px de pantalla: fue un clic, no un recuadro. No cambia la
    // seleccion (ej: Shift + clic sobre una figura bloqueada)
    const umbral = 4 / (recuadro.getStage()?.scaleX() ?? 1);
    if (caja.width < umbral && caja.height < umbral) return;

    onSeleccionar(
      claves.filter((clave) => {
        const nodo = capa.findOne(`#${clave}`);
        return nodo && seTocan(caja, nodo.getClientRect({ relativeTo: capa }));
      }),
    );
  }, [capaRef, recuadroRef, claves, onSeleccionar]);

  // mouseup en la ventana: tambien termina si se suelta fuera del lienzo
  useEffect(() => {
    window.addEventListener("mouseup", terminar);
    return () => window.removeEventListener("mouseup", terminar);
  }, [terminar]);

  return { shiftPresionado, empezar, actualizar };
};
