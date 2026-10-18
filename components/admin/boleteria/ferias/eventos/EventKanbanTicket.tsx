"use client";

import {
  CalendarDays,
  Edit,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Evento, EventoEstado } from "@/interfaces/event.interface";
import { formatDisplayDate } from "@/lib/TimeZone";
import { TIPO_CONFIG } from "../../digital/evento/opciones";

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
  // Botón de editar (lápiz). Sin esto, el ticket no se puede editar
  onEditar?: () => void;
  // Ojo para ocultar o mostrar el evento en la app
  onCambiarVisibilidad?: () => void;
}

// Ticket plano estilo Jira para la columna del tablero -- a diferencia de
// EventFlipCard (que sigue intacto para Eventos/Asignar/EditFeria), acá no
// hay flip ni imagen grande: solo nombre + chips de estado + pie con fecha
// e ícono de formato, para que quepan más eventos visibles por columna.
const EventKanbanTicket = ({
  event,
  onEditar,
  onCambiarVisibilidad,
}: EventKanbanTicketProps) => {
  const tipo = event.tipo ? TIPO_CONFIG[event.tipo] : undefined;
  const oculto = event.visible === false;
  return (
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
        {(onCambiarVisibilidad || onEditar) && (
          <div className="flex items-center -mr-1 -mt-1 flex-shrink-0">
            {onCambiarVisibilidad && (
              <button
                type="button"
                // Un clic cambia la visibilidad; arrastrar sigue moviendo el ticket
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  onCambiarVisibilidad();
                }}
                title={oculto ? "Mostrar en app" : "Ocultar de app"}
                aria-label={`${oculto ? "Mostrar en app" : "Ocultar de app"}: ${event.nombre}`}
                className={`p-1 rounded text-gray-400 transition-colors ${
                  oculto
                    ? "hover:text-green-600 hover:bg-green-50"
                    : "hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                {oculto ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {onEditar && (
              <button
                type="button"
                // Un clic edita; arrastrar el ticket sigue moviéndolo de feria
                draggable={false}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar();
                }}
                title="Editar evento"
                aria-label={`Editar ${event.nombre}`}
                className="p-1 rounded text-gray-400 hover:text-[#097EEC] hover:bg-[#097EEC]/5 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1 flex-wrap">
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${ESTADO_CONFIG[event.estado].color}`}
        >
          {ESTADO_CONFIG[event.estado].label}
        </span>
        {tipo && (
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-white flex items-center gap-1 ${tipo.color}`}
          >
            <tipo.icon className="h-2.5 w-2.5" /> {tipo.label}
          </span>
        )}
        {oculto && (
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
};

export default EventKanbanTicket;
