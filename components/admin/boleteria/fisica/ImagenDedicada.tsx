"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import {
  esRecorteCompleto,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";

export default function ImagenDedicada({
  url,
  label,
  recorte,
}: {
  url?: string;
  label: string;
  // Encuadre de la imagen fuente (fracciones 0..1). Solo afecta la
  // presentación: la región elegida llena la caja, igual que hará el agente
  // al imprimir. Sin recorte se conserva el ajuste "contain" de siempre.
  recorte?: RecorteImagen | null;
}) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    if (recorte && !esRecorteCompleto(recorte)) {
      // La imagen se escala para que la región recortada llene la caja:
      // ancho/alto = 100/fracción %, desplazada -origen/fracción %. Es la
      // misma cuenta que hace kafkha-r antes de encajar en la caja TSPL.
      const { x, y, w, h } = recorte;
      return (
        <div className="relative block h-full w-full overflow-hidden">
          {/* Las URLs de los eventos pueden venir de diferentes proveedores de almacenamiento. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            draggable={false}
            onError={() => setFailed(true)}
            className="pointer-events-none absolute block max-w-none"
            style={{
              left: `${(-x / w) * 100}%`,
              top: `${(-y / h) * 100}%`,
              width: `${100 / w}%`,
              height: `${100 / h}%`,
            }}
          />
        </div>
      );
    }
    return (
      // Las URLs de los eventos pueden venir de diferentes proveedores de almacenamiento.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={label}
        draggable={false}
        onError={() => setFailed(true)}
        className="block h-full w-full object-contain"
        style={{ pointerEvents: "none", objectFit: "contain" }}
      />
    );
  }
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-slate-50/70 p-2 text-center text-xs text-slate-500"
      style={{
        whiteSpace: "normal",
        textTransform: "none",
        fontFamily: "inherit",
      }}
    >
      <ImageIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span>{failed ? "No se pudo cargar la imagen" : label}</span>
    </div>
  );
}
