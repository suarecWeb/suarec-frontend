import { ETIQUETA_ESTADO_EVENTO, EstadoEventoPalco } from "./estadosPalco";

const CLASES: Record<EstadoEventoPalco, string> = {
  preventa: "bg-amber-50 text-amber-700 border-amber-200",
  venta: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cerrado: "bg-gray-100 text-gray-600 border-gray-200",
  cancelado: "bg-red-50 text-red-700 border-red-200",
};

export default function EstadoEventoBadge({
  estado,
}: {
  estado: EstadoEventoPalco;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${CLASES[estado]}`}
    >
      {ETIQUETA_ESTADO_EVENTO[estado]}
    </span>
  );
}
