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
  Briefcase,
} from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";
import { toast } from "react-hot-toast";
import { PublicationType } from "../interfaces/publication.interface";

interface CreateJobOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicationCreated?: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  image_url?: string;
  gallery_images?: string[];
  price?: number;
  priceUnit?: string;
}

// Categorías disponibles para ofertas de empleo
const JOB_CATEGORIES = [
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

export default function CreateJobOfferModal({
  isOpen,
  onClose,
  onPublicationCreated,
}: CreateJobOfferModalProps) {
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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      image_url: "",
      price: undefined,
      priceUnit: "monthly", // Por defecto mensual para ofertas de empleo
    },
  });

  // Validar que el usuario esté autenticado y sea Business
  useEffect(() => {
    if (isOpen) {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        onClose();
      } else {
        const decoded = jwtDecode<TokenPayload>(token);
        const userRoles = decoded.roles.map((role) => role.name);

        // Validar que el usuario tenga rol Business
        if (!userRoles.includes("BUSINESS")) {
          setError("Solo las empresas pueden crear ofertas de empleo");
          return;
        }

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

  // Función para subir imágenes
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

      // Crear publicación de oferta de empleo
      const publicationData = {
        title: data.title,
        description: data.description || "",
        category: data.category.toUpperCase(),
        type: PublicationType.SERVICE_OFFER, // Marcar explícitamente como oferta de servicio
        image_url: imageUrl || undefined,
        gallery_images:
          selectedGalleryImages.length > 0 ? selectedGalleryImages : undefined,
        price: data.price ? Number(data.price) : undefined,
        priceUnit: "monthly", // Siempre mensual para ofertas de empleo
        created_at: new Date(),
        modified_at: new Date(),
        userId: Number(decoded.id),
        visitors: 0,
      };

      const response =
        await PublicationService.createPublication(publicationData);

      toast.success("Oferta de empleo creada exitosamente");
      setIsLoading(false);

      // Resetear formulario
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedGalleryImages([]);

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
        "Error al crear la oferta de empleo. Inténtalo de nuevo.";
      setError(errorMessage);
      console.error("Error al crear oferta de empleo:", err);
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
              <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Crear Oferta de Empleo
              </h2>
              <p className="text-blue-100 text-sm">
                Encuentra el talento perfecto para tu empresa
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
                {/* Title field */}
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Título del puesto <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.title ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Ej. Desarrollador Full Stack Senior"
                    {...register("title", {
                      required: "El título del puesto es obligatorio",
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
                    Área de trabajo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.category ? "border-red-500" : "border-gray-200"
                    }`}
                    {...register("category", {
                      required: "El área de trabajo es obligatoria",
                    })}
                    disabled={isLoading}
                  >
                    <option value="">Selecciona un área</option>
                    {JOB_CATEGORIES.map((category) => (
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
                    Descripción del puesto{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Describe las responsabilidades, requisitos y beneficios del puesto..."
                    {...register("description", {
                      required: "La descripción del puesto es obligatoria",
                      minLength: {
                        value: 50,
                        message:
                          "La descripción debe tener al menos 50 caracteres",
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

                {/* Salario */}
                <div className="space-y-2">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Salario mensual <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="50000"
                      required
                      {...register("price", {
                        valueAsNumber: true,
                        required: "El salario es obligatorio",
                        min: {
                          value: 0,
                          message: "El salario debe ser mayor a 0",
                        },
                      })}
                      className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                      placeholder="1500000"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.price.message}
                    </p>
                  )}

                  {/* Mostrar salario formateado */}
                  {(() => {
                    const salaryValue = watch("price");
                    if (!salaryValue || salaryValue <= 0) return null;

                    return (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700">
                          <strong>Salario mensual:</strong>{" "}
                          {formatCurrency(salaryValue)} COP
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Info messages específicas para ofertas de empleo */}
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex">
                    <Info className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-green-700">
                        <strong>Importante:</strong> El salario que ingreses
                        será visible para los candidatos. Asegúrate de que esté
                        dentro del rango de mercado para atraer el mejor
                        talento.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="flex">
                    <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-700">
                        <strong>Consejo:</strong> Los candidatos podrán aplicar
                        a esta oferta y recibirás sus aplicaciones para revisar
                        y gestionar el proceso de selección.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column - Image upload and preview */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen de la empresa (opcional)
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
                    <Briefcase className="h-4 w-4" />
                    Crear Oferta de Empleo
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
