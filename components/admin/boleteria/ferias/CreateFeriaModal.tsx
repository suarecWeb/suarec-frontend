"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  CalendarDays,
  MapPin,
  FileText,
  Upload,
  Smartphone,
  Monitor,
} from "lucide-react";
import { CreateFeriaDto } from "@/interfaces/feria.interface";
import SelectorRecinto from "./SelectorRecinto";

interface CreateFeriaModalProps {
  onClose: () => void;
  onSubmit: (dto: CreateFeriaDto, imageFile?: File) => Promise<void>;
}

const EMPTY_FORM: CreateFeriaDto = {
  nombre: "",
  descripcion: "",
  fechaInicio: "",
  fechaFin: "",
  ubicacion: "",
  recintoId: null,
};

// Mismo catálogo de formatos que usan los eventos (tabla `format`) --
// las ferias no tienen boleta física, así que solo mobile/desktop aplican.
const FORMAT_OPTIONS: {
  id: number;
  label: string;
  resolution: string;
  ratio: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 1,
    label: "Móvil",
    resolution: "1080 × 1920 px",
    ratio: "aspect-[9/16]",
    icon: <Smartphone className="h-4 w-4" />,
  },
  {
    id: 2,
    label: "Web",
    resolution: "1280 × 720 px",
    ratio: "aspect-video",
    icon: <Monitor className="h-4 w-4" />,
  },
];

export default function CreateFeriaModal({
  onClose,
  onSubmit,
}: CreateFeriaModalProps) {
  const [form, setForm] = useState<CreateFeriaDto>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateFeriaDto, string>>
  >({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serverError = (errors as any)._server as string | undefined;

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!form.nombre.trim()) next.nombre = "El nombre es obligatorio";
    else if (form.nombre.trim().length < 3)
      next.nombre = "El nombre debe tener al menos 3 caracteres";
    else if (form.nombre.trim().length > 150)
      next.nombre = "El nombre no puede superar 150 caracteres";

    if (form.descripcion && form.descripcion.length > 2000)
      next.descripcion = "La descripción no puede superar 2000 caracteres";

    if (!form.fechaInicio)
      next.fechaInicio = "La fecha de inicio es obligatoria";
    if (!form.fechaFin) next.fechaFin = "La fecha de fin es obligatoria";

    if (form.fechaInicio && form.fechaFin) {
      const inicio = new Date(form.fechaInicio);
      const fin = new Date(form.fechaFin);
      if (fin < inicio)
        next.fechaFin = "La fecha de fin no puede ser anterior a la de inicio";
    }

    if (!form.ubicacion.trim()) next.ubicacion = "La ubicación es obligatoria";
    else if (form.ubicacion.trim().length > 200)
      next.ubicacion = "La ubicación no puede superar 200 caracteres";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field: keyof CreateFeriaDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const selectedFormat = FORMAT_OPTIONS.find((f) => f.id === form.formatId);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(form, imageFile ?? undefined);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        setErrors((prev) => ({ ...prev, _server: msg.join(", ") }) as any);
      } else if (typeof msg === "string") {
        setErrors((prev) => ({ ...prev, _server: msg }) as any);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#097EEC]" />
            <h2 className="text-base font-semibold text-gray-800">
              Crear feria
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {serverError && (
            <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr] gap-6">
            {/* Columna izquierda: datos de la feria -- panel propio, separado
              del panel derecho por el shell glassy del modal (gap-6) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              {/* Selector de formato */}
              <div className="flex gap-2 mb-1">
                {FORMAT_OPTIONS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, formatId: fmt.id }))
                    }
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                      form.formatId === fmt.id
                        ? "border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC]"
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {fmt.icon}
                    {fmt.label}
                  </button>
                ))}
              </div>
              {selectedFormat && (
                <p className="text-[11px] text-gray-400 text-center mb-2">
                  Resolución recomendada:{" "}
                  <span className="font-semibold text-gray-600">
                    {selectedFormat.resolution}
                  </span>
                </p>
              )}

              {imagePreview ? (
                <div
                  className={`relative rounded-xl overflow-hidden border border-gray-200 w-full ${selectedFormat?.ratio ?? "aspect-video"}`}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="create-feria-image-input"
                  className={`cursor-pointer border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#097EEC] hover:text-[#097EEC] transition-colors w-full ${selectedFormat?.ratio ?? "h-40"}`}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">
                    Haz clic para subir una imagen
                  </span>
                </label>
              )}
              <input
                id="create-feria-image-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Ej. Feria 53 de Santander de Quilichao"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.nombre ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                />
                {errors.nombre && (
                  <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <FileText className="h-3 w-3 inline mr-1" />
                  Descripción
                </label>
                <textarea
                  value={form.descripcion ?? ""}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  placeholder="Describe la feria..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none transition-all resize-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <CalendarDays className="h-3 w-3 inline mr-1" />
                    Fecha inicio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.fechaInicio}
                    onChange={(e) =>
                      handleChange("fechaInicio", e.target.value)
                    }
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.fechaInicio ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                  />
                  {errors.fechaInicio && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.fechaInicio}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <CalendarDays className="h-3 w-3 inline mr-1" />
                    Fecha fin <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.fechaFin}
                    onChange={(e) => handleChange("fechaFin", e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.fechaFin ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                  />
                  {errors.fechaFin && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.fechaFin}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Ubicación <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.ubicacion}
                  onChange={(e) => handleChange("ubicacion", e.target.value)}
                  placeholder="Ciudad o dirección"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.ubicacion ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                />
                {errors.ubicacion && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.ubicacion}
                  </p>
                )}
              </div>
            </div>
            {/* Fin columna izquierda */}

            {/* Columna derecha: el recinto de la feria y, mas adelante, la
              vista previa de su forma. Una feria nueva no tiene eventos:
              no aplica el aviso de RN-24 */}
            <SelectorRecinto
              valor={form.recintoId ?? null}
              asignadoId={null}
              onCambiar={(recintoId) =>
                setForm((prev) => ({ ...prev, recintoId }))
              }
            />
          </div>
          {/* Fin grid de 2 columnas */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creando..." : "Crear feria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
