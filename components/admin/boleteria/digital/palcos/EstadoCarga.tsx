import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { RUTA_TAB_PALCOS } from "./rutas";

// Mientras llegan los datos de la base
export function Cargando({ texto }: { texto: string }) {
  return (
    <div
      role="status"
      className="py-20 flex flex-col items-center justify-center gap-3"
    >
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent" />
      <p className="text-sm text-gray-400">{texto}</p>
    </div>
  );
}

// Si fallo: reintentar (error de red o del servidor) o volver (no existe).
// volver: a donde regresa el boton (sin el, no se muestra)
export function ErrorCarga({
  mensaje,
  onReintentar,
  volver,
}: {
  mensaje: string;
  onReintentar?: () => void;
  volver?: string;
}) {
  return (
    <div role="alert" className="py-16 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
      <p className="mt-3 text-sm font-medium text-gray-700">{mensaje}</p>
      <div className="mt-4 flex items-center justify-center gap-4">
        {onReintentar && (
          <button
            type="button"
            onClick={onReintentar}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#097EEC] hover:underline"
          >
            <RotateCw className="h-4 w-4" />
            Reintentar
          </button>
        )}
        {volver && (
          <Link
            href={volver}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#097EEC] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {volver === RUTA_TAB_PALCOS
              ? "Volver a Gestión de palcos"
              : "Volver"}
          </Link>
        )}
      </div>
    </div>
  );
}
