"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

// Antes de cambiar a una feria con OTRO recinto cuando ya hay precios
// puestos: esos precios eran de palcos que no están en el mapa nuevo
export default function ConfirmarCambioFeria({
  onConfirmar,
  onCancelar,
}: {
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const cancelarRef = useRef<HTMLButtonElement>(null);
  useEffect(() => cancelarRef.current?.focus(), []);
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cambio-feria-titulo"
        aria-describedby="cambio-feria-mensaje"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
      >
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <h2
              id="cambio-feria-titulo"
              className="text-base font-semibold text-gray-800"
            >
              ¿Cambiar de feria?
            </h2>
            <p id="cambio-feria-mensaje" className="mt-1 text-sm text-gray-600">
              Al cambiar de feria se pierden los precios asignados: la feria
              nueva usa otro recinto.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            ref={cancelarRef}
            type="button"
            onClick={onCancelar}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] transition-colors"
          >
            Cambiar
          </button>
        </div>
      </div>
    </div>
  );
}
