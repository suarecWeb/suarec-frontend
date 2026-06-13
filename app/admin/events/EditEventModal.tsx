"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  CalendarDays,
  MapPin,
  Ticket,
  DollarSign,
  FileText,
  Upload,
  Smartphone,
  Monitor,
} from "lucide-react";
import {
  Evento,
  CreateEventoDto,
  EventoEstado,
} from "@/interfaces/event.interface";
import { toDatetimeLocal } from "@/lib/TimeZone";

interface EditEventModalProps {
  event: Evento;
  onClose: () => void;
  onSubmit: (
    id: number,
    dto: Partial<CreateEventoDto>,
    imageFile?: File,
  ) => Promise<void>;
}

const ESTADO_CONFIG: Record<EventoEstado, { label: string; color: string }> = {
  [EventoEstado.PREVENTA]: {
    label: "Preventa",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [EventoEstado.VENTA]: {
    label: "Venta",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  [EventoEstado.CERRADO]: {
    label: "Cerrado",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  [EventoEstado.CANCELADO]: {
    label: "Cancelado",
    color: "bg-red-100 text-red-600 border-red-200",
  },
};

const FORMAT_OPTIONS: {
  id: number;
  label: string;
  resolution: string;
  ratio: string;
  width: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 1,
    label: "Teléfono",
    resolution: "1080 × 1920 px",
    ratio: "aspect-[9/16]",
    width: "w-72 mx-auto",
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    id: 2,
    label: "Web",
    resolution: "1280 × 720 px",
    ratio: "aspect-video",
    width: "w-full",
    icon: <Monitor className="h-5 w-5" />,
  },
];

export default function EditEventModal({
  event,
  onClose,
  onSubmit,
}: EditEventModalProps) {
  const [form, setForm] = useState<CreateEventoDto>({
    nombre: event.nombre,
    descripcion: event.descripcion ?? "",
    fechaEvento: toDatetimeLocal(event.fechaEvento),
    ubicacion: event.ubicacion,
    aforoTotal: event.aforoTotal
      ? Math.round(Number(event.aforoTotal))
      : undefined,
    precioBase:
      event.precioBase !== undefined
        ? Math.round(Number(event.precioBase))
        : undefined,
    comision:
      event.comision !== undefined
        ? Math.round(Number(event.comision))
        : undefined,
    estado: event.estado,
    formatId: event.formatId,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateEventoDto, string>>
  >({});
  const [imagePreview, setImagePreview] = useState<string | null>(
    event.imagenUrl ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const serverError = (errors as any)._server as string | undefined;
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!serverError) return;
    setShowError(true);
    const hide = setTimeout(() => setShowError(false), 4700);
    const clear = setTimeout(
      () => setErrors((prev) => ({ ...prev, _server: undefined })),
      5000,
    );
    return () => {
      clearTimeout(hide);
      clearTimeout(clear);
    };
  }, [serverError]);

  const selectedFormat =
    FORMAT_OPTIONS.find((f) => f.id === form.formatId) ?? null;

  const validate = (): boolean => {
    const next: typeof errors = {};

    if (!form.nombre.trim()) next.nombre = "El nombre es obligatorio";
    else if (form.nombre.trim().length < 3)
      next.nombre = "El nombre debe tener al menos 3 caracteres";
    else if (form.nombre.trim().length > 150)
      next.nombre = "El nombre no puede superar 150 caracteres";

    if (form.descripcion && form.descripcion.length > 2000)
      next.descripcion = "La descripción no puede superar 2000 caracteres";

    if (!form.fechaEvento) {
      next.fechaEvento = "La fecha es obligatoria";
    } else {
      const fecha = new Date(form.fechaEvento);
      const hoy = new Date();
      const max = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      max.setFullYear(max.getFullYear() + 2);
      if (fecha < hoy)
        next.fechaEvento = "La fecha debe ser hoy o en el futuro";
      else if (fecha > max)
        next.fechaEvento = "La fecha no puede ser mayor a 2 años desde hoy";
    }

    if (!form.ubicacion.trim()) next.ubicacion = "El lugar es obligatorio";
    else if (form.ubicacion.trim().length > 200)
      next.ubicacion = "El lugar no puede superar 200 caracteres";

    if (form.aforoTotal !== undefined) {
      if (!Number.isInteger(form.aforoTotal))
        next.aforoTotal = "El aforo debe ser un número entero";
      else if (form.aforoTotal < 1)
        next.aforoTotal = "El aforo debe ser mayor a 0";
      else if (form.aforoTotal > 4000)
        next.aforoTotal = "El aforo no puede superar 4000";
    }

    if (form.precioBase !== undefined && form.precioBase < 2000)
      next.precioBase = "El precio mínimo de la boleta es $2.000 COP";

    if (!form.formatId)
      next.formatId = "Debes seleccionar un formato de imagen";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (
    field: keyof CreateEventoDto,
    value: string | number | undefined,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const formatPriceDisplay = (value: number | undefined): string =>
    value !== undefined ? value.toLocaleString("es-CO") : "";

  const parsePriceInput = (raw: string): number | undefined => {
    const cleaned = raw.replace(/\./g, "");
    const num = Number(cleaned);
    return cleaned === "" ? undefined : isNaN(num) ? undefined : num;
  };

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
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !event.id) return;
    setLoading(true);
    try {
      await onSubmit(
        event.id,
        { ...form, removeImage: imageRemoved },
        imageFile ?? undefined,
      );
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (Array.isArray(msg)) {
        setErrors((prev) => ({ ...prev, _server: msg.join(", ") }));
      } else if (typeof msg === "string") {
        setErrors((prev) => ({ ...prev, _server: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#097EEC]" />
            <h2 className="text-base font-semibold text-gray-800">
              Editar evento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Imagen al tope */}
        <div className="px-6 pt-5">
          <div className={`flex gap-2 ${errors.formatId ? "mb-1" : "mb-3"}`}>
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => handleChange("formatId", fmt.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                  form.formatId === fmt.id
                    ? "border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC]"
                    : errors.formatId
                      ? "border-red-300 text-red-400"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {fmt.icon}
                {fmt.label}
              </button>
            ))}
          </div>
          {errors.formatId && (
            <p className="mb-2 text-xs text-red-500">{errors.formatId}</p>
          )}

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
              className={`relative rounded-xl overflow-hidden border border-gray-200 ${selectedFormat?.ratio ?? "aspect-video"} ${selectedFormat?.width ?? "w-full"}`}
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
              htmlFor="edit-event-image-input"
              className={`cursor-pointer border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#097EEC] hover:text-[#097EEC] transition-colors ${selectedFormat?.ratio ?? "h-40"} ${selectedFormat?.width ?? "w-full"}`}
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs">Haz clic para subir una imagen</span>
              {!selectedFormat && (
                <span className="text-[10px] text-gray-300">
                  Selecciona un formato primero
                </span>
              )}
            </label>
          )}
          <input
            id="edit-event-image-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {serverError && (
            <div
              className={`flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 transition-all duration-300 ease-in-out ${showError ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
            >
              <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Nombre + Estado */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nombre <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                placeholder="Nombre del evento"
                className={`flex-1 px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.nombre ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
              />
              <select
                value={form.estado}
                onChange={(e) =>
                  handleChange("estado", e.target.value as EventoEstado)
                }
                className={`px-3 py-2 text-xs font-semibold border rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 transition-all cursor-pointer ${ESTADO_CONFIG[form.estado!].color}`}
              >
                {Object.values(EventoEstado).map((e) => (
                  <option key={e} value={e}>
                    {ESTADO_CONFIG[e].label}
                  </option>
                ))}
              </select>
            </div>
            {errors.nombre && (
              <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <FileText className="h-3 w-3 inline mr-1" />
              Descripción
            </label>
            <textarea
              value={form.descripcion ?? ""}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              placeholder="Describe el evento..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none transition-all resize-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] focus:bg-white"
            />
          </div>

          {/* Fecha + Lugar */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <CalendarDays className="h-3 w-3 inline mr-1" />
                Fecha <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                defaultValue={form.fechaEvento}
                onChange={(e) => handleChange("fechaEvento", e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.fechaEvento ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
              />
              {errors.fechaEvento && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.fechaEvento}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <MapPin className="h-3 w-3 inline mr-1" />
                Lugar <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.ubicacion}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                placeholder="Ciudad o dirección"
                className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${errors.ubicacion ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
              />
              {errors.ubicacion && (
                <p className="mt-1 text-xs text-red-500">{errors.ubicacion}</p>
              )}
            </div>
          </div>

          {/* Boletas + Precio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                <Ticket className="h-3 w-3 inline mr-1" />
                Boletas
              </label>
              <input
                type="number"
                min={1}
                value={form.aforoTotal ?? ""}
                onChange={(e) =>
                  handleChange(
                    "aforoTotal",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder="Sin límite"
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] focus:bg-white transition-all ${errors.aforoTotal ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.aforoTotal && (
                <p className="mt-1 text-xs text-red-500">{errors.aforoTotal}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>Precio base</span>
                <span className="text-gray-400">COP</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formatPriceDisplay(form.precioBase)}
                onChange={(e) =>
                  handleChange("precioBase", parsePriceInput(e.target.value))
                }
                placeholder="Gratis"
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] focus:bg-white transition-all ${errors.precioBase ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.precioBase && (
                <p className="mt-1 text-xs text-red-500">{errors.precioBase}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
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
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
