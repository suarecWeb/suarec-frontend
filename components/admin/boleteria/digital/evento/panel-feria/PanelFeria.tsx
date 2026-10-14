"use client";

import { AlertTriangle, Map as IconoMapa } from "lucide-react";
import { Feria } from "@/interfaces/feria.interface";
import { Recinto } from "@/interfaces/recinto.interface";
import VistaPreviaRecinto from "../../../recintos/vista-previa/VistaPreviaRecinto";
import { Carga } from "../../palcos/hooks/usePalcosEventos";
import { Cargando, ErrorCarga } from "../../palcos/EstadoCarga";
import SelectorFeria from "./SelectorFeria";
import { claseEtiqueta } from "../opciones";
import { rangoFechas } from "../fechas";

interface PanelFeriaProps {
  ferias: Carga<Feria[]>;
  onReintentarFerias: () => void;
  feriaId?: number;
  onCambiar: (feriaId: number | undefined) => void;
  // Crear, o editar un evento que no tiene feria. Al editar no se quita la
  // feria (el envío no manda null)
  permitirSinFeria: boolean;
  recinto: Carga<Recinto | null>;
  onReintentarRecinto: () => void;
  palcosDelDibujo: number | null;
  esPalco: boolean;
  error?: string;
  // RN-25 y avisos de precios (al editar un PALCO)
  avisos: string[];
}

// Columna derecha, fija al bajar (boceto): la feria con sus datos breves y
// el dibujo de su recinto, solo de referencia, para cualquier tipo
export default function PanelFeria({
  ferias,
  onReintentarFerias,
  feriaId,
  onCambiar,
  permitirSinFeria,
  recinto,
  onReintentarRecinto,
  palcosDelDibujo,
  esPalco,
  error,
  avisos,
}: PanelFeriaProps) {
  if (ferias.estado === "cargando")
    return <Cargando texto="Cargando ferias..." />;
  if (ferias.estado === "error")
    return (
      <ErrorCarga mensaje={ferias.mensaje} onReintentar={onReintentarFerias} />
    );

  const feria = ferias.datos.find((x) => x.id === feriaId);
  const cantidadEventos = feria?.eventos?.length ?? 0;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="evento-feria" className={claseEtiqueta}>
          Feria
        </label>
        <SelectorFeria
          ferias={ferias.datos}
          feriaId={feriaId}
          onCambiar={onCambiar}
          permitirSinFeria={permitirSinFeria}
          conError={!!error}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {ferias.datos.length === 0 && (
          <p className="mt-1 text-[11px] text-gray-400">
            No hay ferias creadas todavía. Crea una en la pestaña Ferias.
          </p>
        )}
      </div>

      {avisos.map((aviso) => (
        <p
          key={aviso}
          role="note"
          className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {aviso}
        </p>
      ))}

      {!feria ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
          Evento sin feria (suelto)
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 space-y-0.5">
            <p className="font-semibold text-sm text-gray-800">
              {feria.nombre}
            </p>
            <p className="text-xs text-gray-500">
              {rangoFechas(feria.fechaInicio, feria.fechaFin)} ·{" "}
              {feria.ubicacion}
            </p>
            <p className="text-xs text-gray-500">
              {cantidadEventos} evento{cantidadEventos === 1 ? "" : "s"}
            </p>
          </div>
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <RecintoDeLaFeria
              {...{ recinto, onReintentarRecinto, palcosDelDibujo, esPalco }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RecintoDeLaFeria({
  recinto,
  onReintentarRecinto,
  palcosDelDibujo,
  esPalco,
}: Pick<
  PanelFeriaProps,
  "recinto" | "onReintentarRecinto" | "palcosDelDibujo" | "esPalco"
>) {
  if (recinto.estado === "cargando")
    return <Cargando texto="Cargando recinto..." />;
  if (recinto.estado === "error")
    return (
      <ErrorCarga
        mensaje={recinto.mensaje}
        onReintentar={onReintentarRecinto}
      />
    );
  if (!recinto.datos)
    return (
      <div className="py-4 text-center">
        <IconoMapa className="mx-auto h-6 w-6 text-gray-300" />
        <p className="mt-1 text-xs text-gray-500">
          Esta feria no tiene recinto asignado
        </p>
        {esPalco && (
          <p className="mt-1 text-xs text-gray-500">
            El PALCO se vende sin mapa, como antes: con aforo y precio base.
          </p>
        )}
      </div>
    );

  return (
    <div>
      <div className="rounded-lg bg-white border border-gray-100 p-1.5">
        <VistaPreviaRecinto recinto={recinto.datos} className="w-full h-auto" />
      </div>
      <p className="mt-2 text-center text-xs font-medium text-gray-700">
        {recinto.datos.nombre} · {palcosDelDibujo} palcos
      </p>
      <p className="text-center text-[11px] text-gray-400">(solo referencia)</p>
    </div>
  );
}
