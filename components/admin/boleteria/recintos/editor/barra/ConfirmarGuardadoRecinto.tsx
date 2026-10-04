"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import {
  ImpactoRecinto,
  PalcoVendidoMovido,
} from "@/interfaces/recinto.interface";
import { resumenVentas } from "./AvisoVentas";

// Antes de guardar un recinto con ventas (RN-09): recuerda a qué eventos
// afecta y lista los palcos vendidos que se movieron o cambiaron de
// tamaño (PEN-11)
export default function ConfirmarGuardadoRecinto({
  impacto,
  movidos,
  onConfirmar,
  onCancelar,
}: {
  impacto: ImpactoRecinto | null;
  movidos: PalcoVendidoMovido[];
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const confirmarRef = useRef<HTMLButtonElement>(null);
  useEffect(() => confirmarRef.current?.focus(), []);
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCancelar]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-guardado-titulo"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5"
      >
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="min-w-0">
            <h2
              id="confirmar-guardado-titulo"
              className="text-base font-semibold text-gray-800"
            >
              Guardar un recinto con ventas
            </h2>
            {impacto?.tieneVentas && (
              <p className="mt-1 text-sm text-gray-600">
                Tiene {resumenVentas(impacto).palcos}. Lo usan{" "}
                {resumenVentas(impacto).eventos}: los cambios del dibujo se
                verán en todos.
              </p>
            )}
            {movidos.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Moviste o cambiaste el tamaño de palcos ya vendidos:
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                  {movidos.map((p) => (
                    <li key={p.id}>
                      ✓ {p.nombre ?? "Palco"}{" "}
                      <span className="text-gray-500">
                        (vendido en {p.eventos}{" "}
                        {p.eventos === 1 ? "evento" : "eventos"})
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-gray-500">
                  Sus compradores lo verán en el nuevo lugar; sus boletas siguen
                  valiendo.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Volver
          </button>
          <button
            ref={confirmarRef}
            type="button"
            onClick={onConfirmar}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] transition-colors"
          >
            Sí, guardar
          </button>
        </div>
      </div>
    </div>
  );
}
