"use client";

import { CalendarDays, EyeOff, Monitor, Smartphone } from "lucide-react";
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

interface EventKanbanTicketProps {
  event: Evento;
}

// Ticket plano estilo Jira para la columna del tablero -- a diferencia de
// EventFlipCard (que sigue intacto para Eventos/Asignar/EditFeria), acá no
// hay flip ni imagen grande: solo nombre + chips de estado + pie con fecha
// e ícono de formato, para que quepan más eventos visibles por columna.
const EventKanbanTicket = ({ event }: EventKanbanTicketProps) => (
  <div className="rounded-md border border-gray-200 bg-white p-2.5 hover:border-gray-300 hover:shadow-sm transition-all">
    <div className="flex items-start gap-2">
      <div className="h-8 w-8 rounded flex-shrink-0 overflow-hidden bg-[#097EEC]/10 flex items-center justify-center">
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
          <CalendarDays className="h-4 w-4 text-[#097EEC]/50" />
        )}
      </div>
      <p className="text-[12.5px] font-medium text-gray-800 leading-snug line-clamp-2 flex-1">
        {event.nombre}
      </p>
    </div>

    <div className="mt-2 flex items-center gap-1 flex-wrap">
      <span
        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ESTADO_CONFIG[event.estado].color}`}
      >
        {ESTADO_CONFIG[event.estado].label}
      </span>
      {event.visible === false && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-800/70 text-white flex items-center gap-1">
          <EyeOff className="h-2.5 w-2.5" /> Oculto
        </span>
      )}
    </div>

    <div className="mt-2 flex items-center justify-between">
      <span className="text-[10px] text-gray-400 flex items-center gap-1">
        <CalendarDays className="h-3 w-3 text-gray-300" />
        {formatDisplayDate(event.fechaEvento)}
      </span>
      {(event.formatId === 1 || event.formatId === 2) && (
        <span
          title={event.formatId === 1 ? "Formato teléfono" : "Formato web"}
          className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          {event.formatId === 1 ? (
            <Smartphone className="h-3 w-3 text-gray-400" />
          ) : (
            <Monitor className="h-3 w-3 text-gray-400" />
          )}
        </span>
      )}
    </div>
  </div>
);

export default EventKanbanTicket;
