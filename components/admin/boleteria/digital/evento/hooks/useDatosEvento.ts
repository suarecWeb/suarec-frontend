"use client";

import FeriasService from "@/services/FeriasService";
import RecintosService from "@/services/RecintosService";
import PalcosService from "@/services/PalcosService";
import { useCarga } from "../../palcos/hooks/usePalcosEventos";
import { Feria } from "@/interfaces/feria.interface";
import { Recinto } from "@/interfaces/recinto.interface";
import { MapaEventoPalco } from "@/interfaces/palcos.interface";

// Lo que la pagina de evento lee del backend, ademas del evento

export const useFerias = () =>
  useCarga<Feria[]>(
    () => FeriasService.getAllFeriasAdmin(),
    "No se pudieron cargar las ferias",
    "ferias",
  );

// El recinto (con sus figuras) de la feria elegida; null si no tiene
export const useRecinto = (recintoId: number | null) =>
  useCarga<Recinto | null>(
    () =>
      recintoId
        ? RecintosService.getRecintoById(recintoId)
        : Promise.resolve({ data: null }),
    "No se pudo cargar el recinto de la feria",
    recintoId,
  );

// Al editar un PALCO: sus precios, su recinto actual y sus ventas (para
// avisar antes de cambiar la feria, RN-25). null en los demas casos
export const useMapaOriginal = (eventoId: number | null) =>
  useCarga<MapaEventoPalco | null>(
    () =>
      eventoId
        ? PalcosService.getMapaEvento(eventoId)
        : Promise.resolve({ data: null }),
    "No se pudieron cargar los precios de los palcos",
    eventoId,
  );
