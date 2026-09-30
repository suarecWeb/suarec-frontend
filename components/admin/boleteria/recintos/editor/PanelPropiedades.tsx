"use client";

import {
  Trash2,
  MousePointerClick,
  Copy,
  CopyPlus,
  Lock,
  Unlock,
} from "lucide-react";
import { FiguraEditor, NOMBRE_MAXIMO, normalizarRotacion } from "./figuras";
import CamposTamano from "./CamposTamano";

interface PanelPropiedadesProps {
  // La figura si hay UNA sola seleccionada
  figura: FiguraEditor | null;
  totalSeleccionadas: number;
  error?: string;
  lienzoAncho: number;
  lienzoAlto: number;
  totalPalcos: number;
  totalReferencias: number;
  totalErrores: number;
  onCambiar: (cambios: Partial<FiguraEditor>) => void;
  onCopiar: () => void;
  onDuplicar: () => void;
  onBorrar: () => void;
  // Cuantas de las seleccionadas estan bloqueadas (como Canva)
  bloqueadasEnSeleccion: number;
  onBloquear: (bloquear: boolean) => void;
}

const etiquetaClase = "block text-xs font-medium text-gray-600 mb-1";

// Propiedades de la figura seleccionada (PEN-7): nombre, tipo, tamano,
// color, rotacion y si la etiqueta gira con la figura
export default function PanelPropiedades({
  figura,
  totalSeleccionadas,
  error,
  lienzoAncho,
  lienzoAlto,
  totalPalcos,
  totalReferencias,
  totalErrores,
  onCambiar,
  onCopiar,
  onDuplicar,
  onBorrar,
  bloqueadasEnSeleccion,
  onBloquear,
}: PanelPropiedadesProps) {
  const resumen = (
    <div className="text-xs text-gray-500 space-y-1">
      <p>
        {totalPalcos} palco{totalPalcos === 1 ? "" : "s"} · {totalReferencias}{" "}
        referencia{totalReferencias === 1 ? "" : "s"}
      </p>
      {totalErrores > 0 && (
        <p className="text-red-600 font-medium">
          {totalErrores} figura{totalErrores === 1 ? "" : "s"} con problemas (en
          rojo)
        </p>
      )}
    </div>
  );

  const botonesGrupo = (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={onCopiar}
        title="Copiar (Ctrl/Cmd + C)"
        className="inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Copy className="h-3.5 w-3.5" />
        Copiar
      </button>
      <button
        type="button"
        onClick={onDuplicar}
        title="Duplicar (Ctrl/Cmd + D)"
        className="inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <CopyPlus className="h-3.5 w-3.5" />
        Duplicar
      </button>
    </div>
  );

  // El UNICO candado del panel, arriba: bloquea la figura entera (posicion,
  // tamano, rotacion y borrar), como "Bloquear" en Canva
  const candado = (
    bloqueada: boolean,
    textoBloqueada: string,
    textoLibre: string,
  ) => (
    <div>
      <button
        type="button"
        onClick={() => onBloquear(!bloqueada)}
        aria-pressed={bloqueada}
        title={bloqueada ? "Clic para desbloquear" : "Clic para bloquear"}
        className={`w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
          bloqueada
            ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        {bloqueada ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <Unlock className="h-3.5 w-3.5" />
        )}
        {bloqueada ? textoBloqueada : textoLibre}
      </button>
      {bloqueada && (
        <p className="mt-1 text-[11px] text-amber-700">
          No se mueve, estira, rota ni borra. Clic en el candado para
          desbloquear.
        </p>
      )}
    </div>
  );

  // Varias seleccionadas: solo acciones de grupo (el grupo se mueve
  // arrastrando cualquiera; por ahora no se estira ni se rota)
  if (totalSeleccionadas > 1) {
    return (
      <aside className="w-64 flex-shrink-0 rounded-xl border border-gray-200 p-4 flex flex-col gap-4">
        {resumen}
        {candado(
          bloqueadasEnSeleccion === totalSeleccionadas,
          `${totalSeleccionadas} bloqueadas`,
          `Bloquear ${totalSeleccionadas} figuras`,
        )}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-sm font-semibold text-gray-700">
            {totalSeleccionadas} figuras seleccionadas
          </p>
          <p className="text-xs text-gray-400">
            Arrastra cualquiera para moverlas juntas. Shift + clic agrega o
            quita una.
          </p>
          {bloqueadasEnSeleccion > 0 && (
            <p className="flex items-center gap-1 text-xs text-amber-700">
              <Lock className="h-3 w-3" />
              {bloqueadasEnSeleccion} bloqueada
              {bloqueadasEnSeleccion === 1 ? "" : "s"}: no se mueve
              {bloqueadasEnSeleccion === 1 ? "" : "n"} ni se borra
              {bloqueadasEnSeleccion === 1 ? "" : "n"}
            </p>
          )}
        </div>
        {botonesGrupo}
        <button
          type="button"
          onClick={onBorrar}
          className="inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Borrar {totalSeleccionadas} figuras
        </button>
      </aside>
    );
  }

  if (!figura) {
    return (
      <aside className="w-64 flex-shrink-0 rounded-xl border border-gray-200 p-4 flex flex-col gap-4">
        {resumen}
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-2">
          <MousePointerClick className="h-6 w-6" />
          <p className="text-xs">
            Selecciona una figura para editarla, o agrega una con los botones de
            arriba. Shift + arrastrar selecciona varias.
          </p>
        </div>
      </aside>
    );
  }

  const esPalco = figura.tipo === "PALCO";

  return (
    <aside className="w-64 flex-shrink-0 rounded-xl border border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto">
      {resumen}

      {/* Bloqueada: los campos quedan deshabilitados. "Tamano" va aparte
          porque ahi esta el candado, que debe seguir activo */}
      <fieldset
        disabled={figura.bloqueada}
        className={`flex flex-col gap-4 min-w-0 ${figura.bloqueada ? "opacity-50" : ""}`}
      >
        <div>
          <label className={etiquetaClase}>
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={figura.nombre}
            maxLength={NOMBRE_MAXIMO}
            onChange={(e) => onCambiar({ nombre: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${
              error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <div>
          <label className={etiquetaClase}>Tipo</label>
          <div className="grid grid-cols-2 gap-1">
            {(["PALCO", "REFERENCIA"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => onCambiar({ tipo })}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  figura.tipo === tipo
                    ? "border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {tipo === "PALCO" ? "Palco" : "Referencia"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            {esPalco
              ? "Se vende: el comprador lo puede tocar en el mapa."
              : "Solo visual (tarima, zonas): no se puede tocar. Siempre queda debajo de los palcos."}
          </p>
        </div>
      </fieldset>

      <CamposTamano
        figura={figura}
        lienzoAncho={lienzoAncho}
        lienzoAlto={lienzoAlto}
        onCambiar={onCambiar}
        onBloquear={onBloquear}
      />

      <fieldset
        disabled={figura.bloqueada}
        className={`flex flex-col gap-4 min-w-0 ${figura.bloqueada ? "opacity-50" : ""}`}
      >
        <div>
          <label className={etiquetaClase}>Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={
                /^#[0-9a-f]{6}$/i.test(figura.color) ? figura.color : "#000000"
              }
              onChange={(e) => onCambiar({ color: e.target.value })}
              className="h-9 w-12 rounded border border-gray-200 bg-white cursor-pointer"
            />
            <span className="text-xs text-gray-500 font-mono">
              {figura.color}
            </span>
          </div>
        </div>

        <div>
          <label className={etiquetaClase}>Rotación (grados)</label>
          <input
            type="number"
            min={0}
            max={359}
            step={1}
            value={figura.rotacion}
            onChange={(e) =>
              onCambiar({
                rotacion: normalizarRotacion(Number(e.target.value) || 0),
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]"
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={figura.etiquetaRotada}
            onChange={(e) => onCambiar({ etiquetaRotada: e.target.checked })}
            className="mt-0.5"
          />
          <span>
            El nombre gira con la figura
            <span className="block text-[11px] text-gray-400">
              Apagado: el nombre siempre queda horizontal.
            </span>
          </span>
        </label>
      </fieldset>

      <p className="text-[11px] text-gray-400">
        {figura.forma === "CIRCULO" ? "Círculo" : "Rectángulo"} · centro (
        {figura.x}, {figura.y})
      </p>

      <div className="mt-auto">{botonesGrupo}</div>

      <button
        type="button"
        onClick={onBorrar}
        disabled={figura.bloqueada}
        title={
          figura.bloqueada ? "Desbloquéala para poder borrarla" : undefined
        }
        className="inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Borrar figura
      </button>
    </aside>
  );
}
