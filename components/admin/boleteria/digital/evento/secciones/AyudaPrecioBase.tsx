"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import { PRECIO_MINIMO } from "../opciones";

// "?" junto al precio base: abre una ventana chica que explica para qué
// se usa (en PALCO, el precio de los palcos sin precio propio) y por qué
// no puede ser gratis
export default function AyudaPrecioBase({ esPalco }: { esPalco: boolean }) {
  const [abierta, setAbierta] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierta(true)}
        aria-label="¿Para qué es el precio base?"
        title="¿Para qué es el precio base?"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold leading-none text-gray-600 hover:bg-gray-300 transition-colors"
      >
        ?
      </button>
      {abierta && (
        <VentanaAyuda esPalco={esPalco} onCerrar={() => setAbierta(false)} />
      )}
    </>
  );
}

function VentanaAyuda({
  esPalco,
  onCerrar,
}: {
  esPalco: boolean;
  onCerrar: () => void;
}) {
  const entendidoRef = useRef<HTMLButtonElement>(null);
  useEffect(() => entendidoRef.current?.focus(), []);
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ayuda-precio-base-titulo"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
      >
        <h2
          id="ayuda-precio-base-titulo"
          className="text-base font-semibold text-gray-800"
        >
          ¿Para qué es el precio base?
        </h2>
        {esPalco ? (
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p>Es lo que vale cada palco que no tiene precio propio.</p>
            <p>
              En la sección 4 (Precios) puedes ponerle a uno o varios palcos un
              precio distinto; todos los demás usan este.
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p>Es lo que vale cada boleta de este evento.</p>
          </div>
        )}
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <strong className="text-gray-700">No puede ser gratis:</strong> el
          mínimo es {formatCurrency(PRECIO_MINIMO)}, porque la pasarela de pago
          cobra un costo por cada transacción.
        </p>
        <button
          ref={entendidoRef}
          type="button"
          onClick={onCerrar}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
