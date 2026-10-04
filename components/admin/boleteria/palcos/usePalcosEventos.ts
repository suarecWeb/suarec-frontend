"use client";

import { useCallback, useEffect, useState } from "react";
import PalcosService from "@/services/PalcosService";
import {
  FeriaConEventosPalco,
  MapaEventoPalco,
} from "@/interfaces/palcos.interface";

export type Carga<T> =
  | { estado: "cargando" }
  // noEncontrado: 404 (no existe) o 400 (no es PALCO): reintentar no sirve
  | { estado: "error"; mensaje: string; noEncontrado: boolean }
  | { estado: "listo"; datos: T };

const errorDe = (err: any, porDefecto: string) => {
  const status = err?.response?.status;
  const mensaje = err?.response?.data?.message;
  return {
    estado: "error" as const,
    mensaje: typeof mensaje === "string" ? mensaje : porDefecto,
    noEncontrado: status === 404 || status === 400,
  };
};

// Pide los datos y los vuelve a pedir con "reintentar". Si cambia la
// clave (otro evento) antes de que llegue la respuesta, la vieja se ignora
export function useCarga<T>(
  pedir: () => Promise<{ data: T }>,
  porDefecto: string,
  clave: unknown,
) {
  const [carga, setCarga] = useState<Carga<T>>({ estado: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCarga({ estado: "cargando" });
    pedir()
      .then((res) => vigente && setCarga({ estado: "listo", datos: res.data }))
      .catch((err) => vigente && setCarga(errorDe(err, porDefecto)));
    return () => {
      vigente = false;
    };
    // pedir cambia en cada render; lo que importa es la clave y el intento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  return { carga, reintentar };
}

// Tab "Gestion de palcos": eventos PALCO por feria con sus contadores
export const useEventosConPalcos = () =>
  useCarga<FeriaConEventosPalco[]>(
    () => PalcosService.getEventosConPalcos(),
    "No se pudieron cargar los eventos de palcos",
    "lista",
  );

// Mapa de un evento: recinto, estado y detalle de cada palco
export const useMapaEvento = (eventoId: number) =>
  useCarga<MapaEventoPalco>(
    () => PalcosService.getMapaEvento(eventoId),
    "No se pudo cargar el mapa del evento",
    eventoId,
  );
