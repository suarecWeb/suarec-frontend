"use client";

import { useState, useEffect } from "react";
import { Feria, CreateFeriaDto } from "@/interfaces/feria.interface";
import {
  CreateEventoDto,
  Evento,
  EventoModalidad,
} from "@/interfaces/event.interface";
import FeriasService from "@/services/FeriasService";
import EventsService from "@/services/EventsService";
import CreateFeriaModal from "@/components/admin/boleteria/ferias/CreateFeriaModal";
import CreateEventModal from "@/components/admin/boleteria/ferias/eventos/CreateEventModal";
import FeriaKanbanColumn from "@/components/admin/boleteria/ferias/FeriaKanbanColumn";
import { CalendarDays, PlusCircle, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface FeriasManagementProps {
  // Mismo patrón que EventsManagement: si se define, solo se listan ferias
  // que tengan al menos un evento de esa modalidad, y el conteo/resumen de
  // la card (frente y reverso) se calcula solo sobre esos eventos -- una
  // feria puede tener eventos mixtos (ej. GENERAL digital + VIP física),
  // pero cada módulo solo debe ver "su" parte.
  filtroModalidad?: EventoModalidad;
  // Pasa a CreateEventModal para que "Crear evento" desde Ferias cree el
  // tipo de evento correcto según el módulo (digital vs física).
  modoFisico?: boolean;
}

const FeriasManagement = ({
  filtroModalidad,
  modoFisico = false,
}: FeriasManagementProps = {}) => {
  const [ferias, setFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  // Por defecto solo se ven las ferias activas (visible=true) -- las
  // auto-generadas 1:1 por la migración 060 heredaron visible=false del
  // evento y quedan afuera hasta que el admin las organice y las active.
  const [showHidden, setShowHidden] = useState(false);

  // Editar feria es su propia página (/admin/boleteria/ferias/[feriaId])
  // -- solo Crear feria/evento bloquean el scroll de fondo.
  const isAnyCreateModalOpen = showCreateModal || showCreateEventModal;
  useEffect(() => {
    document.body.style.overflow = isAnyCreateModalOpen ? "hidden" : "";
    document.documentElement.style.overflow = isAnyCreateModalOpen
      ? "hidden"
      : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isAnyCreateModalOpen]);

  useEffect(() => {
    FeriasService.getAllFeriasAdmin()
      .then((res) => setFerias(res.data))
      .catch(() => toast.error("Error al cargar las ferias"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (
    dto: CreateFeriaDto,
    imageFile?: File,
  ): Promise<Feria> => {
    const res = await FeriasService.createFeria(dto, imageFile);
    setFerias((prev) => [{ ...res.data, eventos: [] }, ...prev]);
    toast.success("Feria creada correctamente");
    return res.data;
  };

  // Tras crear la feria, CreateFeriaModal ya asignó los eventos elegidos
  // (drag-and-drop) directo con la API -- solo hace falta refrescar esa
  // feria en la lista para que se vea con sus eventos ya adentro.
  const handleEventosAsignados = (feriaActualizada: Feria) => {
    setFerias((prev) =>
      prev.map((f) => (f.id === feriaActualizada.id ? feriaActualizada : f)),
    );
  };

  const handleCreateEvento = async (
    dto: CreateEventoDto,
    imageFile?: File,
    codigosACrear?: number,
  ) => {
    const res = await EventsService.createEvent(dto, imageFile);
    toast.success("Evento creado correctamente");
    if (res.data.id && codigosACrear && codigosACrear > 0) {
      try {
        const codigosRes = await EventsService.generarCodigosRegalo(
          res.data.id,
          codigosACrear,
        );
        toast.success(
          `Se generaron ${codigosRes.data.cantidad} códigos de regalo`,
        );
      } catch {
        toast.error(
          "El evento se guardó, pero falló la generación de códigos. Puedes reintentar desde Editar.",
        );
      }
    }
  };

  const handleToggleVisibility = async (feria: Feria) => {
    const newVisible = feria.visible === false ? true : false;
    try {
      await FeriasService.setVisibility(feria.id, newVisible);
      setFerias((prev) =>
        prev.map((f) =>
          f.id === feria.id ? { ...f, visible: newVisible } : f,
        ),
      );
      toast.success(
        newVisible ? "Feria visible en la app" : "Feria oculta de la app",
      );
    } catch {
      toast.error("Error al cambiar visibilidad de la feria");
    }
  };

  // Eventos de una feria que le corresponden a este módulo (todos si no hay
  // filtro de modalidad).
  const eventosDelModulo = (feria: Feria): Evento[] =>
    filtroModalidad
      ? (feria.eventos ?? []).filter((e) => e.modalidad === filtroModalidad)
      : (feria.eventos ?? []);

  // Soltar un evento arrastrado sobre una columna: reasigna su feria.
  // Reusa el mismo endpoint de asignación en bloque que ya usa
  // CreateFeriaModal (PATCH /ferias/:id/eventos), con un solo id -- el
  // backend solo hace un UPDATE de feriaId, ya es "mover" de por sí (un
  // evento no puede tener dos ferias a la vez).
  const handleDropEvento = async (eventoId: number, feriaDestinoId: number) => {
    const feriaOrigen = ferias.find((f) =>
      (f.eventos ?? []).some((e) => e.id === eventoId),
    );
    if (feriaOrigen?.id === feriaDestinoId) return; // soltado en su propia columna

    const evento = feriaOrigen?.eventos?.find((e) => e.id === eventoId);
    if (!evento) return;

    // Optimista: se mueve en pantalla antes de que responda el backend: la
    // interacción de arrastrar se siente lenta si hay que esperar al
    // request para ver el resultado.
    setFerias((prev) =>
      prev.map((f) => {
        if (f.id === feriaOrigen?.id) {
          return {
            ...f,
            eventos: (f.eventos ?? []).filter((e) => e.id !== eventoId),
          };
        }
        if (f.id === feriaDestinoId) {
          return {
            ...f,
            eventos: [
              ...(f.eventos ?? []),
              { ...evento, feriaId: feriaDestinoId },
            ],
          };
        }
        return f;
      }),
    );

    try {
      await FeriasService.asignarEventos(feriaDestinoId, [eventoId]);
      toast.success("Evento reasignado");
    } catch {
      toast.error("No se pudo reasignar el evento");
      // Revierte el optimista si el backend rechazó el cambio
      setFerias((prev) =>
        prev.map((f) => {
          if (f.id === feriaDestinoId) {
            return {
              ...f,
              eventos: (f.eventos ?? []).filter((e) => e.id !== eventoId),
            };
          }
          if (f.id === feriaOrigen?.id) {
            return { ...f, eventos: [...(f.eventos ?? []), evento] };
          }
          return f;
        }),
      );
    }
  };

  const feriasDelModulo = filtroModalidad
    ? ferias.filter((f) => eventosDelModulo(f).length > 0)
    : ferias;

  const feriasOcultas = feriasDelModulo.filter((f) => f.visible === false);
  const feriasVisibles = feriasDelModulo.filter((f) => f.visible !== false);
  const feriasMostradas = showHidden ? feriasDelModulo : feriasVisibles;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-700">
          Ferias ({feriasMostradas.length})
        </h2>
        <div className="flex items-center gap-3">
          {feriasOcultas.length > 0 && (
            <button
              onClick={() => setShowHidden((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              {showHidden ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {showHidden
                ? "Ocultar no organizadas"
                : `Mostrar no organizadas (${feriasOcultas.length})`}
            </button>
          )}
          <div className="flex flex-col items-stretch gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all font-medium shadow-sm shadow-emerald-100"
            >
              <PlusCircle className="h-4 w-4" />
              Crear feria
            </button>
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#097EEC] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0562C7] active:scale-[0.98] transition-all font-medium shadow-sm shadow-blue-100"
            >
              <PlusCircle className="h-4 w-4" />
              Crear evento
            </button>
          </div>
        </div>
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
              </div>
            </div>
          ))}
        </div>
      ) : feriasMostradas.length === 0 ? (
        <div className="py-20 text-center">
          <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
            <CalendarDays className="h-9 w-9 text-gray-300" />
          </div>

          <h3 className="text-base font-semibold text-gray-700">
            {feriasDelModulo.length === 0
              ? "No hay ferias todavía"
              : "No hay ferias organizadas todavía"}
          </h3>

          <p className="mt-1.5 text-sm text-gray-400">
            {feriasDelModulo.length === 0
              ? "Crea la primera feria para agrupar eventos bajo ella."
              : `Hay ${feriasOcultas.length} sin organizar -- usa "Mostrar no organizadas" arriba para verlas y activarlas.`}
          </p>

          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-600 hover:underline font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            Crear feria
          </button>
        </div>
      ) : (
        // Tablero tipo Jira: una columna por feria, scroll horizontal. Cada
        // columna es su propia zona de drop (drag-and-drop nativo, mismo
        // mecanismo que ya usa CreateFeriaModal/EventosParaAsignar).
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
          {feriasMostradas.map((feria, i) => (
            <div
              key={feria.id}
              className="opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <FeriaKanbanColumn
                feria={feria}
                eventos={eventosDelModulo(feria)}
                onToggleVisibility={handleToggleVisibility}
                onDropEvento={handleDropEvento}
              />
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateFeriaModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
          onEventosAsignados={handleEventosAsignados}
        />
      )}

      {showCreateEventModal && (
        <CreateEventModal
          modoFisico={modoFisico}
          onClose={() => setShowCreateEventModal(false)}
          onSubmit={handleCreateEvento}
        />
      )}
    </>
  );
};

export default FeriasManagement;
