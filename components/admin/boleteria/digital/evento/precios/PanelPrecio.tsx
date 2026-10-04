"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  PRECIO_MINIMO,
  claseCampo,
  formatPriceDisplay,
  parsePriceInput,
} from "../opciones";

// Mismos límites que el backend (GuardarPreciosDto)
const PRECIO_MAXIMO = 999_999_999;

const plural = (n: number) => `${n} palco${n === 1 ? "" : "s"}`;

// "N palcos elegidos", Precio, [Aplicar precio], [Volver al precio base]
export default function PanelPrecio({
  cantidad,
  conPrecioPropio,
  onTodos,
  onNinguno,
  onAplicar,
  onVolverAlBase,
}: {
  // Palcos elegidos y cuántos de ellos ya tienen precio propio
  cantidad: number;
  conPrecioPropio: number;
  onTodos: () => void;
  onNinguno: () => void;
  onAplicar: (precio: number) => void;
  onVolverAlBase: () => void;
}) {
  const [precio, setPrecio] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const aplicar = () => {
    if (
      precio === undefined ||
      !Number.isInteger(precio) ||
      precio < PRECIO_MINIMO ||
      precio > PRECIO_MAXIMO
    ) {
      setError(
        `El precio debe ser un número entre ${formatCurrency(PRECIO_MINIMO)} y ${formatCurrency(PRECIO_MAXIMO)}`,
      );
      return;
    }
    onAplicar(precio);
    setPrecio(undefined);
  };

  return (
    <div className="rounded-xl border border-gray-200 p-3 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          {plural(cantidad)} elegido{cantidad === 1 ? "" : "s"}
        </span>
        <span className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={onTodos}
            className="text-[#097EEC] hover:underline"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={onNinguno}
            disabled={cantidad === 0}
            className="text-gray-500 hover:underline disabled:opacity-40"
          >
            Ninguno
          </button>
        </span>
      </div>
      <div>
        <label
          htmlFor="precio-palcos"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          Precio
        </label>
        <input
          id="precio-palcos"
          type="text"
          inputMode="numeric"
          value={formatPriceDisplay(precio)}
          onChange={(e) => {
            setPrecio(parsePriceInput(e.target.value));
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            // Enter no envía el formulario del evento
            e.preventDefault();
            if (cantidad > 0) aplicar();
          }}
          placeholder="Ej. 2.500.000"
          className={claseCampo(!!error)}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <button
        type="button"
        onClick={aplicar}
        disabled={cantidad === 0}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Aplicar precio
      </button>
      <button
        type="button"
        onClick={onVolverAlBase}
        disabled={conPrecioPropio === 0}
        className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Volver al precio base
      </button>
    </div>
  );
}
