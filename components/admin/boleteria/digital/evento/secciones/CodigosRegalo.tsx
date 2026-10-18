"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Gift } from "lucide-react";
import EventsService from "@/services/EventsService";
import { Evento } from "@/interfaces/event.interface";
import { FormularioEvento } from "../hooks/useFormularioEvento";
import { claseCampo, claseEtiqueta } from "../opciones";

// Al crear: interruptor + cantidad (se generan despues de crear el evento).
// Al editar: generar y descargar al instante, sin guardar el formulario
export default function CodigosRegalo({
  f,
  evento,
}: {
  f: FormularioEvento;
  evento?: Evento;
}) {
  if (evento?.id) return <CodigosDeEventoExistente evento={evento} />;
  const { codigos, errores, limpiarError } = f;

  // Como en el boceto: [ ] Generar códigos   Cantidad [____]
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={codigos.generar}
            onChange={(e) => {
              codigos.setGenerar(e.target.checked);
              limpiarError("codigos");
            }}
            className="h-4 w-4 rounded border-gray-300 text-[#097EEC] focus:ring-[#097EEC]/30"
          />
          <Gift className="h-4 w-4 text-[#097EEC]" />
          Generar códigos
        </label>
        <div className="flex items-center gap-2">
          <label
            htmlFor="evento-codigos"
            className="text-xs font-medium text-gray-600"
          >
            Cantidad
          </label>
          <input
            id="evento-codigos"
            type="number"
            min={1}
            max={10000}
            disabled={!codigos.generar}
            value={codigos.cantidad ?? ""}
            onChange={(e) => {
              codigos.setCantidad(
                e.target.value ? Number(e.target.value) : undefined,
              );
              limpiarError("codigos");
            }}
            placeholder="Ej. 1000"
            className={`w-36 disabled:opacity-50 ${claseCampo(!!errores.codigos)}`}
          />
        </div>
      </div>
      {errores.codigos && (
        <p className="mt-1 text-xs text-red-500">{errores.codigos}</p>
      )}
      <p className="mt-1 text-[11px] text-gray-400">
        Se suman al aforo del evento y se descargan en Excel.
      </p>
    </div>
  );
}

function CodigosDeEventoExistente({ evento }: { evento: Evento }) {
  const [cantidad, setCantidad] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [disponibles, setDisponibles] = useState(!!evento.permiteCodigoRegalo);

  const generar = async () => {
    if (!cantidad || cantidad < 1) {
      setError("Indica una cantidad (mínimo 1)");
      return;
    }
    setGenerando(true);
    try {
      const res = await EventsService.generarCodigosRegalo(
        evento.id!,
        cantidad,
      );
      toast.success(`Se generaron ${res.data.cantidad} códigos de regalo`);
      setCantidad(undefined);
      setDisponibles(true);
    } catch {
      toast.error("No se pudieron generar los códigos");
    } finally {
      setGenerando(false);
    }
  };

  const descargar = async () => {
    setDescargando(true);
    try {
      await EventsService.descargarCodigosRegalo(evento.id!, evento.nombre);
    } catch {
      toast.error("No se pudo descargar el Excel de códigos");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="evento-codigos" className={claseEtiqueta}>
          Generar más códigos
        </label>
        <div className="flex gap-2">
          <input
            id="evento-codigos"
            type="number"
            min={1}
            max={10000}
            value={cantidad ?? ""}
            onChange={(e) => {
              setCantidad(e.target.value ? Number(e.target.value) : undefined);
              setError(null);
            }}
            placeholder="Ej. 100"
            className={`flex-1 min-w-0 ${claseCampo(!!error)}`}
          />
          <button
            type="button"
            onClick={generar}
            disabled={generando}
            className="px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 transition-colors"
          >
            {generando ? "Generando..." : "Generar"}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <p className="mt-1 text-[11px] text-gray-400">
          Se generan al instante, sin guardar el resto del formulario.
        </p>
      </div>
      {disponibles && (
        <button
          type="button"
          onClick={descargar}
          disabled={descargando}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#097EEC] border border-[#097EEC]/30 rounded-lg hover:bg-[#097EEC]/5 disabled:opacity-60 transition-colors"
        >
          <Download className="h-4 w-4" />
          {descargando ? "Descargando..." : "Descargar códigos (Excel)"}
        </button>
      )}
    </div>
  );
}
