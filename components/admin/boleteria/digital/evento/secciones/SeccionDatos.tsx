"use client";

import { EventoEstado } from "@/interfaces/event.interface";
import { FormularioEvento } from "../hooks/useFormularioEvento";
import ImagenEvento from "./ImagenEvento";
import Fila from "./Fila";
import { ESTADO_CONFIG, claseCampo, claseEtiqueta } from "../opciones";

// 1 · Datos del evento: imagen a la izquierda (con el formato debajo),
// nombre, estado, fecha, lugar y organizador a la derecha y la
// descripción a todo el ancho
export default function SeccionDatos({
  f,
  choqueFecha,
}: {
  f: FormularioEvento;
  // Otro PALCO de la feria ese día (PEN-10): se avisa junto a la fecha
  choqueFecha: string | null;
}) {
  const { form, cambiar, errores } = f;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="sm:w-48 flex-shrink-0">
          <ImagenEvento f={f} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <Fila
            id="evento-nombre"
            etiqueta="Nombre"
            obligatorio
            error={errores.nombre}
          >
            <input
              id="evento-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              placeholder="Nombre del evento"
              className={claseCampo(!!errores.nombre)}
            />
          </Fila>
          <Fila id="evento-estado" etiqueta="Estado">
            <select
              id="evento-estado"
              value={form.estado}
              onChange={(e) =>
                cambiar("estado", e.target.value as EventoEstado)
              }
              className={`px-3 py-2 text-xs font-semibold border rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 transition-all cursor-pointer ${ESTADO_CONFIG[form.estado!].color}`}
            >
              {Object.values(EventoEstado).map((e) => (
                <option key={e} value={e}>
                  {ESTADO_CONFIG[e].label}
                </option>
              ))}
            </select>
          </Fila>
          <Fila
            id="evento-fecha"
            etiqueta="Fecha"
            obligatorio
            error={errores.fechaEvento}
            aviso={f.esPalco ? choqueFecha : null}
          >
            <input
              id="evento-fecha"
              type="datetime-local"
              value={form.fechaEvento}
              onChange={(e) => cambiar("fechaEvento", e.target.value)}
              className={claseCampo(
                !!errores.fechaEvento || (f.esPalco && !!choqueFecha),
              )}
            />
          </Fila>
          <Fila
            id="evento-lugar"
            etiqueta="Lugar"
            obligatorio
            error={errores.ubicacion}
          >
            <input
              id="evento-lugar"
              type="text"
              value={form.ubicacion}
              onChange={(e) => cambiar("ubicacion", e.target.value)}
              placeholder="Ciudad o dirección"
              className={claseCampo(!!errores.ubicacion)}
            />
          </Fila>
          <Fila
            id="evento-organizador"
            etiqueta="Organizador"
            obligatorio
            error={errores.nombreOrganizador}
          >
            <input
              id="evento-organizador"
              type="text"
              value={form.nombreOrganizador ?? ""}
              onChange={(e) => cambiar("nombreOrganizador", e.target.value)}
              placeholder="Ej. Feria 53 Santander de Quilichao"
              className={claseCampo(!!errores.nombreOrganizador)}
            />
          </Fila>
        </div>
      </div>

      <div>
        <label htmlFor="evento-descripcion" className={claseEtiqueta}>
          Descripción
        </label>
        <textarea
          id="evento-descripcion"
          value={form.descripcion ?? ""}
          onChange={(e) => cambiar("descripcion", e.target.value)}
          placeholder="Describe el evento..."
          rows={3}
          className={`resize-none ${claseCampo(!!errores.descripcion)}`}
        />
        {errores.descripcion && (
          <p className="mt-1 text-xs text-red-500">{errores.descripcion}</p>
        )}
      </div>
    </div>
  );
}
