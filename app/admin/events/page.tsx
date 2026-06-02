"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import RoleGuard from "@/components/role-guard";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import {
  Evento,
  EventoEstado,
  CreateEventoDto,
} from "@/interfaces/event.interface";
import EventsService from "@/services/EventsService";
import CreateEventModal from "./CreateEventModal";
import DeleteEventModal from "./DeleteEventModal";
import EditEventModal from "./EditEventModal";
import {
  CalendarDays,
  PlusCircle,
  MapPin,
  Ticket,
  DollarSign,
  Trash2,
  Edit,
  Smartphone,
  Monitor,
} from "lucide-react";

import toast from "react-hot-toast";

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

const EventsPageContent = () => {
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Evento | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Evento | null>(null);

  const isAnyModalOpen = showCreateModal || !!eventToEdit || !!eventToDelete;

  useEffect(() => {
    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";
    document.documentElement.style.overflow = isAnyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isAnyModalOpen]);

  useEffect(() => {
    EventsService.getAllEvents()
      .then((res) => setEvents(res.data))
      .catch(() => toast.error("Error al cargar los eventos"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (dto: CreateEventoDto, imageFile?: File) => {
    const res = await EventsService.createEvent(dto, imageFile);
    setEvents((prev) => [res.data as unknown as Evento, ...prev]);
    toast.success("Evento creado correctamente");
  };

  const handleEdit = async (
    id: number,
    dto: Partial<CreateEventoDto>,
    imageFile?: File,
  ) => {
    await EventsService.updateEvent(String(id), dto, imageFile);
    const updated = await EventsService.getEventById(id);
    setEvents((prev) => prev.map((e) => (e.id === id ? updated.data : e)));
    toast.success("Evento actualizado");
  };

  const handleDelete = async (id: number) => {
    try {
      await EventsService.deleteEvent(String(id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success("Evento eliminado");
    } catch {
      toast.error("Error al eliminar el evento");
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Panel de eventos</h1>
            <p className="mt-2 text-blue-100">
              Gestiona todos los eventos de la plataforma
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4 flex">
          <div
            className="hidden md:flex flex-col gap-[24px] flex-shrink-0"
            style={{ width: panelWidth }}
          >
            <AdminSidePanel />
          </div>

          <div
            className="hidden md:flex items-center justify-center w-3 flex-shrink-0 cursor-col-resize group select-none"
            onMouseDown={onPanelDrag}
          >
            <div className="w-0.5 h-12 rounded-full bg-gray-200 group-hover:bg-[#097EEC] transition-colors duration-150" />
          </div>

          <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ml-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-700">
                Eventos ({events.length})
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-[#097EEC] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0562C7] active:scale-[0.98] transition-all font-medium shadow-sm shadow-blue-100"
              >
                <PlusCircle className="h-4 w-4" />
                Crear evento
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-100 rounded-xl overflow-hidden animate-pulse"
                  >
                    <div className="h-36 bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                      <div className="space-y-1.5 mt-3">
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-2/5" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="py-20 text-center">
                <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
                  <CalendarDays className="h-9 w-9 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-700">
                  No hay eventos todavía
                </h3>
                <p className="mt-1.5 text-sm text-gray-400">
                  Crea el primer evento para que aparezca en la app.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-[#097EEC] hover:underline font-medium"
                >
                  <PlusCircle className="h-4 w-4" />
                  Crear evento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event, i) => (
                  <div
                    key={event.id}
                    className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 group opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="h-36 bg-gradient-to-br from-[#097EEC]/10 to-[#097EEC]/20 flex items-center justify-center relative">
                      {event.imagenUrl ? (
                        <img
                          src={event.imagenUrl}
                          alt={event.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <CalendarDays className="h-10 w-10 text-[#097EEC]/40" />
                      )}
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${ESTADO_CONFIG[event.estado].color}`}
                      >
                        {ESTADO_CONFIG[event.estado].label}
                      </span>
                    </div>

                    <div className="p-4">
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
                          {new Date(event.fechaEvento).toLocaleString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="h-3 w-3 text-gray-300 flex-shrink-0" />
                          {event.ubicacion}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {event.aforoTotal && (
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
                                  {Number(event.precioBase).toLocaleString(
                                    "es-CO",
                                  )}{" "}
                                  <span className="text-gray-400">COP</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEventToEdit(event)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEventToDelete(event)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {eventToEdit && (
        <EditEventModal
          event={eventToEdit}
          onClose={() => setEventToEdit(null)}
          onSubmit={handleEdit}
        />
      )}

      {eventToDelete && (
        <DeleteEventModal
          event={eventToDelete}
          onClose={() => setEventToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

const EventsPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <EventsPageContent />
  </RoleGuard>
);

export default EventsPage;
