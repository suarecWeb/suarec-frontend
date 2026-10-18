import { LiveStatus } from "@/hooks/boleteria/usePalcosSocket";

const BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium";

// Si el mapa se actualiza solo o hay que recargar para ver los cambios
export default function IndicadorEnVivo({
  conexion,
}: {
  conexion: LiveStatus;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      {conexion.status === "live" ? (
        <span
          className={`${BASE} bg-emerald-50 text-emerald-700 border-emerald-200`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          En vivo
        </span>
      ) : conexion.status === "connecting" ? (
        <span className={`${BASE} bg-gray-50 text-gray-500 border-gray-200`}>
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          Conectando…
        </span>
      ) : (
        <span className={`${BASE} bg-gray-100 text-gray-600 border-gray-200`}>
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-gray-400" />
          Sin conexión en vivo · {conexion.motivo}
        </span>
      )}
    </span>
  );
}
