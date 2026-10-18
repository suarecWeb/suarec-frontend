import { useCallback, useEffect, useMemo, useState } from "react";
import { FiguraEditor } from "../figuras";

// Se escribe medio segundo despues del ultimo cambio, no en cada pixel
// de un arrastre
const ESPERA_GUARDADO_MS = 500;

interface Borrador {
  guardadoEn: string; // ISO
  figuras: FiguraEditor[];
}

const claveDe = (recintoId: number) => `recinto-borrador:${recintoId}`;

// El almacenamiento puede estar bloqueado (modo privado estricto, cuota):
// en ese caso el editor funciona igual, solo que sin borrador
const leer = (recintoId: number): Borrador | null => {
  try {
    const crudo = sessionStorage.getItem(claveDe(recintoId));
    if (!crudo) return null;
    const borrador = JSON.parse(crudo);
    return Array.isArray(borrador?.figuras) &&
      typeof borrador?.guardadoEn === "string"
      ? borrador
      : null;
  } catch {
    return null;
  }
};

const escribir = (recintoId: number, borrador: Borrador): boolean => {
  try {
    sessionStorage.setItem(claveDe(recintoId), JSON.stringify(borrador));
    return true;
  } catch {
    return false;
  }
};

const eliminar = (recintoId: number) => {
  try {
    sessionStorage.removeItem(claveDe(recintoId));
  } catch {
    // sin almacenamiento no hay nada que borrar
  }
};

// Borrador del dibujo en sessionStorage: red de seguridad si se recarga
// o se sale sin querer. Vive solo en esta pestana del navegador (nadie
// mas lo ve) y muere al cerrarla. NO es el guardado en el sistema
export const useBorradorRecinto = (
  recintoId: number,
  figuras: FiguraEditor[],
  figurasGuardadas: FiguraEditor[],
) => {
  const guardadasJson = useMemo(
    () => JSON.stringify(figurasGuardadas),
    [figurasGuardadas],
  );

  // Si al abrir hay un borrador distinto de lo guardado, se pregunta
  // antes de tocarlo: lo guardado pudo cambiar mientras tanto
  const [pendiente, setPendiente] = useState<Borrador | null>(() => {
    const borrador = leer(recintoId);
    return borrador && JSON.stringify(borrador.figuras) !== guardadasJson
      ? borrador
      : null;
  });
  const [guardadoEn, setGuardadoEn] = useState<string | null>(null);

  useEffect(() => {
    if (pendiente) return; // no pisar el borrador hasta que se decida
    const temporizador = setTimeout(() => {
      // Sin cambios respecto a lo guardado: no hace falta borrador
      if (JSON.stringify(figuras) === guardadasJson) {
        eliminar(recintoId);
        setGuardadoEn(null);
        return;
      }
      const borrador = { guardadoEn: new Date().toISOString(), figuras };
      if (escribir(recintoId, borrador)) setGuardadoEn(borrador.guardadoEn);
    }, ESPERA_GUARDADO_MS);
    return () => clearTimeout(temporizador);
  }, [figuras, pendiente, recintoId, guardadasJson]);

  // Devuelve las figuras del borrador para ponerlas en el editor
  const recuperar = useCallback((): FiguraEditor[] | null => {
    const figurasBorrador = pendiente?.figuras ?? null;
    setPendiente(null);
    return figurasBorrador;
  }, [pendiente]);

  const descartar = useCallback(() => {
    eliminar(recintoId);
    setPendiente(null);
  }, [recintoId]);

  return { pendiente, guardadoEn, recuperar, descartar };
};

// "3:45 p. m." para los avisos
export const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  });
