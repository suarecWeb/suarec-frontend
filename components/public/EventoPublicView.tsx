// Vista pública de SOLO LECTURA de un evento (roadmap compartir-
// publicacion-evento-enlace, ADR-2 ampliado 2026-10-05): el visitante
// que abre el enlace compartido puede VER el evento, pero comprar y
// gestionar solo se puede en la app — de ahí el DownloadAppCTA.
import Image from "next/image";
import { Calendar, MapPin, Ticket, User } from "lucide-react";
import { PublicEvento } from "@/lib/public-api";
import { formatDisplayDate } from "@/lib/TimeZone";
import { formatCurrency } from "@/lib/formatCurrency";
import PublicHeader from "./PublicHeader";
import DownloadAppCTA from "./DownloadAppCTA";

const ESTADO_CHIP: Record<
  PublicEvento["estado"],
  { label: string; className: string }
> = {
  preventa: { label: "Preventa", className: "bg-amber-100 text-amber-800" },
  venta: { label: "En venta", className: "bg-green-100 text-green-800" },
  cerrado: { label: "Venta cerrada", className: "bg-gray-200 text-gray-700" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

interface EventoPublicViewProps {
  evento: PublicEvento;
}

export default function EventoPublicView({ evento }: EventoPublicViewProps) {
  const chip = ESTADO_CHIP[evento.estado] ?? ESTADO_CHIP.cerrado;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
        {/* Hero */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-200">
          {evento.imagenUrl ? (
            <Image
              src={evento.imagenUrl}
              alt={evento.nombre}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#097EEC]/10">
              <Ticket className="h-16 w-16 text-[#097EEC]" />
            </div>
          )}
          <span
            className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${chip.className}`}
          >
            {chip.label}
          </span>
        </div>

        {/* Datos principales */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {evento.nombre}
          </h1>

          <div className="mt-4 space-y-2.5 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-[#097EEC]" />
              {formatDisplayDate(evento.fechaEvento)}
            </p>
            {evento.ubicacion && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#097EEC]" />
                {evento.ubicacion}
              </p>
            )}
            {evento.nombreOrganizador && (
              <p className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-[#097EEC]" />
                Organiza: {evento.nombreOrganizador}
              </p>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-2 border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-500">Boletas desde</span>
            <span className="text-2xl font-extrabold text-[#097EEC]">
              {formatCurrency(evento.precioBase)}
            </span>
          </div>
        </section>

        {/* Descripción */}
        {evento.descripcion && (
          <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">
              Acerca del evento
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {evento.descripcion}
            </p>
          </section>
        )}

        {/* Feria (si el evento pertenece a una) */}
        {evento.feria && (
          <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">
              Parte de la feria: {evento.feria.nombre}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {formatDisplayDate(evento.feria.fechaInicio)} —{" "}
              {formatDisplayDate(evento.feria.fechaFin)}
            </p>
            {evento.feria.ubicacion && (
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0 text-[#097EEC]" />
                {evento.feria.ubicacion}
              </p>
            )}
          </section>
        )}

        {/* CTA: el core transaccional vive solo en la app */}
        <div className="mt-6">
          <DownloadAppCTA eventoId={String(evento.id)} />
        </div>
      </main>
    </div>
  );
}
