import { ETIQUETA_ESTADO_EVENTO, EstadoEventoPalco } from "./estadosPalco";

const CLASES: Record<EstadoEventoPalco, string> = {
  preventa: "bg-amber-50 text-amber-700 border-amber-200",
  venta: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cerrado: "bg-gray-100 text-gray-600 border-gray-200",
  cancelado: "bg-red-50 text-red-700 border-red-200",
};

// estado llega del backend (preventa | venta | cerrado | cancelado); uno
// desconocido se muestra tal cual, en gris
export default function EstadoEventoBadge({ estado }: { estado: string }) {
  const conocido = estado in CLASES ? (estado as EstadoEventoPalco) : null;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        conocido ? CLASES[conocido] : CLASES.cerrado
      }`}
    >
      {conocido ? ETIQUETA_ESTADO_EVENTO[conocido] : estado}
    </span>
  );
}
