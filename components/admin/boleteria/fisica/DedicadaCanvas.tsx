"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import ImagenDedicada from "./ImagenDedicada";
import styles from "./dedicada.module.css";
import {
  CampoPlantillaDedicada,
  ClaveCampoDedicada,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";
import {
  constrainField,
  isImageField,
  DEFAULT_MARGIN_MM,
  FONT_PREVIEW_PX,
  normalizeMarginMm,
  DOTS_MM,
  FIELD_LABELS,
  PAPER_HEIGHT,
  PAPER_WIDTH,
} from "./plantillaDedicada";

// Tiradores de la caja seleccionada: 4 lados + 4 esquinas. Cada uno toca
// solo los bordes que nombra, así se puede recortar una caja por un lado
// sin mover el opuesto (antes el único tirador crecía siempre hacia abajo
// y a la derecha, y la foto del artista terminaba tapando la caja de abajo).
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

// Lado mínimo de una caja (mm): por debajo de esto deja de ser manipulable.
const MIN_SIDE_MM = 2;

function clampMm(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Posición CSS y cursor de cada tirador dentro de la caja.
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

interface Props {
  campos: CampoPlantillaDedicada[];
  margenMm?: number;
  selected?: ClaveCampoDedicada;
  onSelect?: (key: ClaveCampoDedicada) => void;
  onChange?: (field: CampoPlantillaDedicada) => void;
  preview?: boolean;
  showFieldLabels?: boolean;
  disabled?: boolean;
  imagenes?: Record<string, string>;
  // Encuadre por ranura de imagen (ver ImagenDedicada). Sin entrada = imagen
  // completa.
  recortes?: Record<string, RecorteImagen>;
  // Si viene, click derecho sobre un bloque de imagen CON url pide recortar
  // su encuadre (el recorte es por evento; quién renderiza decide si aplica).
  onCropRequest?: (clave: ClaveCampoDedicada) => void;
  valores?: Record<string, string>;
  qrValue?: string;
}

export default function DedicadaCanvas({
  campos,
  margenMm = DEFAULT_MARGIN_MM,
  selected,
  onSelect,
  onChange,
  preview,
  showFieldLabels = false,
  disabled,
  imagenes,
  recortes,
  onCropRequest,
  valores = {},
  qrValue = valores.qr ?? "",
}: Props) {
  const margin = normalizeMarginMm(margenMm);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    field: CampoPlantillaDedicada;
    handle: Handle;
  } | null>(null);
  function start(
    event: PointerEvent<HTMLDivElement>,
    field: CampoPlantillaDedicada,
    handle: Handle = "mover",
  ) {
    if (preview || disabled) return;
    // Solo el botón principal arrastra: el click derecho se reserva para el
    // menú de recorte de imágenes.
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect?.(field.clave);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      field,
      handle,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  // Cada tirador toca solo los bordes que le corresponden. Arrastrar el
  // borde superior/izquierdo mueve ese borde (cambia posicion Y tamaño) y
  // deja el borde opuesto quieto: así se recorta una caja sin empujar lo
  // que está debajo.
  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId || disabled) return;
    const dx = (event.clientX - current.x) / DOTS_MM;
    const dy = (event.clientY - current.y) / DOTS_MM;
    const field = current.field;
    const { handle } = current;

    if (handle === "mover") {
      onChange?.(
        constrainField(
          { ...field, xMm: field.xMm + dx, yMm: field.yMm + dy },
          margin,
        ),
      );
      return;
    }

    const maxX = 50 - margin;
    const maxY = PAPER_HEIGHT / 8 - margin;
    let { xMm, yMm, anchoMm, altoMm } = field;

    if (handle.includes("izq")) {
      // El borde derecho queda fijo: se mueve x y el ancho compensa.
      const derecha = xMm + anchoMm;
      xMm = clampMm(xMm + dx, margin, derecha - MIN_SIDE_MM);
      anchoMm = derecha - xMm;
    }
    if (handle.includes("der")) {
      anchoMm = clampMm(anchoMm + dx, MIN_SIDE_MM, maxX - xMm);
    }
    if (handle.includes("arriba")) {
      const abajo = yMm + altoMm;
      yMm = clampMm(yMm + dy, margin, abajo - MIN_SIDE_MM);
      altoMm = abajo - yMm;
    }
    if (handle.includes("abajo")) {
      altoMm = clampMm(altoMm + dy, MIN_SIDE_MM, maxY - yMm);
    }

    onChange?.(constrainField({ ...field, xMm, yMm, anchoMm, altoMm }, margin));
  }
  return (
    <div className={styles.canvas}>
      <p className={styles.safeLegend}>Zona segura · {margin} mm por borde</p>
      <div className={styles.surface}>
        <div
          role="group"
          aria-label={
            preview ? "Vista previa de impresión" : "Lienzo de edición"
          }
          className={`${styles.paper} relative shrink-0 bg-white text-black`}
          style={{
            width: PAPER_WIDTH,
            height: PAPER_HEIGHT,
            backgroundImage: preview
              ? undefined
              : "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-10 border border-dashed border-amber-600"
            style={{ inset: margin * DOTS_MM }}
          />
          {campos
            .filter((field) => field.activo)
            .map((field) => {
              const epsilon = 1e-7;
              const outsideSafeZone =
                field.xMm < margin - epsilon ||
                field.yMm < margin - epsilon ||
                field.xMm + field.anchoMm >
                  PAPER_WIDTH / DOTS_MM - margin + epsilon ||
                field.yMm + field.altoMm >
                  PAPER_HEIGHT / DOTS_MM - margin + epsilon;
              const align = {
                izquierda: "left",
                centro: "center",
                derecha: "right",
              } as const;
              return (
                <div
                  key={field.clave}
                  role={preview ? undefined : "button"}
                  tabIndex={preview ? undefined : 0}
                  aria-label={`${FIELD_LABELS[field.clave]}${outsideSafeZone ? ": caja fuera de la zona segura" : ""}`}
                  aria-pressed={preview ? undefined : selected === field.clave}
                  onClick={() => !preview && onSelect?.(field.clave)}
                  onContextMenu={(event) => {
                    // Click derecho sobre una imagen con url: recortar su
                    // encuadre. preventDefault evita el menú del navegador.
                    if (preview || disabled || !onCropRequest) return;
                    if (!isImageField(field.clave)) return;
                    if (!imagenes?.[field.clave]) return;
                    event.preventDefault();
                    event.stopPropagation();
                    onSelect?.(field.clave);
                    onCropRequest(field.clave);
                  }}
                  onKeyDown={(event) => {
                    if (preview || disabled) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect?.(field.clave);
                    }
                    const offsets: Record<string, [number, number]> = {
                      ArrowLeft: [-1, 0],
                      ArrowRight: [1, 0],
                      ArrowUp: [0, -1],
                      ArrowDown: [0, 1],
                    };
                    const offset = offsets[event.key];
                    if (offset) {
                      event.preventDefault();
                      onChange?.(
                        constrainField(
                          {
                            ...field,
                            xMm: field.xMm + offset[0] / 8,
                            yMm: field.yMm + offset[1] / 8,
                          },
                          margin,
                        ),
                      );
                    }
                  }}
                  onPointerDown={(event) => start(event, field)}
                  onPointerMove={move}
                  onPointerUp={() => {
                    drag.current = null;
                  }}
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
                  onLostPointerCapture={() => {
                    drag.current = null;
                  }}
                  title={
                    outsideSafeZone
                      ? `${FIELD_LABELS[field.clave]}: caja fuera de la zona segura; mueve o redimensiona la caja dentro del margen.`
                      : FIELD_LABELS[field.clave]
                  }
                  className={`absolute ${preview ? "" : "cursor-move focus:outline-blue-600"} ${outsideSafeZone ? "outline outline-2 outline-red-600" : !preview && selected === field.clave ? "outline outline-1 outline-blue-600 bg-blue-50/50" : !preview ? "outline outline-1 outline-slate-400" : ""}`}
                  style={{
                    left: field.xMm * 8,
                    top: field.yMm * 8,
                    width: field.anchoMm * 8,
                    height: field.altoMm * 8,
                    touchAction: preview ? undefined : "none",
                  }}
                >
                  <div
                    className="h-full w-full"
                    style={
                      isImageField(field.clave)
                        ? undefined
                        : {
                            textAlign: align[field.alineacion],
                            fontSize: FONT_PREVIEW_PX[field.fontSize],
                            fontFamily: "monospace",
                            whiteSpace: "pre",
                            fontWeight: field.negrita ? 700 : 400,
                            textTransform: field.mayusculas
                              ? "uppercase"
                              : "none",
                            lineHeight: 1.15,
                            overflow: "visible",
                          }
                    }
                  >
                    {isImageField(field.clave) ? (
                      <ImagenDedicada
                        key={imagenes?.[field.clave] ?? field.clave}
                        url={imagenes?.[field.clave]}
                        label={FIELD_LABELS[field.clave]}
                        recorte={recortes?.[field.clave]}
                      />
                    ) : showFieldLabels &&
                      !(field.clave === "qr"
                        ? qrValue
                        : valores[field.clave]) ? (
                      <div
                        className="flex h-full w-full items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50/70 p-0.5 text-center text-slate-500"
                        style={{
                          fontSize: 11,
                          lineHeight: 1.2,
                          fontWeight: 500,
                          fontFamily: "sans-serif",
                          whiteSpace: "normal",
                          textTransform: "none",
                        }}
                      >
                        {FIELD_LABELS[field.clave]}
                      </div>
                    ) : field.clave === "qr" ? (
                      qrValue ? (
                        <QRCodeSVG
                          value={qrValue}
                          size={Math.min(field.anchoMm, field.altoMm) * 8}
                          style={{
                            display: "inline-block",
                            verticalAlign: "top",
                          }}
                        />
                      ) : null
                    ) : (
                      (valores[field.clave] ?? "").replace(/[\r\n]+/g, " ")
                    )}
                  </div>
                  {/* Tiradores solo en la caja seleccionada: con los 8 en
                      todas las cajas el lienzo queda ilegible. */}
                  {!preview &&
                    !disabled &&
                    selected === field.clave &&
                    HANDLES.map(({ handle, className, label }) => (
                      <div
                        key={handle}
                        role="button"
                        aria-label={`Ajustar ${label} de ${FIELD_LABELS[field.clave]}`}
                        onPointerDown={(event) => start(event, field, handle)}
                        onPointerMove={move}
                        onPointerUp={() => {
                          drag.current = null;
                        }}
                        onPointerCancel={() => {
                          drag.current = null;
                        }}
                        className={`absolute h-2.5 w-2.5 rounded-sm border border-white bg-blue-600 ${className}`}
                      />
                    ))}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
