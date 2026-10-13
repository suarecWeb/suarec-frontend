"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PalcosService from "@/services/PalcosService";
import {
  AvisoPalcoAdmin,
  FeriaConEventosPalco,
  MapaEventoPalco,
} from "@/interfaces/palcos.interface";
import { conAviso } from "../estadosPalco";

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

// Mapa de un evento: recinto, estado y detalle de cada palco. Se mantiene
// al dia con los avisos en vivo; refrescar lo pide de nuevo sin el spinner
export function useMapaEvento(eventoId: number) {
  const [carga, setCarga] = useState<Carga<MapaEventoPalco>>({
    estado: "cargando",
  });
  // Hora del servidor menos la del computador
  const [desfase, setDesfase] = useState(0);
  const pedidos = useRef({ enviados: 0, mostrado: 0 });
  // El ultimo aviso de cada palco y su numero de llegada
  const avisos = useRef({
    recibidos: 0,
    ultimo: new Map<number, { aviso: AvisoPalcoAdmin; n: number }>(),
  });

  const pedir = useCallback(
    (silencioso: boolean) => {
      const pedido = ++pedidos.current.enviados;
      const desde = avisos.current.recibidos;
      if (!silencioso) setCarga({ estado: "cargando" });
      PalcosService.getMapaEvento(eventoId)
        .then(({ data }) => {
          // Ya se mostro una respuesta mas nueva (o es de otro evento)
          if (pedido <= pedidos.current.mostrado) return;
          pedidos.current.mostrado = pedido;
          const servidor = Date.parse(data.servidorAhora);
          if (!Number.isNaN(servidor)) {
            const nuevo = servidor - Date.now();
            setDesfase((d) => (Math.abs(nuevo - d) > 1000 ? nuevo : d));
          }
          // Los avisos que llegaron mientras tanto son mas nuevos que la respuesta
          let mapa = data;
          avisos.current.ultimo.forEach(({ aviso, n }) => {
            if (n > desde) mapa = conAviso(mapa, aviso);
          });
          setCarga({ estado: "listo", datos: mapa });
        })
        .catch((err) => {
          if (pedido <= pedidos.current.mostrado) return;
          // Un refresco que falla no tapa el mapa que ya se ve
          setCarga((actual) =>
            silencioso && actual.estado === "listo"
              ? actual
              : errorDe(err, "No se pudo cargar el mapa del evento"),
          );
        });
    },
    [eventoId],
  );

  useEffect(() => {
    // Lo que falte por llegar del evento anterior ya no se muestra
    pedidos.current.mostrado = pedidos.current.enviados;
    avisos.current.ultimo.clear();
    pedir(false);
  }, [pedir]);

  const aplicarAviso = useCallback(
    (aviso: AvisoPalcoAdmin) => {
      if (aviso.reload) {
        pedir(true);
        return;
      }
      if (aviso.figuraId === undefined) return;
      const ultimo = avisos.current.ultimo.get(aviso.figuraId);
      // Un aviso mas viejo que el ultimo de ese palco que llego tarde
      if (ultimo && aviso.cambiadoEn < ultimo.aviso.cambiadoEn) return;
      avisos.current.ultimo.set(aviso.figuraId, {
        aviso,
        n: ++avisos.current.recibidos,
      });
      setCarga((actual) =>
        actual.estado === "listo"
          ? { estado: "listo", datos: conAviso(actual.datos, aviso) }
          : actual,
      );
    },
    [pedir],
  );

  const reintentar = useCallback(() => pedir(false), [pedir]);
  const refrescar = useCallback(() => pedir(true), [pedir]);
  return { carga, desfase, reintentar, refrescar, aplicarAviso };
}
