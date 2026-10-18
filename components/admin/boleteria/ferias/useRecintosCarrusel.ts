import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RecintosService from "@/services/RecintosService";
import { Recinto } from "@/interfaces/recinto.interface";

// Dibujo de un recinto ya pedido: con sus figuras, o "error" si fallo
export type DetalleRecinto = Recinto | "error";

// Datos del selector de recinto de la feria. La lista (sin figuras) se
// pide una vez; el dibujo de cada recinto se pide aparte y queda guardado,
// asi volver a uno ya visto es instantaneo
export const useRecintosCarrusel = (asignadoId: number | null) => {
  const [recintos, setRecintos] = useState<Recinto[] | null>(null);
  const [error, setError] = useState(false);
  const [detalles, setDetalles] = useState<Record<number, DetalleRecinto>>({});
  // Pedidos ya hechos (o en curso): cada recinto se pide una sola vez
  const pedidos = useRef(new Set<number>());

  useEffect(() => {
    RecintosService.getRecintos()
      .then((res) => setRecintos(res.data))
      .catch(() => setError(true));
  }, []);

  // Solo activos (RN-23), mas el asignado aunque este desactivado: el
  // formulario nunca muestra vacio el recinto que la feria tiene (RN-24)
  const opciones = useMemo(
    () => recintos?.filter((r) => r.activo || r.id === asignadoId) ?? null,
    [recintos, asignadoId],
  );

  const precargar = useCallback((ids: number[]) => {
    ids.forEach((id) => {
      if (pedidos.current.has(id)) return;
      pedidos.current.add(id);
      RecintosService.getRecintoById(id)
        .then((res) => setDetalles((prev) => ({ ...prev, [id]: res.data })))
        .catch(() => setDetalles((prev) => ({ ...prev, [id]: "error" })));
    });
  }, []);

  return { opciones, error, detalles, precargar };
};
