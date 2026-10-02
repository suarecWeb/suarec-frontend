"use client";

import { Trash2, MousePointerClick, Copy, CopyPlus } from "lucide-react";
import {
  FiguraEditor,
  NOMBRE_MAXIMO,
  normalizarRotacion,
  siguienteNombrePalco,
} from "../figuras";
import CamposTamano from "./CamposTamano";
import PanelGrupo from "./PanelGrupo";
import { Alineacion, Distribucion, Orden } from "../acomodar";
import BotonesOrden from "./BotonesOrden";
import BotonesAlinear from "./BotonesAlinear";
import Repetir from "./Repetir";

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
  // Con varias: entre ellas. Con una: contra el lienzo
  onAlinear: (modo: Alineacion) => void;
  // Solo con 3 o mas seleccionadas (panel de grupo)
  onDistribuir: (eje: Distribucion) => void;
  // Capas: una figura o un grupo, siempre dentro de su tipo
  onOrdenar: (modo: Orden) => void;
  // Donde esta la figura dentro de su grupo (para apagar los botones)
  esLaDeArriba: boolean;
  esLaDeAbajo: boolean;
  // Repetir en fila o abanico: todo el dibujo (nombres y centro), la vista
  // previa en el lienzo y crear las copias
  figuras: FiguraEditor[];
  onVistaPrevia: (copias: FiguraEditor[] | null) => void;
  onRepetir: (copias: FiguraEditor[]) => void;
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
  onAlinear,
  onDistribuir,
  onOrdenar,
  esLaDeArriba,
  esLaDeAbajo,
  figuras,
  onVistaPrevia,
  onRepetir,
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

  // Varias seleccionadas: panel de grupo (reusa el resumen y los botones)
  if (totalSeleccionadas > 1) {
    return (
      <PanelGrupo
        resumen={resumen}
        botonesCopiar={botonesGrupo}
        totalSeleccionadas={totalSeleccionadas}
        bloqueadasEnSeleccion={bloqueadasEnSeleccion}
        onBloquear={onBloquear}
        onAlinear={onAlinear}
        onDistribuir={onDistribuir}
        onOrdenar={onOrdenar}
        onBorrar={onBorrar}
      />
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
          {/* Obligatorio solo en el palco: una referencia decorativa puede
              quedar sin nombre (migracion 065) */}
          <label className={etiquetaClase}>
            Nombre {esPalco && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={figura.nombre}
            maxLength={NOMBRE_MAXIMO}
            placeholder={esPalco ? undefined : "Sin nombre (decorativa)"}
            onChange={(e) => onCambiar({ nombre: e.target.value })}
            className={`w-full px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${
              error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          {!error && !esPalco && (
            <p className="mt-1 text-[11px] text-gray-400">
              Opcional: déjalo vacío si es solo decorativa.
            </p>
          )}
        </div>

        <div>
          <label className={etiquetaClase}>Tipo</label>
          <div className="grid grid-cols-2 gap-1">
            {(["PALCO", "REFERENCIA"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() =>
                  onCambiar(
                    // Un palco siempre tiene nombre: a una referencia sin
                    // nombre se le pone el siguiente "Palco N"
                    tipo === "PALCO" && !figura.nombre.trim()
                      ? { tipo, nombre: siguienteNombrePalco(figuras) }
                      : { tipo },
                  )
                }
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

      <BotonesAlinear
        respecto="lienzo"
        deshabilitado={figura.bloqueada}
        motivoDeshabilitado="Está bloqueada"
        onAlinear={onAlinear}
      />

      <BotonesOrden
        puedeSubir={!esLaDeArriba}
        puedeBajar={!esLaDeAbajo}
        deshabilitado={figura.bloqueada}
        nota={
          figura.tipo === "PALCO"
            ? "Entre los palcos (siempre encima de las referencias)."
            : "Entre las referencias (siempre debajo de los palcos)."
        }
        onOrdenar={onOrdenar}
      />

      {/* key: el formulario empieza de cero con cada figura */}
      <Repetir
        key={figura.clave}
        figura={figura}
        figuras={figuras}
        lienzo={{ ancho: lienzoAncho, alto: lienzoAlto }}
        onVistaPrevia={onVistaPrevia}
        onCrear={onRepetir}
      />

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
