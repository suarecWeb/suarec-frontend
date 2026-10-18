"use client";

import { useEffect, useMemo, useState } from "react";
import { MapaEventoPalco, PrecioPalco } from "@/interfaces/palcos.interface";

// Precio propio de cada palco del evento mientras se edita la pagina.
// Solo se guardan las excepciones: el palco sin precio propio vale el
// precio base (RN-12)
export function usePreciosPalcos(
  original: MapaEventoPalco | null,
  recintoId: number | null,
) {
  const [precios, setPrecios] = useState<Map<number, number>>(new Map());
  const recintoOriginal = original?.recinto?.id ?? null;
  // La feria nueva usa otro recinto: los precios eran de palcos que ya no
  // estan en el mapa y el backend los borra al guardar (RN-25)
  const recintoCambia = !!original && recintoId !== recintoOriginal;

  // Otro recinto (al crear o al editar): los precios eran de otros palcos
  // y se empieza de cero. Mismo recinto: se conservan
  useEffect(() => {
    setPrecios(
      original && recintoId === recintoOriginal
        ? new Map(original.precios.map((p) => [p.figuraId, p.precio]))
        : new Map(),
    );
  }, [original, recintoId, recintoOriginal]);

  // Un palco vendido nunca cambia de precio (ni se le pone ni se le quita)
  const asignar = (ids: number[], precio: number) =>
    setPrecios((prev) => {
      const sig = new Map(prev);
      ids
        .filter((id) => !vendidos.has(id))
        .forEach((id) => sig.set(id, precio));
      return sig;
    });

  const volverAlBase = (ids: number[]) =>
    setPrecios((prev) => {
      const sig = new Map(prev);
      ids.filter((id) => !vendidos.has(id)).forEach((id) => sig.delete(id));
      return sig;
    });

  // Lo que se envia: solo palcos que siguen en el dibujo y con un precio
  // distinto del base (igual al base = sin precio propio). Un vendido va
  // siempre con el precio que tenía, aunque hoy sea igual al base: si se
  // omitiera, el backend lo tomaría como un cambio y lo rechazaría
  const paraGuardar = (
    palcosDelDibujo: Set<number>,
    precioBase?: number,
  ): PrecioPalco[] =>
    Array.from(precios.entries())
      .filter(
        ([id, precio]) =>
          palcosDelDibujo.has(id) &&
          (precio !== precioBase || vendidos.has(id)),
      )
      .map(([figuraId, precio]) => ({ figuraId, precio }));

  // Distintos de los guardados (para avisar antes de cambiar de pestaña).
  // Con otro recinto los guardados no cuentan: el cambio de feria ya avisa
  const cambiados = useMemo(() => {
    const guardados =
      original && recintoId === recintoOriginal ? original.precios : [];
    return (
      precios.size !== guardados.length ||
      guardados.some((p) => precios.get(p.figuraId) !== p.precio)
    );
  }, [precios, original, recintoId, recintoOriginal]);

  const preciosPerdidos = useMemo(
    () => (recintoCambia ? (original?.precios.length ?? 0) : 0),
    [recintoCambia, original],
  );

  // Al editar: los palcos ya vendidos y cuánto se pagó (en otro recinto no
  // se muestran: esos palcos no están en el mapa)
  const vendidos = useMemo(
    () =>
      original && !recintoCambia
        ? new Map(
            original.palcos
              .filter((p) => p.estado === "VENDIDO")
              .map((p) => [p.figuraId, p.monto]),
          )
        : new Map<number, number | null>(),
    [original, recintoCambia],
  );

  return {
    precios,
    asignar,
    volverAlBase,
    paraGuardar,
    recintoCambia,
    preciosPerdidos,
    vendidos,
    cambiados,
  };
}

export type PreciosPalcosEstado = ReturnType<typeof usePreciosPalcos>;
