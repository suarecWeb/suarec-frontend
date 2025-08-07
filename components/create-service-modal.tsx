"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import PublicationService from "../services/PublicationsService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "../interfaces/auth.interface";
import { UserGallery } from "./ui/UserGallery";
import SupabaseService from "../services/supabase.service";
import {
  X,
  FileImage,
  Loader2,
  CheckCircle,
  Info,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { calculatePriceWithTax } from "../lib/utils";
import { formatCurrency } from "../lib/formatCurrency";
import { toast } from "react-hot-toast";
import { PublicationType } from "../interfaces/publication.interface";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicationCreated?: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  type: string; // Agregar tipo de publicación
  image_url?: string;
  gallery_images?: string[];
  price?: number;
  priceUnit?: string;
  // Campos específicos para solicitudes de servicio
  requirements?: string;
  location?: string;
  urgency?: string;
  preferredSchedule?: string;
}

// Categorías disponibles para servicios
const SERVICE_CATEGORIES = [
  "Tecnología",
  "Construcción",
  "Salud",
  "Educación",
  "Servicios",
  "Gastronomía",
  "Transporte",
  "Manufactura",
  "Finanzas",
  "Agricultura",
  "Otro",
];

// Unidades de precio disponibles
const PRICE_UNITS = [
  "hour", // Por hora
  "project", // Por proyecto
  "monthly", // Mensual
  "daily", // Diario
  "weekly", // Semanal
  "piece", // Por pieza
  "service", // Por servicio
];

export default function CreateServiceModal({
  isOpen,
  onClose,
  onPublicationCreated,
}: CreateServiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<string[]>(
    [],
  );
  const [showGallerySelector, setShowGallerySelector] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      type: "", // Agregar tipo vacío por defecto
      image_url: "",
      price: undefined,
      priceUnit: "",
      requirements: "",
      location: "",
      urgency: "",
      preferredSchedule: "",
    },
  });

  // Watcher para el tipo de publicación
  const watchedType = watch("type");
  
  // Actualizar el estado cuando cambie el tipo
  useEffect(() => {
    setSelectedType(watchedType);
  }, [watchedType]);

  // Validar que el usuario esté autenticado
  useEffect(() => {
    if (isOpen) {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        onClose();
      } else {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      }
    }
  }, [isOpen, router, onClose]);

  // Manejar la selección de archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Función para subir imágenes (real)
  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    const result = await SupabaseService.uploadImage(
      file,
      "publication-images",
    );
    setUploading(false);
    if (result.error) throw new Error(result.error);
    return result.url;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener ID del usuario del token
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.id) {
        throw new Error("ID de usuario no encontrado en el token");
      }

      // Subir imagen si existe
      let imageUrl = data.image_url;
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      // Crear publicación - asegurar que el precio sea número
      const publicationData = {
        title: data.title,
        description: data.description || "",
        category: data.category.toUpperCase(),
        type: data.type === "offer" ? PublicationType.SERVICE_OFFER : PublicationType.SERVICE_REQUEST, // Convertir string a enum
        image_url: imageUrl || undefined,
        gallery_images:
          selectedGalleryImages.length > 0 ? selectedGalleryImages : undefined,
        price: data.price ? Number(data.price) : undefined, // Convertir explícitamente a número
        priceUnit: data.priceUnit || undefined,
        // Campos específicos para solicitudes
        requirements: data.requirements || undefined,
        location: data.location || undefined,
        urgency: data.urgency || undefined,
        preferredSchedule: data.preferredSchedule || undefined,
        created_at: new Date(),
        modified_at: new Date(),
        userId: Number(decoded.id),
        visitors: 0,
      };

      const response =
        await PublicationService.createPublication(publicationData);

      toast.success("Publicación creada exitosamente");
      setIsLoading(false);

      // Resetear formulario
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);

      // Cerrar modal y actualizar feed
      setTimeout(() => {
        onPublicationCreated?.();
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        "Error al crear la publicación. Inténtalo de nuevo.";
      setError(errorMessage);
      console.error("Error al crear publicación:", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedGalleryImages([]);
      setShowGallerySelector(false);
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-auto h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto modal-scrollbar">
        {/* Header */}
        <div className="bg-[#097EEC] text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {selectedType === "offer" 
                  ? "Crear Oferta de Servicio" 
                  : selectedType === "request" 
                    ? "Crear Solicitud de Servicio"
                    : "Crear Publicación de Servicio"
                }
              </h2>
              <p className="text-blue-100 text-sm">
                {selectedType === "offer" 
                  ? "Ofrece tus servicios a la comunidad"
                  : selectedType === "request" 
                    ? "Busca profesionales para tus necesidades"
                    : "Comparte tus servicios con la comunidad"
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-blue-100 hover:text-white transition-colors p-1"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium text-sm">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 p-3 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-green-800 font-medium text-sm">¡Listo!</h3>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Left column - Form fields */}
              <div className="space-y-4">
                {/* Type field - Agregar al principio */}
                <div className="space-y-2">
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de publicación <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.type ? "border-red-500" : "border-gray-200"
                    }`}
                    {...register("type", {
                      required: "El tipo de publicación es obligatorio",
                    })}
                    disabled={isLoading}
                  >
                    <option value="">Selecciona el tipo</option>
                    <option value="offer">Oferta de Servicio (Ofrezco un servicio)</option>
                    <option value="request">Solicitud de Servicio (Busco un servicio)</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                {/* Title field */}
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.title ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder={selectedType === "offer" 
                      ? "Ej. Servicio de plomería profesional"
                      : selectedType === "request" 
                        ? "Ej. Necesito un plomero para arreglar una fuga"
                        : "Ej. Servicio de plomería profesional"
                    }
                    {...register("title", {
                      required: "El título es obligatorio",
                      maxLength: {
                        value: 255,
                        message:
                          "El título no puede exceder los 255 caracteres",
                      },
                    })}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Category field */}
                <div className="space-y-2">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.category ? "border-red-500" : "border-gray-200"
                    }`}
                    {...register("category", {
                      required: "La categoría es obligatoria",
                    })}
                    disabled={isLoading}
                  >
                    <option value="">Selecciona una categoría</option>
                    {SERVICE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Description field */}
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder={selectedType === "offer" 
                      ? "Describe tu servicio, experiencia y lo que ofreces..."
                      : selectedType === "request" 
                        ? "Describe qué necesitas, el problema a resolver..."
                        : "Describe tu servicio o lo que estás buscando..."
                    }
                    {...register("description", {
                      required: "La descripción es obligatoria",
                      minLength: {
                        value: 20,
                        message:
                          "La descripción debe tener al menos 20 caracteres",
                      },
                      maxLength: {
                        value: 500,
                        message:
                          "La descripción no puede exceder los 500 caracteres",
                      },
                    })}
                    disabled={isLoading}
                  ></textarea>
                  {errors.description ? (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description.message}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-xs">
                      Caracteres: {watch("description")?.length || 0}/500
                    </p>
                  )}
                </div>

                {/* Campos específicos para solicitudes de servicio */}
                {selectedType === "request" && (
                  <>
                    {/* Requisitos */}
                    <div className="space-y-2">
                      <label
                        htmlFor="requirements"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Requisitos específicos <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="requirements"
                        rows={3}
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                          errors.requirements ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Describe exactamente qué necesitas..."
                        {...register("requirements", {
                          required: selectedType === "request" ? "Los requisitos son obligatorios" : false,
                          minLength: {
                            value: 10,
                            message: "Los requisitos deben tener al menos 10 caracteres",
                          },
                        })}
                        disabled={isLoading}
                      ></textarea>
                      {errors.requirements && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.requirements.message}
                        </p>
                      )}
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-2">
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ubicación <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="location"
                        type="text"
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                          errors.location ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Ej. Bogotá, Medellín, Cali..."
                        {...register("location", {
                          required: selectedType === "request" ? "La ubicación es obligatoria" : false,
                        })}
                        disabled={isLoading}
                      />
                      {errors.location && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    {/* Urgencia */}
                    <div className="space-y-2">
                      <label
                        htmlFor="urgency"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Urgencia <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="urgency"
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                          errors.urgency ? "border-red-500" : "border-gray-200"
                        }`}
                        {...register("urgency", {
                          required: selectedType === "request" ? "La urgencia es obligatoria" : false,
                        })}
                        disabled={isLoading}
                      >
                        <option value="">Selecciona la urgencia</option>
                        <option value="low">Baja (1-2 semanas)</option>
                        <option value="medium">Media (3-5 días)</option>
                        <option value="high">Alta (1-2 días)</option>
                        <option value="urgent">Urgente (Hoy/Mañana)</option>
                      </select>
                      {errors.urgency && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.urgency.message}
                        </p>
                      )}
                    </div>

                    {/* Horario preferido */}
                    <div className="space-y-2">
                      <label
                        htmlFor="preferredSchedule"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Horario preferido
                      </label>
                      <select
                        id="preferredSchedule"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                        {...register("preferredSchedule")}
                        disabled={isLoading}
                      >
                        <option value="">Sin preferencia</option>
                        <option value="morning">Mañana (8:00 AM - 12:00 PM)</option>
                        <option value="afternoon">Tarde (12:00 PM - 6:00 PM)</option>
                        <option value="evening">Noche (6:00 PM - 10:00 PM)</option>
                        <option value="weekend">Fines de semana</option>
                        <option value="flexible">Horario flexible</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Precio - Solo mostrar para ofertas de servicio */}
                {selectedType === "offer" && (
                  <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      min="0"
                      required
                      {...register("price", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "El precio debe ser mayor a 0",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                      placeholder="Ej: 50.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.price.message}
                      </p>
                    )}

                    {/* Mostrar precio con IVA en tiempo real */}
                    {(() => {
                      const priceValue = watch("price");

                      // Validación robusta del precio
                      if (!priceValue && priceValue !== 0) return null;

                      const numericPrice = Number(priceValue);

                      // Solo mostrar si es un número válido y mayor que 0
                      if (isNaN(numericPrice) || numericPrice <= 0) return null;

                      return (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-xs text-green-700">
                            <strong>Precio con IVA (19%):</strong>{" "}
                            {formatCurrency(
                              calculatePriceWithTax(numericPrice),
                            )}
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label
                      htmlFor="priceUnit"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Unidad
                    </label>
                    <select
                      id="priceUnit"
                      {...register("priceUnit")}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="hour">Por hora</option>
                      <option value="monthly">Por mes</option>
                      <option value="daily">Por día</option>
                      <option value="weekly">Por semana</option>
                      <option value="service">Por servicio</option>
                    </select>
                  </div>
                </div>
                )}

                {/* Información sobre precio - Solo mostrar para ofertas */}
                {selectedType === "offer" && (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <div className="flex">
                        <Info className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-yellow-700">
                            <strong>Importante:</strong> El precio que ingreses es
                            el precio base. Se aplicará automáticamente un 19% de
                            IVA que será visible para los usuarios en el precio
                            final mostrado en tu publicación.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex">
                        <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-blue-700">
                            <strong>Consejo:</strong> Si especificas un precio, los
                            usuarios podrán contratar tu servicio directamente. Si
                            no lo especificas, los usuarios te contactarán para
                            negociar el precio.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Información para solicitudes */}
                {selectedType === "request" && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex">
                      <Info className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-xs text-green-700">
                          <strong>Consejo:</strong> Al solicitar un servicio, los trabajadores 
                          podrán ver tus requisitos y aplicar con sus propuestas. 
                          Podrás revisar y aceptar la mejor oferta.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Image upload and preview */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen (opcional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#097EEC] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="image-upload"
                      disabled={isLoading}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {previewUrl ? (
                        <div className="space-y-2">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            width={400}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg mx-auto"
                          />
                          <p className="text-xs text-gray-500">
                            Haz clic para cambiar la imagen
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileImage className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">
                            Haz clic para subir una imagen
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG hasta 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Subiendo imagen...
                    </div>
                  )}
                </div>

                {/* Gallery Selection */}
                {currentUserId && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Imágenes de mi galería (opcional)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowGallerySelector(!showGallerySelector)
                        }
                        className="text-sm text-[#097EEC] hover:text-[#0A6BC7] flex items-center gap-1"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {showGallerySelector ? "Ocultar" : "Seleccionar"} (
                        {selectedGalleryImages.length}/5)
                      </button>
                    </div>

                    {showGallerySelector && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <UserGallery
                          userId={currentUserId}
                          showSelection={true}
                          maxSelection={5}
                          onImagesSelected={setSelectedGalleryImages}
                        />
                      </div>
                    )}

                    {/* Selected Gallery Images Preview */}
                    {selectedGalleryImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Imágenes seleccionadas: {selectedGalleryImages.length}
                          /5
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {selectedGalleryImages.map((imageUrl, index) => (
                            <div key={index} className="relative aspect-square">
                              <Image
                                src={imageUrl}
                                alt={`Seleccionada ${index + 1}`}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover rounded border-2 border-blue-300"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedGalleryImages((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  )
                                }
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {selectedType === "offer" 
                      ? "Crear Oferta"
                      : selectedType === "request" 
                        ? "Crear Solicitud"
                        : "Crear Servicio"
                    }
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
