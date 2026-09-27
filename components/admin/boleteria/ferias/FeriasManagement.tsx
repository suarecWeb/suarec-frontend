"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  CalendarDays,
  PlusCircle,
  EyeOff,
  Eye,
  Ticket,
  Smartphone,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatDisplayDate } from "@/lib/TimeZone";
import FlipCard from "@/components/FlipCard";

const MODALIDAD_LABEL: Record<EventoModalidad, string> = {
  [EventoModalidad.DIGITAL]: "Boletas digitales",
  [EventoModalidad.FISICO]: "Boletas físicas",
};

// Agrupa los eventos asignados a una feria por modalidad (digital/física) --
// en el reverso de la card se muestra el tipo de boleta, no cada evento.
const agruparPorModalidad = (eventos: Evento[] = []) => {
  const counts = eventos.reduce<Record<string, number>>((acc, evento) => {
    const key = evento.modalidad ?? EventoModalidad.DIGITAL;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts) as [EventoModalidad, number][];
};

const FeriasManagement = () => {
  const router = useRouter();
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

  const handleCreate = async (dto: CreateFeriaDto, imageFile?: File) => {
    const res = await FeriasService.createFeria(dto, imageFile);
    setFerias((prev) => [{ ...res.data, eventos: [] }, ...prev]);
    toast.success("Feria creada correctamente");
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

  const feriasOcultas = ferias.filter((f) => f.visible === false);
  const feriasVisibles = ferias.filter((f) => f.visible !== false);
  const feriasMostradas = showHidden ? ferias : feriasVisibles;

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
            {ferias.length === 0
              ? "No hay ferias todavía"
              : "No hay ferias organizadas todavía"}
          </h3>

          <p className="mt-1.5 text-sm text-gray-400">
            {ferias.length === 0
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feriasMostradas.map((feria, i) => (
            <div
              key={feria.id}
              className="opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <FlipCard
                ariaLabel={`Feria ${feria.nombre}`}
                width={2000}
                height={360}
                radius={12}
                background="#ffffff"
                color="#111827"
                shadowColor="#059669"
                shadowOpacity={0.25}
                tiltMax={6}
                glareOpacity={0.12}
                hoverScale={1.01}
                draggable={false}
                front={
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-emerald-500/25 flex items-center justify-center relative">
                    {feria.imagenUrl ? (
                      <img
                        src={feria.imagenUrl}
                        alt={feria.nombre}
                        className={`w-full h-full object-cover ${feria.visible === false ? "grayscale" : ""}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <CalendarDays className="h-10 w-10 text-emerald-500/40" />
                    )}

                    <span className="absolute top-2 left-2 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      FERIA
                    </span>

                    <div className="absolute top-2 right-2 flex gap-1">
                      {feria.visible === false && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800/70 text-white flex items-center gap-1">
                          <EyeOff className="h-3 w-3" /> Oculta
                        </span>
                      )}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-emerald-700 flex items-center gap-1">
                        <Ticket className="h-3 w-3" />
                        {feria.eventos?.length ?? 0} evento
                        {feria.eventos?.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-2.5">
                      <p className="text-sm font-semibold text-white truncate">
                        {feria.nombre}
                      </p>
                      {feria.descripcion && (
                        <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                          {feria.descripcion}
                        </p>
                      )}
                      <p className="flex items-center gap-1 text-[10px] text-white/70 mt-1">
                        <CalendarDays className="h-3 w-3 flex-shrink-0" />
                        {formatDisplayDate(feria.fechaInicio)} —{" "}
                        {formatDisplayDate(feria.fechaFin)}
                      </p>
                    </div>
                  </div>
                }
                back={
                  <div className="w-full h-full bg-white flex flex-col p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
                        {feria.nombre}
                      </h3>
                      <div
                        className="flex items-center gap-1"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility(feria);
                          }}
                          title={
                            feria.visible === false
                              ? "Mostrar en app"
                              : "Ocultar de app"
                          }
                          className="flex-shrink-0 h-7 w-7 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          {feria.visible === false ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <span className="flex-shrink-0 h-7 w-7 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      {feria.eventos && feria.eventos.length > 0 ? (
                        agruparPorModalidad(feria.eventos).map(
                          ([modalidad, count]) => (
                            <div
                              key={modalidad}
                              className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100"
                            >
                              <span className="h-8 w-8 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                {modalidad === EventoModalidad.FISICO ? (
                                  <Ticket className="h-4 w-4" />
                                ) : (
                                  <Smartphone className="h-4 w-4" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-gray-800 truncate">
                                  {MODALIDAD_LABEL[modalidad]}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {count} evento{count === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <p className="text-xs text-gray-300 text-center py-6">
                          Sin eventos asignados
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/boleteria/ferias/${feria.id}`);
                      }}
                      className="mt-3 w-full py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      Editar feria
                    </button>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateFeriaModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onSubmit={handleCreateEvento}
        />
      )}
    </>
  );
};

export default FeriasManagement;
