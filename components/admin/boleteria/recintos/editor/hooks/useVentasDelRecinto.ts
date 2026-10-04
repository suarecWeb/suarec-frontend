import { useCallback, useEffect, useMemo, useState } from "react";
import RecintosService from "@/services/RecintosService";
import {
  ImpactoRecinto,
  PalcoProtegido,
  PalcoVendidoMovido,
} from "@/interfaces/recinto.interface";
import { ESTILO_ESTADO } from "../../../palcos/estadosPalco";
import { FiguraEditor } from "../figuras";

// PEN-11: mover o cambiar el tamaño (o la forma) de un vendido pide
// confirmación; el color no. Mismos campos que el backend
const CAMPOS_DE_POSICION = [
  "forma",
  "x",
  "y",
  "ancho",
  "alto",
  "rotacion",
] as const;

// Ventas del recinto en eventos futuros (ítem 7, RN-09): qué palcos están
// protegidos y en cuántos eventos. Se pide al abrir el editor. Solo avisa:
// lo que de verdad frena lo prohibido es el guardado en el backend
export function useVentasDelRecinto(recintoId: number) {
  const [impacto, setImpacto] = useState<ImpactoRecinto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    RecintosService.getImpacto(recintoId)
      .then((res) => vigente && setImpacto(res.data))
      .catch(() => vigente && setError(true));
    return () => {
      vigente = false;
    };
  }, [recintoId]);

  const porFigura = useMemo(
    () =>
      new Map(
        (impacto?.palcosProtegidos ?? []).map((p) => [p.figuraId, p] as const),
      ),
    [impacto],
  );

  const proteccionDe = useCallback(
    (f: FiguraEditor): PalcoProtegido | undefined =>
      f.id !== undefined ? porFigura.get(f.id) : undefined,
    [porFigura],
  );

  // Lo que ve el lienzo: un apartado se trata como bloqueado (no se
  // arrastra, no cambia de tamaño y el panel queda apagado). No cambia lo
  // que se guarda
  const conBloqueoPorVenta = useCallback(
    (figuras: FiguraEditor[]) =>
      porFigura.size === 0
        ? figuras
        : figuras.map((f) =>
            proteccionDe(f)?.motivo === "APARTADO" && !f.bloqueada
              ? { ...f, bloqueada: true }
              : f,
          ),
    [porFigura, proteccionDe],
  );

  // Marca junto al nombre, igual que en Gestión de palcos: ✓ vendido,
  // ★ apartado
  const marcasDe = useCallback(
    (figuras: FiguraEditor[]) => {
      const marcas: Record<string, string> = {};
      figuras.forEach((f) => {
        const p = proteccionDe(f);
        if (p) marcas[f.clave] = ESTILO_ESTADO[p.motivo].marca;
      });
      return marcas;
    },
    [proteccionDe],
  );

  // Vendidos que cambiaron de posición, tamaño o forma desde lo guardado
  const vendidosMovidos = useCallback(
    (figuras: FiguraEditor[], guardadas: FiguraEditor[]) => {
      const antes = new Map(guardadas.map((f) => [f.id, f] as const));
      return figuras.flatMap((f): PalcoVendidoMovido[] => {
        const p = proteccionDe(f);
        const original = f.id !== undefined ? antes.get(f.id) : undefined;
        if (p?.motivo !== "VENDIDO" || !original) return [];
        const cambio = CAMPOS_DE_POSICION.some((c) => original[c] !== f[c]);
        return cambio
          ? [{ id: f.id as number, nombre: f.nombre, eventos: p.eventos }]
          : [];
      });
    },
    [proteccionDe],
  );

  return {
    impacto,
    error,
    hayVentas: !!impacto?.tieneVentas,
    proteccionDe,
    conBloqueoPorVenta,
    marcasDe,
    vendidosMovidos,
  };
}
