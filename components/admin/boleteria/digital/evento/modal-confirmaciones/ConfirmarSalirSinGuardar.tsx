"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

// Al cambiar de pestaña con cambios sin guardar en "Datos y precios"
export default function ConfirmarSalirSinGuardar({
  onQuedarse,
  onSalir,
}: {
  onQuedarse: () => void;
  onSalir: () => void;
}) {
  const quedarseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => quedarseRef.current?.focus(), []);
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onQuedarse();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onQuedarse]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="salir-sin-guardar-titulo"
        aria-describedby="salir-sin-guardar-mensaje"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
      >
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div>
            <h2
              id="salir-sin-guardar-titulo"
              className="text-base font-semibold text-gray-800"
            >
              ¿Salir sin guardar?
            </h2>
            <p
              id="salir-sin-guardar-mensaje"
              className="mt-1 text-sm text-gray-600"
            >
              Tienes cambios sin guardar en Datos y precios. Si cambias de
              pestaña, se pierden.
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button
            ref={quedarseRef}
            type="button"
            onClick={onQuedarse}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Seguir editando
          </button>
          <button
            type="button"
            onClick={onSalir}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] transition-colors"
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </div>
  );
}
