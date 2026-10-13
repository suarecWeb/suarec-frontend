"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { formatDisplayDate } from "@/lib/TimeZone";
import { useServerClock } from "../hooks/useServerClock";

const mensajeDeError = (err: any) => {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return typeof msg === "string" ? msg : "No se pudo completar la acción";
};

// Confirmación de una acción sobre un palco apartado (marcarlo vendido o
// liberarlo). Si el palco cambia mientras está abierta, lo avisa
export default function ConfirmarAccionPalco({
  titulo,
  texto,
  datos = [],
  etiquetaHora,
  desfase,
  textoConfirmar,
  peligro = false,
  vigente,
  accion,
  onListo,
  onCambio,
  onClose,
}: {
  titulo: string;
  texto: string;
  // Filas para revisar antes de confirmar (ej: los datos del cliente)
  datos?: { etiqueta: string; valor: string }[];
  // Muestra la hora del servidor con esta etiqueta (ej: "Hora de la venta")
  etiquetaHora?: string;
  desfase: number;
  textoConfirmar: string;
  peligro?: boolean;
  // El palco sigue apartado (cambia en vivo)
  vigente: boolean;
  accion: () => Promise<unknown>;
  onListo: () => void;
  // Otro lo cambió antes: hay que traer el mapa de nuevo
  onCambio: () => void;
  onClose: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ahora = useServerClock(desfase, !!etiquetaHora);
  const cambio = !vigente && !enviando;

  const confirmar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await accion();
      onListo();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409 || status === 400 || status === 404) onCambio();
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-accion-palco"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3
            id="titulo-accion-palco"
            className="text-lg font-semibold text-gray-800 truncate"
          >
            {titulo}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {cambio && (
            <div
              role="alert"
              className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Este palco ya cambió: alguien lo vendió o lo liberó.</span>
            </div>
          )}
          {error && !cambio && (
            <div
              role="alert"
              className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
            >
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <p className="text-sm text-gray-600">{texto}</p>
          {(datos.length > 0 || etiquetaHora) && (
            <dl className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              {datos.map(({ etiqueta, valor }) => (
                <div key={etiqueta} className="flex justify-between gap-3">
                  <dt className="text-gray-500">{etiqueta}</dt>
                  <dd className="text-gray-800 font-medium text-right break-all">
                    {valor}
                  </dd>
                </div>
              ))}
              {etiquetaHora && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">{etiquetaHora}</dt>
                  <dd className="text-gray-800 font-medium text-right">
                    {formatDisplayDate(new Date(ahora).toISOString())}
                  </dd>
                </div>
              )}
            </dl>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando || cambio}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                peligro
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#097EEC] hover:bg-[#0562C7]"
              }`}
            >
              {enviando ? "Guardando..." : textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
