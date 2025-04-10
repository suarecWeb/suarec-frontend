"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Navbar from "@/components/navbar";
import Link from "next/link";
import PublicationService from "@/services/PublicationsService";
import {
  AlertCircle,
  ArrowLeft,
  FileImage,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

// Interfaces
interface FormData {
  title: string;
  description: string;
  category: string;
  image_url?: string;
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

const CreatePublicationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    },
  });

  // Validar que el usuario esté autenticado
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
    }
  }, [router]);

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
    // Esta función debería conectarse con tu servicio real de almacenamiento de imágenes
    // Por ahora, simularemos un retraso y devolveremos una URL falsa
    setUploading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setUploading(false);
        // En un caso real, aquí obtendrías la URL de la imagen subida
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
      
      // Crear publicación (formato exacto según CreatePublicationDto)
      const publicationData = {
        title: data.title,
        description: data.description || "", // Asegurar que no sea undefined
        category: data.category.toUpperCase(),
        image_url: imageUrl || undefined, // Opcional
        created_at: new Date(), 
        modified_at: new Date(),
        userId: Number(decoded.id), // Asegurar que sea número
        visitors: 0 // Opcional, inicializar en 0
      };
            
      const response = await PublicationService.createPublication(publicationData);
      
      setSuccess("Publicación creada exitosamente");
      setIsLoading(false);
      
      // Resetear formulario
      reset();
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/publications/${response.data.id}`);
      }, 2000);
      
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.response?.data?.message || "Error al crear la publicación. Inténtalo de nuevo.";
      setError(errorMessage);
      console.error("Error al crear publicación:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Crear Publicación</h1>
            <p className="mt-2 text-blue-100">
              Comparte tus servicios o búsquedas con la comunidad
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Back button */}
            <Link
              href="/publications"
              className="inline-flex items-center text-gray-600 hover:text-[#097EEC] mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a publicaciones
            </Link>

            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-medium">¡Listo!</h3>
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column - Form fields */}
                <div className="space-y-6">
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
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none ${
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
                      <p className="text-red-500 text-sm mt-1">
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
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none ${
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
                      <p className="text-red-500 text-sm mt-1">
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
                      rows={6}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none ${
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
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-xs">
                        Caracteres: {watch("description")?.length || 0}/500
                      </p>
                    )}
                  </div>
                </div>

                {/* Right column - Image upload and preview */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Imagen (opcional)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center ${
                        previewUrl ? "border-[#097EEC]" : "border-gray-300"
                      }`}
                    >
                      {previewUrl ? (
                        <div className="space-y-4">
                          <div className="relative h-48 rounded-md overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Vista previa"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex justify-center">
                            <button
                              type="button"
                              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                              }}
                            >
                              Eliminar imagen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 py-8">
                          <div className="flex justify-center">
                            <FileImage className="h-12 w-12 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">
                              Arrastra una imagen o haz clic para seleccionar
                            </p>
                            <p className="text-gray-500 text-sm mt-1">
                              PNG, JPG o JPEG (máx. 5MB)
                            </p>
                          </div>
                          <div>
                            <label
                              htmlFor="image"
                              className="cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors text-gray-700 font-medium py-2 px-4 rounded-md inline-block"
                            >
                              Seleccionar archivo
                            </label>
                            <input
                              id="image"
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleFileChange}
                              className="hidden"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tips for a good publication */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-[#097EEC] flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-[#097EEC] font-medium text-sm">
                          Consejos para una buena publicación
                        </h3>
                        <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc ml-4">
                          <li>Sé específico sobre lo que ofreces o buscas</li>
                          <li>Incluye detalles importantes como precio, ubicación, etc.</li>
                          <li>Usa un título claro y descriptivo</li>
                          <li>Añade una imagen relevante para destacar</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Link
                    href="/publications"
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#097EEC] text-white rounded-lg font-medium hover:bg-[#0A6BC7] transition-colors flex items-center justify-center"
                    disabled={isLoading || uploading}
                  >
                    {isLoading || uploading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        {uploading ? "Subiendo imagen..." : "Creando..."}
                      </>
                    ) : (
                      "Crear publicación"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePublicationPage;