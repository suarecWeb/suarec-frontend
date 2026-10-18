"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, MailPlus, Users } from "lucide-react";
import toast from "react-hot-toast";
import EmailTemplatesService from "@/services/EmailTemplatesService";
import EmailTemplateEditor from "./EmailTemplateEditor";
import { CupoHoy, EmailTemplate } from "@/interfaces/email-template.interface";

// Gestor de plantillas de correo (roadmap email-templates-campanas.txt):
// lista a la izquierda, editor con preview a la derecha, cupo del día
// visible arriba (UC-6: el admin ve el cupo ANTES de confirmar un envío).
const EmailTemplatesManagement = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [seleccionada, setSeleccionada] = useState<EmailTemplate | null>(null);
  const [cupo, setCupo] = useState<CupoHoy | null>(null);
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando] = useState(false);

  const cargarCupo = useCallback(async () => {
    try {
      const { data } = await EmailTemplatesService.getCupoHoy();
      setCupo(data);
    } catch {
      setCupo(null);
    }
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const { data } = await EmailTemplatesService.getTemplates();
      setTemplates(data);
      setSeleccionada((prev) =>
        prev
          ? (data.find((t) => t.id === prev.id) ?? data[0] ?? null)
          : (data[0] ?? null),
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "No se pudieron cargar las plantillas",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
    void cargarCupo();
  }, [cargar, cargarCupo]);

  // Si se eliminaron todas, crea una base editable sin depender del seed.
  const crearPlantilla = async () => {
    if (creando) return;
    setCreando(true);
    const base = templates[0];
    try {
      const { data } = base
        ? await EmailTemplatesService.duplicateTemplate(base.id)
        : await EmailTemplatesService.createTemplate({
            nombre: "Nueva plantilla",
            asunto: "Asunto del correo",
            titulo: "Título del correo",
            cuerpo: "Escribe aquí el contenido de tu correo.",
          });
      toast.success(`Plantilla "${data.nombre}" creada`);
      await cargar();
      setSeleccionada(data);
    } catch {
      toast.error("No se pudo crear la plantilla");
    } finally {
      setCreando(false);
    }
  };

  const duplicar = async (id: number) => {
    try {
      const { data } = await EmailTemplatesService.duplicateTemplate(id);
      toast.success(`Plantilla "${data.nombre}" creada`);
      await cargar();
      setSeleccionada(data);
    } catch {
      toast.error("No se pudo duplicar");
    }
  };

  const onSaved = (actualizada: EmailTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === actualizada.id ? actualizada : t)),
    );
    setSeleccionada(actualizada);
  };

  const onDeleted = (id: number) => {
    setTemplates((prev) => {
      const restantes = prev.filter((t) => t.id !== id);
      setSeleccionada(restantes[0] ?? null);
      return restantes;
    });
  };

  if (cargando) {
    return (
      <p className="text-sm text-gray-400 text-center py-16">
        Cargando plantillas...
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Cupo del día (UC-6). Las pruebas a colegas NO consumen cupo
          (por eso tras una prueba "usados" no cambia — es por diseño) */}
      {cupo && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <Users className="h-4 w-4 text-[#097EEC] flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Cupo de hoy:{" "}
            <span className="font-bold text-[#097EEC]">{cupo.restantes}</span>{" "}
            envíos restantes de {cupo.tope} ({cupo.usados} usados)
            <span className="block text-xs text-gray-400 mt-0.5">
              Las pruebas a colegas no consumen cupo — solo las campañas a todos
              los usuarios
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Lista de plantillas */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={crearPlantilla}
            disabled={creando}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#097EEC] hover:bg-[#0770d4] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <MailPlus className="h-4 w-4" />
            {creando ? "Creando plantilla..." : "Nueva plantilla"}
          </button>

          {templates.map((t) => (
            <div
              key={t.id}
              className={`group rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                seleccionada?.id === t.id
                  ? "border-[#097EEC] bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => setSeleccionada(t)}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {t.nombre}
                </p>
                <button
                  type="button"
                  title="Duplicar"
                  onClick={(e) => {
                    e.stopPropagation();
                    void duplicar(t.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#097EEC] transition-all"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 truncate">{t.asunto}</p>
            </div>
          ))}

          {templates.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">
              No hay plantillas todavía. Pulsa “Nueva plantilla” para crear la
              primera.
            </p>
          )}
        </div>

        {/* Editor + preview */}
        {seleccionada ? (
          <EmailTemplateEditor
            template={seleccionada}
            cupo={cupo}
            onSaved={onSaved}
            onDeleted={onDeleted}
            onCupoChange={cargarCupo}
          />
        ) : (
          <p className="text-sm text-gray-400 text-center py-16">
            Selecciona o crea una plantilla para editarla
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailTemplatesManagement;
