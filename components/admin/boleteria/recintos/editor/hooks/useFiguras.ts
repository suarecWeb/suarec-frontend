import { useCallback, useRef, useState } from "react";
import { FiguraEditor } from "../figuras";
import { Orden, reordenar } from "../acomodar";

// Pasos que se pueden deshacer. Cada paso guarda el arreglo anterior;
// las figuras que no cambiaron se comparten, asi que pesa poco
const MAXIMO_PASOS = 100;
// Cambios del mismo tipo seguidos (ej: escribir el nombre letra por
// letra) dentro de este tiempo cuentan como un solo paso
const VENTANA_AGRUPAR_MS = 1000;

// De que momento es el ultimo paso: los cambios del mismo lote (mismo
// instante) o del mismo grupo seguido se le suman en vez de abrir otro
interface Marca {
  lote: number;
  grupo?: string;
  hora: number;
}

interface Historial {
  figuras: FiguraEditor[];
  pasado: FiguraEditor[][];
  futuro: FiguraEditor[][];
  marca: Marca | null;
}

// La figura con los cambios; la MISMA figura si ninguno cambia nada (asi
// no cuenta como paso para deshacer)
const conCambios = (f: FiguraEditor, cambios: Partial<FiguraEditor>) =>
  (Object.keys(cambios) as (keyof FiguraEditor)[]).some(
    (k) => f[k] !== cambios[k],
  )
    ? { ...f, ...cambios }
    : f;

// Mismas figuras (las mismas referencias): el cambio no hizo nada
const mismoDibujo = (a: FiguraEditor[], b: FiguraEditor[]) =>
  a.length === b.length && a.every((f, i) => f === b[i]);

// Las figuras del dibujo en memoria, con deshacer y rehacer (PEN-24).
// Todas las modificaciones pasan por aqui: guardar (item 6) y el
// historial se apoyan en esto. iniciales como funcion: solo se calcula al
// montar el editor
export const useFiguras = (iniciales: () => FiguraEditor[]) => {
  const [historial, setHistorial] = useState<Historial>(() => ({
    figuras: iniciales(),
    pasado: [],
    futuro: [],
    marca: null,
  }));
  // Lo que pasa en el mismo instante es un solo paso: al arrastrar un
  // grupo, Konva avisa el cambio de cada figura por separado. Cada
  // instante tiene su numero de lote
  const lote = useRef({ id: 0, abierto: false });

  const cambiar = useCallback(
    (transformar: (prev: FiguraEditor[]) => FiguraEditor[], grupo?: string) => {
      if (!lote.current.abierto) {
        lote.current = { id: lote.current.id + 1, abierto: true };
        setTimeout(() => {
          lote.current.abierto = false;
        }, 0);
      }
      const marca: Marca = { lote: lote.current.id, grupo, hora: Date.now() };

      // Si abre paso o se suma al anterior se decide AQUI, con el ultimo
      // paso real: un cambio que no hizo nada no deja marca (si no, el
      // siguiente cambio se pegaria al paso anterior)
      setHistorial((prev) => {
        const figuras = transformar(prev.figuras);
        if (mismoDibujo(figuras, prev.figuras)) return prev;
        const ultima = prev.marca;
        const sumar =
          ultima !== null &&
          (ultima.lote === marca.lote ||
            (grupo !== undefined &&
              ultima.grupo === grupo &&
              marca.hora - ultima.hora < VENTANA_AGRUPAR_MS));
        // Un cambio nuevo borra lo que se podia rehacer
        if (sumar) return { ...prev, figuras, futuro: [], marca };
        return {
          figuras,
          pasado: [...prev.pasado, prev.figuras].slice(-MAXIMO_PASOS),
          futuro: [],
          marca,
        };
      });
    },
    [],
  );

  const agregar = useCallback(
    (figura: FiguraEditor) => cambiar((prev) => [...prev, figura]),
    [cambiar],
  );

  // Varias de una vez (pegar o duplicar un grupo)
  const agregarVarias = useCallback(
    (nuevas: FiguraEditor[]) => cambiar((prev) => [...prev, ...nuevas]),
    [cambiar],
  );

  // grupo: los cambios seguidos con el mismo grupo son un solo paso (el
  // panel lo usa al escribir). Si nada cambia de verdad, no hay paso
  const actualizar = useCallback(
    (clave: string, cambios: Partial<FiguraEditor>, grupo?: string) =>
      cambiar(
        (prev) =>
          prev.map((f) => (f.clave === clave ? conCambios(f, cambios) : f)),
        grupo,
      ),
    [cambiar],
  );

  // Varias figuras con cambios distintos, en un solo paso (ej: alinear)
  const actualizarVarias = useCallback(
    (cambios: Record<string, Partial<FiguraEditor>>) =>
      cambiar((prev) =>
        prev.map((f) =>
          cambios[f.clave] ? conCambios(f, cambios[f.clave]) : f,
        ),
      ),
    [cambiar],
  );

  // Capas: sube o baja las elegidas dentro de su grupo (un solo paso)
  const ordenar = useCallback(
    (claves: string[], modo: Orden) =>
      cambiar((prev) => reordenar(prev, new Set(claves), modo)),
    [cambiar],
  );

  const borrar = useCallback(
    (clave: string) => cambiar((prev) => prev.filter((f) => f.clave !== clave)),
    [cambiar],
  );

  const borrarVarias = useCallback(
    (claves: string[]) => {
      const aBorrar = new Set(claves);
      cambiar((prev) => prev.filter((f) => !aBorrar.has(f.clave)));
    },
    [cambiar],
  );

  // Todo el dibujo de una vez (al guardar o al recuperar un borrador). Es
  // un punto de partida nuevo: el historial se vacia. Deshacer mas atras
  // de lo guardado devolveria figuras sin su id del sistema
  const reemplazar = useCallback((nuevas: FiguraEditor[]) => {
    setHistorial({ figuras: nuevas, pasado: [], futuro: [], marca: null });
  }, []);

  // Sin marca: el cambio siguiente siempre abre un paso propio
  const deshacer = useCallback(() => {
    setHistorial((prev) =>
      prev.pasado.length === 0
        ? prev
        : {
            figuras: prev.pasado[prev.pasado.length - 1],
            pasado: prev.pasado.slice(0, -1),
            futuro: [prev.figuras, ...prev.futuro],
            marca: null,
          },
    );
  }, []);

  const rehacer = useCallback(() => {
    setHistorial((prev) =>
      prev.futuro.length === 0
        ? prev
        : {
            figuras: prev.futuro[0],
            pasado: [...prev.pasado, prev.figuras],
            futuro: prev.futuro.slice(1),
            marca: null,
          },
    );
  }, []);

  return {
    figuras: historial.figuras,
    agregar,
    agregarVarias,
    actualizar,
    actualizarVarias,
    ordenar,
    borrar,
    borrarVarias,
    reemplazar,
    deshacer,
    rehacer,
    puedeDeshacer: historial.pasado.length > 0,
    puedeRehacer: historial.futuro.length > 0,
  };
};
