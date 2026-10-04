"use client";

import { ReactNode } from "react";
import { Armchair, DollarSign, Lock, Ticket } from "lucide-react";
import { EventoTipo } from "@/interfaces/event.interface";
import { CUPOS_POR_PALCO } from "../../../palcos/estadosPalco";
import { FormularioEvento } from "../hooks/useFormularioEvento";
import {
  TIPO_OPCIONES,
  claseCampo,
  claseEtiqueta,
  formatPriceDisplay,
  parsePriceInput,
} from "../opciones";
import AyudaPrecioBase from "./AyudaPrecioBase";

interface SeccionTipoProps {
  f: FormularioEvento;
  // Tipo con el que se creó (al editar). Un PALCO no cambia de tipo y otro
  // tipo no pasa a PALCO: sus palcos y ventas dependen de eso (backend)
  tipoOriginal?: EventoTipo;
  // La feria elegida tiene recinto: sin él no se venden palcos
  feriaConRecinto: boolean;
  // Palcos dibujados en el recinto de la feria; null si aún no hay
  palcosDelDibujo: number | null;
}

function CampoPrecio({
  id,
  etiqueta,
  valor,
  onCambiar,
  placeholder,
  obligatorio = false,
  error,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor?: number;
  onCambiar: (v?: number) => void;
  placeholder: string;
  obligatorio?: boolean;
  error?: string;
  // Botón "?" junto a la etiqueta (fuera del label, para no enfocar el campo)
  ayuda?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label
          htmlFor={id}
          className="flex items-center gap-1 text-xs font-medium text-gray-600"
        >
          <DollarSign className="h-3 w-3" />
          <span>{etiqueta}</span>
          {obligatorio && <span className="text-red-400">*</span>}
        </label>
        {ayuda}
      </div>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={formatPriceDisplay(valor)}
        onChange={(e) => onCambiar(parsePriceInput(e.target.value))}
        placeholder={placeholder}
        className={claseCampo(!!error)}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// 2 · Tipo y aforo. Aforo obligatorio; en PALCO no se pide: son los palcos
// dibujados en el recinto de la feria
export default function SeccionTipo({
  f,
  tipoOriginal,
  feriaConRecinto,
  palcosDelDibujo,
}: SeccionTipoProps) {
  const { form, cambiar, errores } = f;
  const editando = tipoOriginal !== undefined;
  const palcoApagado = editando || !feriaConRecinto;

  return (
    <div className="space-y-4">
      <div>
        <p className={claseEtiqueta}>
          Tipo <span className="text-red-400">*</span>
        </p>
        {tipoOriginal === EventoTipo.PALCO ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
            <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-medium">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
              <Armchair className="h-4 w-4 text-[#097EEC]" />
              Palco
            </span>
            <span className="text-xs text-gray-400">
              (un evento PALCO no cambia de tipo)
            </span>
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIPO_OPCIONES.map((op) => (
                <button
                  key={op.tipo}
                  type="button"
                  aria-pressed={f.tipo === op.tipo}
                  disabled={op.tipo === EventoTipo.PALCO && palcoApagado}
                  onClick={() => f.setTipo(op.tipo)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    f.tipo === op.tipo
                      ? "border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC]"
                      : errores.tipo
                        ? "border-red-300 text-red-400"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {op.icon}
                  {op.label}
                </button>
              ))}
            </div>
            {errores.tipo && (
              <p className="mt-1 text-xs text-red-500">{errores.tipo}</p>
            )}
            {editando ? (
              <p className="mt-1 text-[11px] text-gray-400">
                Un evento existente no puede pasar a PALCO: crea un evento PALCO
                nuevo.
              </p>
            ) : (
              !feriaConRecinto && (
                <p
                  className={`mt-1 text-[11px] ${f.esPalco ? "text-red-500" : "text-gray-400"}`}
                >
                  La feria necesita un recinto para vender palcos.
                </p>
              )
            )}
          </>
        )}
      </div>

      {f.esPalco ? (
        <>
          <p className="flex items-center gap-1.5 text-sm text-gray-700">
            <Armchair className="h-4 w-4 text-gray-400" />
            {palcosDelDibujo === null ? (
              <span className="text-gray-400">
                Capacidad: elige una feria con recinto
              </span>
            ) : (
              <span>
                Capacidad: <strong>{palcosDelDibujo} palcos</strong> ·{" "}
                {palcosDelDibujo * CUPOS_POR_PALCO} personas{" "}
                <span className="text-gray-400">
                  (sale del dibujo del recinto)
                </span>
              </span>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CampoPrecio
              id="evento-precio"
              etiqueta="Precio base del palco"
              valor={form.precioBase}
              onCambiar={(v) => cambiar("precioBase", v)}
              placeholder="Ej. 1.000.000"
              obligatorio
              error={errores.precioBase}
              ayuda={<AyudaPrecioBase esPalco />}
            />
            <CampoPrecio
              id="evento-cargo"
              etiqueta="Cargo SUAREC por palco"
              valor={f.cargoSuarec}
              onCambiar={f.setCargoSuarec}
              placeholder="0"
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="evento-aforo" className={claseEtiqueta}>
                <Ticket className="h-3 w-3 inline mr-1" />
                Aforo <span className="text-red-400">*</span>
              </label>
              <input
                id="evento-aforo"
                type="number"
                min={1}
                value={form.aforoTotal ?? ""}
                onChange={(e) =>
                  cambiar(
                    "aforoTotal",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Ej. 500"
                className={claseCampo(!!errores.aforoTotal)}
              />
              {errores.aforoTotal && (
                <p className="mt-1 text-xs text-red-500">
                  {errores.aforoTotal}
                </p>
              )}
            </div>
            <CampoPrecio
              id="evento-precio"
              etiqueta="Precio base"
              valor={form.precioBase}
              onCambiar={(v) => cambiar("precioBase", v)}
              placeholder="Ej. 50.000"
              obligatorio
              error={errores.precioBase}
              ayuda={<AyudaPrecioBase esPalco={false} />}
            />
          </div>
          <div className="sm:w-1/2 sm:pr-1.5">
            <CampoPrecio
              id="evento-cargo"
              etiqueta="Cargo SUAREC"
              valor={f.cargoSuarec}
              onCambiar={f.setCargoSuarec}
              placeholder="0"
            />
          </div>
        </>
      )}
    </div>
  );
}
