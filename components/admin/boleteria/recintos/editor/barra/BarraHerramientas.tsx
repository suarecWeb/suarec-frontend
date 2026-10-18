"use client";

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Ruler,
  Square,
  Circle as CircleIcon,
  Save,
  Loader2,
  ClipboardPaste,
  Undo2,
  Redo2,
  Grid3x3,
} from "lucide-react";
import { RecintoFiguraForma } from "@/interfaces/recinto.interface";
import { TamanoLienzo } from "../figuras";
import { TAMANOS_CUADRICULA } from "../hooks/useCuadricula";

interface BarraHerramientasProps {
  lienzo: TamanoLienzo;
  zoomRelativo: number;
  hayCopia: boolean;
  puedeDeshacer: boolean;
  puedeRehacer: boolean;
  cuadriculaActiva: boolean;
  tamanoCuadricula: number;
  guardando: boolean;
  puedeGuardar: boolean;
  motivoGuardar: string;
  onAgregar: (forma: RecintoFiguraForma) => void;
  onPegar: () => void;
  onDeshacer: () => void;
  onRehacer: () => void;
  onAlternarCuadricula: () => void;
  onCambiarTamanoCuadricula: (tamano: number) => void;
  onAlejar: () => void;
  onAcercar: () => void;
  onAjustar: () => void;
  onGuardar: () => void;
}

const botonClase =
  "h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center";

// La barra de arriba del editor: deshacer/rehacer, agregar figuras y
// pegar (izquierda), zoom y Guardar (derecha)
export default function BarraHerramientas({
  lienzo,
  zoomRelativo,
  hayCopia,
  puedeDeshacer,
  puedeRehacer,
  cuadriculaActiva,
  tamanoCuadricula,
  guardando,
  puedeGuardar,
  motivoGuardar,
  onAgregar,
  onPegar,
  onDeshacer,
  onRehacer,
  onAlternarCuadricula,
  onCambiarTamanoCuadricula,
  onAlejar,
  onAcercar,
  onAjustar,
  onGuardar,
}: BarraHerramientasProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 mr-1">
          <button
            type="button"
            onClick={onDeshacer}
            disabled={!puedeDeshacer || guardando}
            aria-label="Deshacer"
            title="Deshacer (Ctrl/Cmd + Z)"
            className={`${botonClase} w-8 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRehacer}
            disabled={!puedeRehacer || guardando}
            aria-label="Rehacer"
            title="Rehacer (Ctrl/Cmd + Shift + Z)"
            className={`${botonClase} w-8 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onAgregar("RECTANGULO")}
          disabled={guardando}
          className={`${botonClase} px-3 gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <Square className="h-3.5 w-3.5" />
          Rectángulo
        </button>
        <button
          type="button"
          onClick={() => onAgregar("CIRCULO")}
          disabled={guardando}
          className={`${botonClase} px-3 gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <CircleIcon className="h-3.5 w-3.5" />
          Círculo
        </button>
        <button
          type="button"
          onClick={onPegar}
          disabled={!hayCopia || guardando}
          title={
            hayCopia
              ? "Pegar (Ctrl/Cmd + V)"
              : "Primero copia una figura (Ctrl/Cmd + C)"
          }
          className={`${botonClase} px-3 gap-1.5 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Pegar
        </button>
        {/* Cuadrícula: lineas de fondo + imán; al prenderla aparece el
            tamano de celda (en unidades del lienzo) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onAlternarCuadricula}
            aria-pressed={cuadriculaActiva}
            title={
              cuadriculaActiva
                ? "Apagar la cuadrícula"
                : "Prender la cuadrícula: las figuras se pegan a sus líneas"
            }
            className={`h-8 px-3 inline-flex items-center justify-center gap-1.5 border text-xs font-medium transition-colors ${
              cuadriculaActiva
                ? "rounded-l-lg border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC] hover:bg-[#097EEC]/10"
                : "rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            Cuadrícula
          </button>
          {cuadriculaActiva && (
            <select
              value={tamanoCuadricula}
              onChange={(e) =>
                onCambiarTamanoCuadricula(Number(e.target.value))
              }
              aria-label="Tamaño de la celda"
              title="Tamaño de la celda, en unidades del lienzo"
              className="h-8 pl-2 pr-1 rounded-r-lg border border-l-0 border-[#097EEC] bg-white text-xs text-[#097EEC] outline-none"
            >
              {TAMANOS_CUADRICULA.map((t) => (
                <option key={t} value={t}>
                  Celda {t}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className="ml-2 flex items-center gap-1.5 text-xs text-gray-500">
          <Ruler className="h-3.5 w-3.5" />
          Lienzo {lienzo.ancho} × {lienzo.alto}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onAlejar}
          aria-label="Alejar"
          title="Alejar"
          className={`${botonClase} w-8`}
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-14 text-center text-xs font-medium text-gray-600 tabular-nums">
          {Math.round(zoomRelativo * 100)}%
        </span>
        <button
          type="button"
          onClick={onAcercar}
          aria-label="Acercar"
          title="Acercar"
          className={`${botonClase} w-8`}
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onAjustar}
          aria-label="Ajustar a la pantalla"
          title="Ajustar a la pantalla"
          className={`${botonClase} ml-1 px-3 gap-1.5 text-xs font-medium`}
        >
          <Maximize className="h-3.5 w-3.5" />
          Ajustar
        </button>
        <button
          type="button"
          onClick={onGuardar}
          disabled={!puedeGuardar}
          title={motivoGuardar}
          className="ml-2 h-8 px-4 rounded-lg bg-[#097EEC] text-white text-xs font-medium hover:bg-[#0562C7] inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {guardando ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
