"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Save, Send, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import EmailTemplatesService from "@/services/EmailTemplatesService";
import {
  CupoHoy,
  EmailTemplate,
  UpdateEmailTemplateDto,
} from "@/interfaces/email-template.interface";

// Editor por bloques de la plantilla de correo (roadmap
// email-templates-campanas.txt, UC-2/UC-3, ADR-2). El preview sale del
// MISMO generador del backend (GET .../preview) — muestra la última
// versión GUARDADA; por eso hay que guardar para refrescarlo.

interface Props {
  template: EmailTemplate;
  cupo: CupoHoy | null;
  onSaved: (template: EmailTemplate) => void;
  onDeleted: (id: number) => void;
  onCupoChange: () => void;
}

const EmailTemplateEditor = ({
  template,
  cupo,
  onSaved,
  onDeleted,
  onCupoChange,
}: Props) => {
  const [form, setForm] = useState<UpdateEmailTemplateDto>({});
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [guardando, setGuardando] = useState(false);
  const [enviando, setEnviando] = useState<"prueba" | "todos" | null>(null);
  // Confirmación en dos pasos para los envíos (sin modal aparte)
  const [confirmando, setConfirmando] = useState<"prueba" | "todos" | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cuando cambia la plantilla seleccionada, carga su preview guardado
  const cargarPreview = useCallback(async (id: number) => {
    try {
      const { data } = await EmailTemplatesService.getPreviewHtml(id);
      setPreviewHtml(data.html);
    } catch {
      setPreviewHtml("");
    }
  }, []);

  useEffect(() => {
    setForm({
      nombre: template.nombre,
      asunto: template.asunto,
      titulo: template.titulo,
      cuerpo: template.cuerpo,
      ctaTexto: template.ctaTexto ?? "",
      ctaUrl: template.ctaUrl ?? "",
    });
    setConfirmando(null);
    void cargarPreview(template.id);
  }, [template.id, cargarPreview]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (campo: keyof UpdateEmailTemplateDto, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardar = async () => {
    setGuardando(true);
    try {
      const dto: UpdateEmailTemplateDto = {
        nombre: form.nombre,
        asunto: form.asunto,
        titulo: form.titulo,
        cuerpo: form.cuerpo,
        ctaTexto: form.ctaTexto || null,
        ctaUrl: form.ctaUrl || null,
      };
      const { data } = await EmailTemplatesService.updateTemplate(
        template.id,
        dto,
      );
      onSaved(data);
      await cargarPreview(template.id);
      toast.success("Plantilla guardada");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const subirImagen = async (file: File) => {
    try {
      const { data } = await EmailTemplatesService.uploadImagen(
        template.id,
        file,
      );
      onSaved(data);
      await cargarPreview(template.id);
      toast.success("Imagen actualizada");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "No se pudo subir la imagen");
    }
  };

  const quitarImagen = async () => {
    try {
      const { data } = await EmailTemplatesService.updateTemplate(template.id, {
        imagenUrl: null,
      });
      onSaved(data);
      await cargarPreview(template.id);
      toast.success("Imagen quitada");
    } catch {
      toast.error("No se pudo quitar la imagen");
    }
  };

  const eliminar = async () => {
    try {
      await EmailTemplatesService.deleteTemplate(template.id);
      onDeleted(template.id);
      toast.success("Plantilla eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  const enviar = async (tipo: "prueba" | "todos") => {
    setEnviando(tipo);
    try {
      const { data } =
        tipo === "prueba"
          ? await EmailTemplatesService.enviarPruebaColegas(template.id)
          : await EmailTemplatesService.enviarCampana(template.id);
      toast.success(
        `Envío terminado: ${data.enviados} enviados, ${data.fallidos} fallidos de ${data.destinatariosTotal}`,
      );
      onCupoChange();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "No se pudo enviar");
    } finally {
      setEnviando(null);
      setConfirmando(null);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC]/40 focus:border-[#097EEC]";
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* ─── Bloques editables ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Nombre interno (solo admin)</label>
          <input
            className={inputCls}
            value={form.nombre ?? ""}
            onChange={(e) => set("nombre", e.target.value)}
            maxLength={120}
          />
        </div>
        <div>
          <label className={labelCls}>Asunto del correo</label>
          <input
            className={inputCls}
            value={form.asunto ?? ""}
            onChange={(e) => set("asunto", e.target.value)}
            maxLength={150}
          />
        </div>
        <div>
          <label className={labelCls}>Título visible en el correo</label>
          <input
            className={inputCls}
            value={form.titulo ?? ""}
            onChange={(e) => set("titulo", e.target.value)}
            maxLength={150}
          />
        </div>
        <div>
          <label className={labelCls}>
            Cuerpo (párrafos separados por línea en blanco)
          </label>
          <textarea
            className={`${inputCls} min-h-[160px] resize-y`}
            value={form.cuerpo ?? ""}
            onChange={(e) => set("cuerpo", e.target.value)}
            maxLength={5000}
          />
        </div>

        {/* Imagen única (UC-3) */}
        <div>
          <label className={labelCls}>
            Imagen del correo (opcional, 1 máx.)
          </label>
          <div className="flex items-center gap-3">
            {template.imagenUrl && (
              <img
                src={template.imagenUrl}
                alt="Imagen del correo"
                className="h-16 w-24 object-cover rounded-lg border border-gray-200"
              />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors"
            >
              <ImagePlus className="h-4 w-4" />
              {template.imagenUrl ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {template.imagenUrl && (
              <button
                type="button"
                onClick={quitarImagen}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Quitar
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void subirImagen(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Botón CTA opcional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Texto del botón (opcional)</label>
            <input
              className={inputCls}
              value={form.ctaTexto ?? ""}
              onChange={(e) => set("ctaTexto", e.target.value)}
              placeholder="Ver evento"
              maxLength={60}
            />
          </div>
          <div>
            <label className={labelCls}>URL del botón (https)</label>
            <input
              className={inputCls}
              value={form.ctaUrl ?? ""}
              onChange={(e) => set("ctaUrl", e.target.value)}
              placeholder="https://suarec.com/eventos/12"
              maxLength={500}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#097EEC] hover:bg-[#0770d4] text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {guardando ? "Guardando..." : "Guardar"}
          </button>

          {/* BORRAR-EN-PROD: botón de prueba a los 5 colegas (UC-4) — se
              elimina al pasar a producción junto con el endpoint /prueba */}
          {confirmando === "prueba" ? (
            <button
              type="button"
              onClick={() => void enviar("prueba")}
              disabled={enviando !== null}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold animate-pulse"
            >
              <Send className="h-4 w-4" />
              {enviando === "prueba"
                ? "Enviando..."
                : "¿Seguro? Confirmar prueba"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando("prueba")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 text-sm font-semibold transition-colors"
            >
              <Send className="h-4 w-4" />
              Enviar prueba al equipo
            </button>
          )}

          {confirmando === "todos" ? (
            <button
              type="button"
              onClick={() => void enviar("todos")}
              disabled={enviando !== null}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold animate-pulse"
            >
              <Users className="h-4 w-4" />
              {enviando === "todos"
                ? "Enviando campaña..."
                : `¿Seguro? Enviar a todos (${cupo?.restantes ?? "?"} cupo hoy)`}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando("todos")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold transition-colors"
            >
              <Users className="h-4 w-4" />
              Enviar a todos
            </button>
          )}

          <button
            type="button"
            onClick={eliminar}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>

      {/* ─── Preview: HTML real del backend (última versión guardada) ──── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">
            Vista previa (última versión guardada)
          </p>
          <button
            type="button"
            onClick={() => void cargarPreview(template.id)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#097EEC] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </button>
        </div>
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-[#f1f5f9]">
          {previewHtml ? (
            <iframe
              title="Vista previa del correo"
              srcDoc={previewHtml}
              sandbox=""
              className="w-full h-[520px] bg-[#f1f5f9]"
            />
          ) : (
            <p className="text-sm text-gray-400 text-center py-20">
              Guarda la plantilla para ver el preview
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
