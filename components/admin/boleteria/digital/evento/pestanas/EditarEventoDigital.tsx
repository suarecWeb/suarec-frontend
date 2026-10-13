"use client";

import Link from "next/link";
import { EventoModalidad } from "@/interfaces/event.interface";
import { Cargando, ErrorCarga } from "../../palcos/EstadoCarga";
import FormularioEventoDigital from "../FormularioEventoDigital";
import { useLayoutEvento } from "../layout/LayoutEvento";

// Pestaña "Datos y precios". El evento lo pide el layout (LayoutEvento)
// y la barra es suya; aquí van "Cargando…", el error o, si es digital, el
// formulario con sus datos. Los físicos se siguen editando en su ventana
// de Boletería física
export default function EditarEventoDigital() {
  const { carga, reintentar, volver } = useLayoutEvento();

  if (carga.estado === "cargando")
    return <Cargando texto="Cargando evento..." />;
  if (carga.estado === "error")
    return (
      <div className="bg-white rounded-2xl border border-gray-100">
        <ErrorCarga
          mensaje={carga.mensaje}
          onReintentar={carga.noEncontrado ? undefined : reintentar}
        />
      </div>
    );

  const evento = carga.datos;
  if (evento.modalidad === EventoModalidad.FISICO)
    return (
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
    );

  return (
    <FormularioEventoDigital
      evento={evento}
      titulo={`Editar evento: ${evento.nombre}`}
      volver={volver}
    />
  );
}
