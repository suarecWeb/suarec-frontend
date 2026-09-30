"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Shapes } from "lucide-react";
import { Recinto, CreateRecintoDto } from "@/interfaces/recinto.interface";

// Mismos limites que valida el backend (CreateRecintoDto)
const LIENZO_MINIMO = 100;
const LIENZO_POR_DEFECTO = 1000;

interface RecintoFormModalProps {
  // Sin recinto: crear. Con recinto: editar sus datos
  recinto?: Recinto;
  onClose: () => void;
  onSubmit: (dto: CreateRecintoDto) => Promise<void>;
}

interface FormState {
  nombre: string;
  descripcion: string;
  lienzoAncho: string;
  lienzoAlto: string;
}

type FormErrors = Partial<Record<keyof FormState | "_server", string>>;

export default function RecintoFormModal({
  recinto,
  onClose,
  onSubmit,
}: RecintoFormModalProps) {
  const esEdicion = !!recinto;
  const [form, setForm] = useState<FormState>({
    nombre: recinto?.nombre ?? "",
    descripcion: recinto?.descripcion ?? "",
    lienzoAncho: String(recinto?.lienzoAncho ?? LIENZO_POR_DEFECTO),
    lienzoAlto: String(recinto?.lienzoAlto ?? LIENZO_POR_DEFECTO),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [enviando, setEnviando] = useState(false);

  const validarLienzo = (valor: string): string | undefined => {
    const n = Number(valor);
    if (!Number.isInteger(n)) return "Debe ser un número entero";
    if (n < LIENZO_MINIMO) return `Mínimo ${LIENZO_MINIMO}`;
    return undefined;
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    const nombre = form.nombre.trim();

    if (!nombre) next.nombre = "El nombre es obligatorio";
    else if (nombre.length > 150)
      next.nombre = "El nombre no puede superar 150 caracteres";

    if (form.descripcion.length > 2000)
      next.descripcion = "La descripción no puede superar 2000 caracteres";

    next.lienzoAncho = validarLienzo(form.lienzoAncho);
    next.lienzoAlto = validarLienzo(form.lienzoAlto);

    const conError = Object.fromEntries(
      Object.entries(next).filter(([, v]) => v),
    ) as FormErrors;
    setErrors(conError);
    return Object.keys(conError).length === 0;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setEnviando(true);
    try {
      const descripcion = form.descripcion.trim();
      await onSubmit({
        nombre: form.nombre.trim(),
        // Al crear, sin descripcion no se envia; al editar, "" la borra
        ...(descripcion || esEdicion ? { descripcion } : {}),
        lienzoAncho: Number(form.lienzoAncho),
        lienzoAlto: Number(form.lienzoAlto),
      });
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrors((prev) => ({
        ...prev,
        _server: Array.isArray(msg)
          ? msg.join(", ")
          : typeof msg === "string"
            ? msg
            : "No se pudo guardar el recinto",
      }));
    } finally {
      setEnviando(false);
    }
  };

  const inputClass = (conError?: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${
      conError
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50 focus:bg-white"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* No cierra al hacer clic afuera: es un formulario y un clic
          accidental borraria lo que se lleno */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shapes className="h-5 w-5 text-[#097EEC]" />
            <h3 className="text-lg font-semibold text-gray-800">
              {esEdicion ? "Editar recinto" : "Crear recinto"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {errors._server && (
            <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errors._server}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nombre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Ej: Estadio Metropolitano"
              className={inputClass(errors.nombre)}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              rows={3}
              className={`${inputClass(errors.descripcion)} resize-none`}
            />
            {errors.descripcion && (
              <p className="mt-1 text-xs text-red-500">{errors.descripcion}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tamaño del lienzo (ancho × alto)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  min={LIENZO_MINIMO}
                  step={1}
                  value={form.lienzoAncho}
                  onChange={(e) => handleChange("lienzoAncho", e.target.value)}
                  className={inputClass(errors.lienzoAncho)}
                />
                {errors.lienzoAncho && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.lienzoAncho}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  min={LIENZO_MINIMO}
                  step={1}
                  value={form.lienzoAlto}
                  onChange={(e) => handleChange("lienzoAlto", e.target.value)}
                  className={inputClass(errors.lienzoAlto)}
                />
                {errors.lienzoAlto && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.lienzoAlto}
                  </p>
                )}
              </div>
            </div>
            {/* PEN-25: unidades logicas, el dibujo se escala a cada pantalla */}
            <p className="mt-1 text-[11px] text-gray-400">
              Unidades del dibujo, no píxeles: se ajusta a cada pantalla.
              {esEdicion &&
                " Si lo achicas, las figuras que queden por fuera no se mueven solas."}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {enviando
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear recinto"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
