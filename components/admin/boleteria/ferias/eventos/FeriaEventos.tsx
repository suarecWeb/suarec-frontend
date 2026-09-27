"use client";

import { useState } from "react";
import { Edit, CalendarDays } from "lucide-react";
import { Evento, CreateEventoDto } from "@/interfaces/event.interface";
import EventFlipCard from "./EventFlipCard";
import EditEventModal from "./EditEventModal";
import EventsService from "@/services/EventsService";

interface FeriaEventosProps {
  eventos: Evento[];
}

// Eventos de una feria. Antes vivian al final de "Editar feria"; ahora son
// su propia pagina (/admin/boleteria/ferias/[feriaId]/eventos)
export default function FeriaEventos({ eventos }: FeriaEventosProps) {
  const [eventosAsignados, setEventosAsignados] = useState<Evento[]>(eventos);
  const [eventoToEdit, setEventoToEdit] = useState<Evento | null>(null);

  const handleEditEvento = async (
    id: number,
    dto: Partial<CreateEventoDto>,
    imageFile?: File,
  ) => {
    await EventsService.updateEvent(String(id), dto, imageFile);
    const updated = await EventsService.getEventById(id);
    setEventosAsignados((prev) =>
      prev.map((e) => (e.id === id ? updated.data : e)),
    );
  };

  if (eventosAsignados.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
          <CalendarDays className="h-9 w-9 text-gray-300" />
        </div>
        <h3 className="text-base font-semibold text-gray-700">
          Esta feria no tiene eventos todavía
        </h3>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Eventos asignados ({eventosAsignados.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventosAsignados.map((evento) => (
          <div
            key={evento.id}
            className="opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]"
          >
            <EventFlipCard
              event={evento}
              actions={
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventoToEdit(evento);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all font-medium"
                  title="Editar evento"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
              }
            />
          </div>
        ))}
      </div>

      {eventoToEdit && (
        <EditEventModal
          event={eventoToEdit}
          onClose={() => setEventoToEdit(null)}
          onSubmit={handleEditEvento}
        />
      )}
    </>
  );
}
