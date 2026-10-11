// Estado de "contenido no disponible" para las vistas públicas de
// enlaces compartidos (RF-5): contenido eliminado, oculto, id inválido
// o fallo del endpoint. Nunca pantalla rota — siempre con el CTA de
// descarga, que es el objetivo de la página (ADR-2).
import { CircleAlert } from "lucide-react";
import PublicHeader from "./PublicHeader";
import DownloadAppCTA from "./DownloadAppCTA";

export default function EventoNoDisponible() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pb-16 pt-20 text-center">
        <CircleAlert className="h-14 w-14 text-red-400" />
        <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
          Este evento no está disponible
        </h1>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Es posible que el evento haya sido cancelado, retirado o que el enlace
          sea incorrecto. En la app puedes ver todos los eventos activos.
        </p>

        <div className="mt-8 w-full">
          <DownloadAppCTA />
        </div>
      </main>
    </div>
  );
}
