'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import PublicationService from '../services/PublicationsService';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '../interfaces/auth.interface';
import { PUBLICATION_TYPES, PUBLICATION_TYPE_LABELS, PUBLICATION_TYPE_DESCRIPTIONS, PUBLICATION_TYPES_BY_ROLE } from '../constants/publicationTypes';
import { X, FileImage, Loader2, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface CreatePublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicationCreated?: () => void;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  publicationType: string;
  image_url?: string;
  price?: number;
  priceUnit?: string;
  serviceAddress?: string;
  paymentMethod?: string;
  serviceDetails?: string;
}

// Categorías disponibles
const CATEGORIES = [
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

export default function CreatePublicationModal({ isOpen, onClose, onPublicationCreated }: CreatePublicationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
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
      priceUnit: "",
    },
  });

  // Validar que el usuario esté autenticado y obtener roles
  useEffect(() => {
    if (isOpen) {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        onClose();
        return;
      }
      
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUserRoles(decoded.roles.map(role => role.name));
      } catch (error) {
        console.error('Error al decodificar token:', error);
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

  // Función para subir imágenes (simulada)
  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setUploading(false);
        resolve(`https://example.com/images/${file.name}`);
      }, 1500);
    });
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
        publicationType: data.publicationType,
        image_url: imageUrl || undefined,
        price: data.price ? Number(data.price) : undefined,
        priceUnit: data.priceUnit || undefined,
        created_at: new Date(),
        modified_at: new Date(),
        userId: Number(decoded.id),
        visitors: 0,
        ...(data.publicationType === 'SERVICE_REQUEST' ? {
          serviceAddress: data.serviceAddress,
          paymentMethod: data.paymentMethod,
          serviceDetails: data.serviceDetails
        } : {})
      };
            
      const response = await PublicationService.createPublication(publicationData);
      
      setSuccess("Publicación creada exitosamente");
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
      const errorMessage = err.response?.data?.message || "Error al crear la publicación. Inténtalo de nuevo.";
      setError(errorMessage);
      console.error("Error al crear publicación:", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
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
              <h2 className="text-xl font-bold mb-1">Crear Publicación</h2>
              <p className="text-blue-100 text-sm">Comparte tus servicios o búsquedas con la comunidad</p>
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
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.title ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Ej. Servicio de plomería profesional"
                    {...register("title", {
                      required: "El título es obligatorio",
                      maxLength: {
                        value: 255,
                        message: "El título no puede exceder los 255 caracteres",
                      },
                    })}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Category field */}
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
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
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                  )}
                </div>

                {/* Publication Type field */}
                <div className="space-y-2">
                  <label htmlFor="publicationType" className="block text-sm font-medium text-gray-700">
                    Tipo de publicación <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="publicationType"
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.publicationType ? "border-red-500" : "border-gray-200"
                    }`}
                    {...register("publicationType", {
                      required: "El tipo de publicación es obligatorio",
                    })}
                    disabled={isLoading}
                  >
                    <option value="">Selecciona el tipo de publicación</option>
                    {userRoles.map(role => {
                      const availableTypes = PUBLICATION_TYPES_BY_ROLE[role as keyof typeof PUBLICATION_TYPES_BY_ROLE] || [];
                      return availableTypes.map(type => (
                        <option key={type} value={type}>
                          {PUBLICATION_TYPE_LABELS[type as keyof typeof PUBLICATION_TYPE_LABELS]}
                        </option>
                      ));
                    }).flat()}
                  </select>
                  {errors.publicationType && (
                    <p className="text-red-500 text-xs mt-1">{errors.publicationType.message}</p>
                  )}
                  {watch("publicationType") && (
                    <p className="text-gray-500 text-xs">
                      {PUBLICATION_TYPE_DESCRIPTIONS[watch("publicationType") as keyof typeof PUBLICATION_TYPE_DESCRIPTIONS]}
                    </p>
                  )}
                </div>

                {/* Description field */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Describe tu servicio o lo que estás buscando..."
                    {...register("description", {
                      required: "La descripción es obligatoria",
                      minLength: {
                        value: 20,
                        message: "La descripción debe tener al menos 20 caracteres",
                      },
                      maxLength: {
                        value: 500,
                        message: "La descripción no puede exceder los 500 caracteres",
                      },
                    })}
                    disabled={isLoading}
                  ></textarea>
                  {errors.description ? (
                    <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                  ) : (
                    <p className="text-gray-500 text-xs">
                      Caracteres: {watch("description")?.length || 0}/500
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
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
                        min: { value: 0, message: "El precio debe ser mayor a 0" }
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                      placeholder="Ej: 50.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="priceUnit" className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad
                    </label>
                    <select
                      id="priceUnit"
                      {...register("priceUnit")}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                    >
                      <option value="">Seleccionar</option>
                      <option value="hour">Por hora</option>
                      <option value="project">Por proyecto</option>
                      <option value="event">Por evento</option>
                      <option value="monthly">Mensual</option>
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="piece">Por pieza</option>
                      <option value="service">Por servicio</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="flex">
                    <Info className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-700">
                        <strong>Consejo:</strong> Si especificas un precio, los usuarios podrán contratar tu servicio directamente. 
                        Si no lo especificas, los usuarios te contactarán para negociar el precio.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SOLO para SERVICE_REQUEST: dirección, método de pago, detalles */}
                {watch("publicationType") === 'SERVICE_REQUEST' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="serviceAddress" className="block text-sm font-medium text-gray-700">
                        Dirección del servicio <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="serviceAddress"
                        type="text"
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${errors.serviceAddress ? "border-red-500" : "border-gray-200"}`}
                        placeholder="Ej. Calle 123 #45-67, Barrio, Ciudad"
                        {...register("serviceAddress", {
                          required: "La dirección es obligatoria para este tipo de publicación"
                        })}
                        disabled={isLoading}
                      />
                      {errors.serviceAddress && (
                        <p className="text-red-500 text-xs mt-1">{errors.serviceAddress.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                        Método de pago preferido <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentMethod"
                        className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm ${errors.paymentMethod ? "border-red-500" : "border-gray-200"}`}
                        {...register("paymentMethod", {
                          required: "El método de pago es obligatorio para este tipo de publicación"
                        })}
                        disabled={isLoading}
                      >
                        <option value="">Selecciona un método de pago</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia bancaria</option>
                        <option value="tarjeta">Tarjeta de crédito/débito</option>
                      </select>
                      {errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="serviceDetails" className="block text-sm font-medium text-gray-700">
                        Detalles logísticos (opcional)
                      </label>
                      <textarea
                        id="serviceDetails"
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                        placeholder="Ej. Piso 2, acceso por portería, horario preferido, etc."
                        {...register("serviceDetails")}
                        disabled={isLoading}
                      ></textarea>
                    </div>
                  </>
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
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg mx-auto"
                          />
                          <p className="text-xs text-gray-500">Haz clic para cambiar la imagen</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FileImage className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">Haz clic para subir una imagen</p>
                          <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
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
                    Crear Publicación
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