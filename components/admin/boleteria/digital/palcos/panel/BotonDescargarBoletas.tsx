"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Loader2 } from "lucide-react";
import PalcosService from "@/services/PalcosService";

// Caracteres que no van en un nombre de archivo
const NO_PERMITIDOS = /[\\/:*?"<>|]/g;

// El mensaje del backend llega dentro del archivo (la respuesta es un blob)
const mensajeDeError = async (err: any) => {
  const datos = err?.response?.data;
  if (datos instanceof Blob) {
    try {
      const { message } = JSON.parse(await datos.text());
      if (typeof message === "string") return message;
    } catch {
      // no era JSON: va el mensaje general
    }
  }
  return "No se pudo descargar el PDF";
};

const guardar = (archivo: Blob, nombre: string) => {
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// Descarga un solo PDF con las boletas del palco, para entregárselo al
// cliente
export default function BotonDescargarBoletas({
  eventoId,
  eventoNombre,
  figuraId,
  palcoNombre,
}: {
  eventoId: number;
  eventoNombre: string;
  figuraId: number;
  palcoNombre: string;
}) {
  const [descargando, setDescargando] = useState(false);

  const descargar = async () => {
    setDescargando(true);
    try {
      const { data } = await PalcosService.descargarBoletasPdf(
        eventoId,
        figuraId,
      );
      guardar(
        data,
        `Boletas ${palcoNombre} - ${eventoNombre}.pdf`.replace(
          NO_PERMITIDOS,
          "",
        ),
      );
    } catch (err) {
      toast.error(await mensajeDeError(err));
    } finally {
      setDescargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={descargar}
      disabled={descargando}
      className="w-full h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 inline-flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {descargando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {descargando ? "Generando PDF…" : "Descargar boletas (PDF)"}
    </button>
  );
}
