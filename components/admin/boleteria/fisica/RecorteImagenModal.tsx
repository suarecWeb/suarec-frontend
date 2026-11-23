"use client";

import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Crop, Loader2, RotateCcw, X } from "lucide-react";
import {
  ClaveImagenBoletaDedicada,
  RECORTE_COMPLETO,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";
import { FIELD_LABELS } from "./plantillaDedicada";
import styles from "./dedicada.module.css";

// Tiradores del encuadre: 4 lados + 4 esquinas, igual que en el lienzo del
// editor, pero aquí recortan la IMAGEN. La caja del campo no se toca.
type Handle =
  | "mover"
  | "arriba"
  | "abajo"
  | "izq"
  | "der"
  | "arriba-izq"
  | "arriba-der"
  | "abajo-izq"
  | "abajo-der";

const HANDLES: { handle: Handle; className: string; label: string }[] = [
  {
    handle: "arriba",
    className:
      "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
    label: "borde superior",
  },
  {
    handle: "abajo",
    className:
      "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
    label: "borde inferior",
  },
  {
    handle: "izq",
    className:
      "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
    label: "borde izquierdo",
  },
  {
    handle: "der",
    className:
      "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
    label: "borde derecho",
  },
  {
    handle: "arriba-izq",
    className:
      "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
    label: "esquina superior izquierda",
  },
  {
    handle: "arriba-der",
    className:
      "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
    label: "esquina superior derecha",
  },
  {
    handle: "abajo-izq",
    className:
      "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
    label: "esquina inferior izquierda",
  },
  {
    handle: "abajo-der",
    className:
      "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
    label: "esquina inferior derecha",
  },
];

// Lado mínimo del encuadre en fracción de la imagen: por debajo deja de ser
// manipulable.
const MIN_SIDE = 0.02;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}

// Redimensiona el encuadre. `ratio` es w/h en fracciones de la imagen
// (proporción de la caja convertida al espacio de la foto); null = recorte
// libre cuando no se pudo cargar la plantilla. Con proporción fija el ancla
// es la esquina o el borde opuesto al tirador: ese punto nunca se mueve, así
// el encuadre crece/encoge sin desplazarse.
function resizeRecorte(
  start: RecorteImagen,
  handle: Handle,
  fx: number,
  fy: number,
  ratio: number | null,
): RecorteImagen {
  const left = start.x;
  const top = start.y;
  const right = start.x + start.w;
  const bottom = start.y + start.h;
  const cx = left + start.w / 2;
  const cy = top + start.h / 2;

  if (ratio === null) {
    let x = left;
    let y = top;
    let w = start.w;
    let h = start.h;
    if (handle.includes("izq")) {
      x = Math.min(clamp01(fx), right - MIN_SIDE);
      w = right - x;
    }
    if (handle.includes("der")) {
      w = Math.max(MIN_SIDE, Math.min(1 - left, clamp01(fx) - left));
    }
    if (handle.includes("arriba")) {
      y = Math.min(clamp01(fy), bottom - MIN_SIDE);
      h = bottom - y;
    }
    if (handle.includes("abajo")) {
      h = Math.max(MIN_SIDE, Math.min(1 - top, clamp01(fy) - top));
    }
    return { x, y, w, h };
  }

  if (handle.includes("-")) {
    // Esquina: domina el eje con más recorrido y el otro sigue la proporción.
    const sx = handle.includes("izq") ? -1 : 1;
    const sy = handle.includes("arriba") ? -1 : 1;
    const ax = sx > 0 ? left : right;
    const ay = sy > 0 ? top : bottom;
    const dw = Math.abs(clamp01(fx) - ax);
    const dh = Math.abs(clamp01(fy) - ay);
    let w = Math.max(dw, dh * ratio, MIN_SIDE);
    let h = w / ratio;
    const maxW = sx > 0 ? 1 - ax : ax;
    const maxH = sy > 0 ? 1 - ay : ay;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return {
      x: sx > 0 ? ax : ax - w,
      y: sy > 0 ? ay : ay - h,
      w,
      h,
    };
  }

  if (handle === "izq" || handle === "der") {
    // Borde horizontal: el ancho lo da el puntero; el alto mantiene la
    // proporción y queda centrado en el borde opuesto, que no se mueve.
    const sx = handle === "der" ? 1 : -1;
    const ax = sx > 0 ? left : right;
    let w = Math.max(Math.abs(clamp01(fx) - ax), MIN_SIDE);
    let h = w / ratio;
    const maxW = sx > 0 ? 1 - ax : ax;
    const maxH = 2 * Math.min(cy, 1 - cy);
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    return { x: sx > 0 ? ax : ax - w, y: cy - h / 2, w, h };
  }

  // Borde vertical: simétrico al anterior.
  const sy = handle === "abajo" ? 1 : -1;
  const ay = sy > 0 ? top : bottom;
  let h = Math.max(Math.abs(clamp01(fy) - ay), MIN_SIDE);
  let w = h * ratio;
  const maxH = sy > 0 ? 1 - ay : ay;
  const maxW = 2 * Math.min(cx, 1 - cx);
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  if (w > maxW) {
    w = maxW;
    h = w / ratio;
  }
  return { x: cx - w / 2, y: sy > 0 ? ay : ay - h, w, h };
}

interface Props {
  slot: ClaveImagenBoletaDedicada;
  url: string;
  // anchoMm/altoMm de la caja del campo; null = proporción libre.
  boxAspect: number | null;
  initial?: RecorteImagen | null;
  pending: boolean;
  onSave: (recorte: RecorteImagen) => void;
  onClose: () => void;
}

export default function RecorteImagenModal({
  slot,
  url,
  boxAspect,
  initial,
  pending,
  onSave,
  onClose,
}: Props) {
  const [crop, setCrop] = useState<RecorteImagen>(initial ?? RECORTE_COMPLETO);
  // Relación ancho/alto real del archivo; hace falta para traducir la
  // proporción de la caja (mm) al espacio de fracciones de la imagen.
  const [imageAspect, setImageAspect] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    fx: number;
    fy: number;
    start: RecorteImagen;
    handle: Handle;
  } | null>(null);

  // w/h en fracciones de imagen equivalente a la proporción de la caja:
  // (w·imgW)/(h·imgH) = boxAspect  =>  w/h = boxAspect / imageAspect.
  const ratio =
    boxAspect !== null && imageAspect !== null && imageAspect > 0
      ? boxAspect / imageAspect
      : null;

  function fractions(event: ReactPointerEvent): { fx: number; fy: number } {
    const rect = area.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { fx: 0, fy: 0 };
    return {
      fx: clamp01((event.clientX - rect.left) / rect.width),
      fy: clamp01((event.clientY - rect.top) / rect.height),
    };
  }

  function startDrag(event: ReactPointerEvent, handle: Handle) {
    if (pending) return;
    event.preventDefault();
    event.stopPropagation();
    const { fx, fy } = fractions(event);
    drag.current = { id: event.pointerId, fx, fy, start: crop, handle };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId || pending) return;
    const { fx, fy } = fractions(event);
    if (current.handle === "mover") {
      const { start } = current;
      setCrop({
        ...start,
        x: Math.max(0, Math.min(1 - start.w, start.x + (fx - current.fx))),
        y: Math.max(0, Math.min(1 - start.h, start.y + (fy - current.fy))),
      });
      return;
    }
    setCrop(resizeRecorte(current.start, current.handle, fx, fy, ratio));
  }

  function endDrag() {
    drag.current = null;
  }

  const dragHandlers = {
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onLostPointerCapture: endDrag,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Recortar ${FIELD_LABELS[slot]}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!pending) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !pending) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Crop aria-hidden="true" className="h-4 w-4 text-[#097EEC]" />
              Recortar · {FIELD_LABELS[slot]}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Arrastra los puntos para elegir qué parte de la foto se verá. La
              caja conserva su posición y tamaño
              {ratio !== null ? ", y el encuadre mantiene su proporción." : "."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar sin guardar"
            disabled={pending}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>

        <div
          ref={area}
          className="relative w-full select-none overflow-hidden rounded-lg bg-slate-900"
        >
          {/* Las URLs de los eventos pueden venir de diferentes proveedores de almacenamiento. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={FIELD_LABELS[slot]}
            draggable={false}
            onLoad={(event) => {
              const img = event.currentTarget;
              if (img.naturalHeight > 0) {
                setImageAspect(img.naturalWidth / img.naturalHeight);
              }
            }}
            className="pointer-events-none block h-auto w-full"
          />
          <div
            role="presentation"
            className="absolute cursor-move border-2 border-[#097EEC]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
              // Atenúa lo que queda por fuera del encuadre.
              boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.55)",
              touchAction: "none",
            }}
            onPointerDown={(event) => startDrag(event, "mover")}
            {...dragHandlers}
          >
            {HANDLES.map(({ handle, className, label }) => (
              <div
                key={handle}
                role="button"
                aria-label={`Ajustar ${label} del encuadre`}
                onPointerDown={(event) => startDrag(event, handle)}
                {...dragHandlers}
                className={`absolute h-3 w-3 rounded-sm border border-white bg-[#097EEC] shadow ${className}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            className={styles.secondaryButton}
            disabled={pending}
            onClick={() => setCrop(RECORTE_COMPLETO)}
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Imagen completa
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={pending}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={pending}
              onClick={() =>
                onSave({
                  x: round4(crop.x),
                  y: round4(crop.y),
                  w: round4(crop.w),
                  h: round4(crop.h),
                })
              }
            >
              {pending ? (
                <Loader2
                  aria-hidden="true"
                  className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Crop aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              Guardar encuadre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
