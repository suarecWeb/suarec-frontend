"use client";

import { Upload, X } from "lucide-react";
import { FormularioEvento } from "../hooks/useFormularioEvento";
import { FORMAT_OPTIONS } from "../opciones";

// Caja de imagen a la izquierda de los datos y, debajo, el formato
// (Web o Móvil), como en el boceto
export default function ImagenEvento({ f }: { f: FormularioEvento }) {
  const { form, cambiar, errores, imagen } = f;
  const formato = FORMAT_OPTIONS.find((o) => o.id === form.formatId) ?? null;

  return (
    <div>
      {imagen.preview ? (
        <div
          className={`relative rounded-xl overflow-hidden border border-gray-200 ${formato?.ratio ?? "aspect-video"} ${formato?.width ?? "w-full"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagen.preview}
            alt="Imagen del evento"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={imagen.quitar}
            aria-label="Quitar imagen"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="evento-imagen"
          className={`cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 text-center px-2 hover:border-[#097EEC] hover:text-[#097EEC] transition-colors ${
            errores.imagen
              ? "border-red-300 text-red-400"
              : "border-gray-200 text-gray-400"
          } ${formato?.ratio ?? "h-36"} ${formato?.width ?? "w-full"}`}
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">Imagen (subir)</span>
          {!formato && (
            <span className="text-[10px] text-gray-300">
              Elige el formato abajo
            </span>
          )}
        </label>
      )}
      <input
        id="evento-imagen"
        ref={imagen.inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={imagen.elegir}
      />
      {errores.imagen && (
        <p className="mt-1 text-xs text-red-500">{errores.imagen}</p>
      )}

      <p className="mt-3 mb-1 text-xs font-medium text-gray-600">
        Formato <span className="text-red-400">*</span>
      </p>
      <div className="flex gap-2">
        {FORMAT_OPTIONS.map((op) => (
          <button
            key={op.id}
            type="button"
            aria-pressed={form.formatId === op.id}
            onClick={() => cambiar("formatId", op.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              form.formatId === op.id
                ? "border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC]"
                : errores.formatId
                  ? "border-red-300 text-red-400"
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
            }`}
          >
            {op.icon}
            {op.label}
          </button>
        ))}
      </div>
      {errores.formatId && (
        <p className="mt-1 text-xs text-red-500">{errores.formatId}</p>
      )}
      {formato && (
        <p className="mt-1 text-[11px] text-gray-400">
          Recomendado: {formato.resolution}
        </p>
      )}
    </div>
  );
}
