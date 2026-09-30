"use client";

import { AlertTriangle, CheckCircle2, History, XCircle } from "lucide-react";
import { horaCorta } from "../hooks/useBorradorRecinto";

interface AvisosEditorProps {
  // Borrador de la pestana distinto de lo guardado, esperando decision
  borradorPendiente: { guardadoEn: string } | null;
  borradorGuardadoEn: string | null;
  hayCambios: boolean;
  erroresGenerales: string[];
  onRecuperar: () => void;
  onDescartar: () => void;
}

// La franja de estado sobre el lienzo: borrador por recuperar, problemas
// al guardar, cambios sin guardar o todo guardado
export default function AvisosEditor({
  borradorPendiente,
  borradorGuardadoEn,
  hayCambios,
  erroresGenerales,
  onRecuperar,
  onDescartar,
}: AvisosEditorProps) {
  if (borradorPendiente) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
        <span className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 flex-shrink-0" />
          Tienes un borrador sin guardar de las{" "}
          {horaCorta(borradorPendiente.guardadoEn)} en esta pestaña.
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRecuperar}
            className="px-3 py-1 rounded-md bg-[#097EEC] text-white font-medium hover:bg-[#0562C7]"
          >
            Recuperar
          </button>
          <button
            type="button"
            onClick={onDescartar}
            className="px-3 py-1 rounded-md border border-blue-200 text-blue-700 font-medium hover:bg-blue-100"
          >
            Descartar
          </button>
        </div>
      </div>
    );
  }

  if (erroresGenerales.length > 0) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 space-y-1">
        {erroresGenerales.map((mensaje, i) => (
          <p key={i} className="flex items-start gap-1.5">
            <XCircle className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
            {mensaje}
          </p>
        ))}
      </div>
    );
  }

  if (hayCambios) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
        Cambios sin guardar
        {borradorGuardadoEn &&
          ` (respaldados en esta pestaña a las ${horaCorta(borradorGuardadoEn)})`}
        . Presiona Guardar para que queden en el sistema.
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
      Todo guardado en el sistema.
    </p>
  );
}
