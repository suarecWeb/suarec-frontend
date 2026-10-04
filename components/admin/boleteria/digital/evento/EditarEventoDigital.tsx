"use client";

import Link from "next/link";
import EventsService from "@/services/EventsService";
import { Evento, EventoModalidad } from "@/interfaces/event.interface";
import { useCarga } from "../../palcos/usePalcosEventos";
import { Cargando, ErrorCarga } from "../../palcos/EstadoCarga";
import MarcoPaginaEvento from "./MarcoPaginaEvento";
import FormularioEventoDigital from "./FormularioEventoDigital";

// "Editar evento": pide el evento al backend, muestra "Cargando…" o el
// error y, si es digital, abre el formulario con sus datos. Los eventos
// físicos se siguen editando en su ventana de Boletería física
export default function EditarEventoDigital({
  eventoId,
  volver,
}: {
  eventoId: number;
  volver: string;
}) {
  const { carga, reintentar } = useCarga<Evento>(
    () => EventsService.getEventById(eventoId),
    "No se pudo cargar el evento",
    eventoId,
  );

  const evento = carga.estado === "listo" ? carga.datos : null;
  const esFisico = evento?.modalidad === EventoModalidad.FISICO;

  // El formulario trae su propio marco (con los botones en la barra)
  if (evento && !esFisico)
    return (
      <FormularioEventoDigital
        evento={evento}
        titulo={`Editar evento: ${evento.nombre}`}
        volver={volver}
      />
    );

  return (
    <MarcoPaginaEvento
      titulo={evento ? `Editar evento: ${evento.nombre}` : "Editar evento"}
      volver={volver}
    >
      {carga.estado === "cargando" && <Cargando texto="Cargando evento..." />}
      {carga.estado === "error" && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <ErrorCarga
            mensaje={carga.mensaje}
            onReintentar={carga.noEncontrado ? undefined : reintentar}
          />
        </div>
      )}
      {esFisico && (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <p className="text-sm text-gray-700">
            Este evento es de boletería física: se edita desde Boletería física.
          </p>
          <Link
            href="/admin/boleteria/fisica"
            className="mt-3 inline-block text-sm font-medium text-[#097EEC] hover:underline"
          >
            Ir a Boletería física
          </Link>
        </div>
      )}
    </MarcoPaginaEvento>
  );
}
