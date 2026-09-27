"use client";

import type { ReactNode } from "react";
import {
  CalendarDays,
  MapPin,
  Ticket,
  DollarSign,
  EyeOff,
  Smartphone,
  Monitor,
} from "lucide-react";
import FlipCard from "@/components/FlipCard";
import { Evento, EventoEstado } from "@/interfaces/event.interface";
import { formatDisplayDate } from "@/lib/TimeZone";

const ESTADO_CONFIG: Record<EventoEstado, { label: string; color: string }> = {
  [EventoEstado.PREVENTA]: {
    label: "Preventa",
    color: "bg-amber-100 text-amber-700",
  },
  [EventoEstado.VENTA]: {
    label: "Venta",
    color: "bg-green-100 text-green-700",
  },
  [EventoEstado.CERRADO]: {
    label: "Cerrado",
    color: "bg-gray-100 text-gray-600",
  },
  [EventoEstado.CANCELADO]: {
    label: "Cancelado",
    color: "bg-red-100 text-red-600",
  },
};

export interface EventFlipCardProps {
  event: Evento;
  hideAforo?: boolean;
  // Botones del reverso (Editar, Ocultar, Vender física, etc). Si no se
  // pasa, el reverso solo muestra la info -- útil para vistas de solo
  // lectura como "Eventos asignados" dentro de una feria.
  actions?: ReactNode;
}

const EventFlipCard = ({
  event,
  hideAforo = false,
  actions,
}: EventFlipCardProps) => (
  <FlipCard
    ariaLabel={`Evento ${event.nombre}`}
    width={2000}
    height={360}
    radius={12}
    background="#ffffff"
    color="#111827"
    tiltMax={6}
    glareOpacity={0.12}
    hoverScale={1.01}
    draggable={false}
    front={
      <div className="w-full h-full bg-gradient-to-br from-[#097EEC]/10 to-[#097EEC]/20 flex items-center justify-center relative">
        {event.imagenUrl ? (
          <img
            src={event.imagenUrl}
            alt={event.nombre}
            className={`w-full h-full object-cover ${event.visible === false ? "grayscale" : ""}`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <CalendarDays className="h-10 w-10 text-[#097EEC]/40" />
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          {event.visible === false && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800/70 text-white flex items-center gap-1">
              <EyeOff className="h-3 w-3" /> Oculto
            </span>
          )}

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ESTADO_CONFIG[event.estado].color}`}
          >
            {ESTADO_CONFIG[event.estado].label}
          </span>
        </div>

        <span className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/40 text-white">
          {event.nombre}
        </span>
      </div>
    }
    back={
      <div className="w-full h-full overflow-y-auto p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
            {event.nombre}
          </h3>

          {event.formatId === 1 && (
            <span title="Formato teléfono">
              <Smartphone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            </span>
          )}
          {event.formatId === 2 && (
            <span title="Formato web">
              <Monitor className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-400 line-clamp-2">
          {event.descripcion}
        </p>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarDays className="h-3 w-3 text-gray-300 flex-shrink-0" />
            {formatDisplayDate(event.fechaEvento)}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3 w-3 text-gray-300 flex-shrink-0" />
            {event.ubicacion}
          </div>

          {/* Aforo y precio */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {!hideAforo && event.aforoTotal && (
              <span className="flex items-center gap-1">
                <Ticket className="h-3 w-3 text-gray-300" />
                {event.aforoTotal} boletas
              </span>
            )}

            {event.precioBase !== undefined && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-gray-300" />

                {event.precioBase === 0 ? (
                  "Gratis"
                ) : (
                  <>
                    {Number(event.precioBase).toLocaleString("es-CO")}{" "}
                    <span className="text-gray-400">COP</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {actions && (
          <div
            className="mt-4 flex items-center gap-2"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {actions}
          </div>
        )}
      </div>
    }
  />
);

export default EventFlipCard;
