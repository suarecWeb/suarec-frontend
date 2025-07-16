// app/work-contracts/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Navbar from "@/components/navbar";
import Link from "next/link";
import WorkContractService, {
  CreateWorkContractDto,
} from "@/services/WorkContractService";
import { UserService } from "@/services/UsersService";
import PublicationService from "@/services/PublicationsService";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Info,
  User,
  Search,
  X,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import RoleGuard from "@/components/role-guard";

interface FormData {
  title: string;
  description: string;
  agreed_price: number;
  currency: string;
  type: "SERVICE" | "EMPLOYMENT";
  start_date: string;
  estimated_completion: string;
  location: string;
  client_notes: string;
  providerId: number;
  publicationId?: string;
}

interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  profession?: string;
}

interface PublicationSearchResult {
  id: string;
  title: string;
  category: string;
}

const CreateWorkContractPageContent = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Estados para búsqueda de usuarios y publicaciones
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<
    UserSearchResult[]
  >([]);
  const [selectedProvider, setSelectedProvider] =
    useState<UserSearchResult | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [publicationSearchTerm, setPublicationSearchTerm] = useState("");
  const [publicationSearchResults, setPublicationSearchResults] = useState<
    PublicationSearchResult[]
  >([]);
  const [selectedPublication, setSelectedPublication] =
    useState<PublicationSearchResult | null>(null);
  const [showPublicationSearch, setShowPublicationSearch] = useState(false);

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
      agreed_price: 0,
      currency: "COP",
      type: "SERVICE",
      start_date: "",
      estimated_completion: "",
      location: "",
      client_notes: "",
      providerId: 0,
    },
  });

  // Validar que el usuario esté autenticado
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setCurrentUserId(decoded.id);
    } catch (err) {
      console.error("Error al decodificar token:", err);
      router.push("/auth/login");
    }
  }, [router]);

  // Buscar usuarios
  const searchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUserSearchResults([]);
      return;
    }

    try {
      const response = await UserService.getUsers({ page: 1, limit: 10 });
      /*const filtered = response.data.data.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ).filter(user => (user.id && currentUserId? user.id !== currentUserId.toString(): )); // Excluir el usuario actual
      
      setUserSearchResults(filtered);*/
    } catch (err) {
      console.error("Error buscando usuarios:", err);
    }
  };

  // Buscar publicaciones
  const searchPublications = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setPublicationSearchResults([]);
      return;
    }

    try {
      const response = await PublicationService.getPublications({
        page: 1,
        limit: 10,
      });
      // Filtrar publicaciones que tienen id y mapear al formato correcto
      const filteredPublications: PublicationSearchResult[] = response.data.data
        .filter((pub: any) => pub.id && typeof pub.id === "string") // Solo publicaciones con id válido
        .map((pub: any) => ({
          id: pub.id as string,
          title: pub.title,
          category: pub.category,
        }));
      setPublicationSearchResults(filteredPublications);
      /*const filtered = response.data.data.filter(pub =>
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setPublicationSearchResults(filtered);*/
    } catch (err) {
      console.error("Error buscando publicaciones:", err);
    }
  };

  // Manejar selección de proveedor
  const handleSelectProvider = (user: UserSearchResult) => {
    setSelectedProvider(user);
    setValue("providerId", user.id);
    setShowUserSearch(false);
    setUserSearchTerm(user.name);
  };

  // Manejar selección de publicación
  const handleSelectPublication = (publication: PublicationSearchResult) => {
    setSelectedPublication(publication);
    setValue("publicationId", publication.id);
    setShowPublicationSearch(false);
    setPublicationSearchTerm(publication.title);

    // Auto-completar título si está vacío
    if (!watch("title")) {
      setValue("title", `Contrato para: ${publication.title}`);
    }
  };

  // Manejar búsqueda de usuarios con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userSearchTerm && showUserSearch) {
        searchUsers(userSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [userSearchTerm, showUserSearch]);

  // Manejar búsqueda de publicaciones con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (publicationSearchTerm && showPublicationSearch) {
        searchPublications(publicationSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [publicationSearchTerm, showPublicationSearch]);

  const onSubmit = async (data: FormData) => {
    if (!currentUserId) {
      setError("Usuario no autenticado");
      return;
    }

    if (!selectedProvider) {
      setError("Debes seleccionar un proveedor");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const contractData: CreateWorkContractDto = {
        title: data.title,
        description: data.description || undefined,
        agreed_price: data.agreed_price > 0 ? data.agreed_price : undefined,
        currency: data.currency,
        type: data.type,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        estimated_completion: data.estimated_completion
          ? new Date(data.estimated_completion)
          : undefined,
        location: data.location || undefined,
        client_notes: data.client_notes || undefined,
        clientId: currentUserId,
        providerId: data.providerId,
        publicationId: selectedPublication?.id,
      };

      const response =
        await WorkContractService.createWorkContract(contractData);

      setSuccess("Contrato creado exitosamente");

      // Resetear formulario
      reset();
      setSelectedProvider(null);
      setSelectedPublication(null);
      setUserSearchTerm("");
      setPublicationSearchTerm("");

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/work-contracts/${response.data.id}`);
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage =
        err.response?.data?.message ||
        "Error al crear el contrato. Inténtalo de nuevo.";
      setError(errorMessage);
      console.error("Error al crear contrato:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Crear Contrato de Trabajo</h1>
            <p className="mt-2 text-blue-100">
              Crea un nuevo contrato para servicios o empleos
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Back button */}
            <Link
              href="/work-contracts"
              className="inline-flex items-center text-gray-600 hover:text-[#097EEC] mb-6 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a contratos
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
                {/* Left column - Contract details */}
                <div className="space-y-6">
                  {/* Title field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Título del Contrato{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none ${
                        errors.title ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Ej. Desarrollo de aplicación web"
                      {...register("title", {
                        required: "El título es obligatorio",
                        maxLength: {
                          value: 200,
                          message:
                            "El título no puede exceder los 200 caracteres",
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

                  {/* Description field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      placeholder="Describe los detalles del trabajo..."
                      {...register("description", {
                        maxLength: {
                          value: 1000,
                          message:
                            "La descripción no puede exceder los 1000 caracteres",
                        },
                      })}
                      disabled={isLoading}
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Type and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tipo <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="type"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        {...register("type", {
                          required: "El tipo es obligatorio",
                        })}
                        disabled={isLoading}
                      >
                        <option value="SERVICE">Servicio</option>
                        <option value="EMPLOYMENT">Empleo</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="agreed_price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Precio Acordado
                      </label>
                      <div className="flex">
                        <input
                          id="agreed_price"
                          type="number"
                          min="0"
                          step="1000"
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          placeholder="0"
                          {...register("agreed_price", {
                            min: {
                              value: 0,
                              message: "El precio debe ser mayor o igual a 0",
                            },
                          })}
                          disabled={isLoading}
                        />
                        <select
                          {...register("currency")}
                          className="px-3 py-3 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          disabled={isLoading}
                        >
                          <option value="COP">COP</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="start_date"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fecha de Inicio
                      </label>
                      <input
                        id="start_date"
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        {...register("start_date")}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="estimated_completion"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fecha Estimada de Finalización
                      </label>
                      <input
                        id="estimated_completion"
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        {...register("estimated_completion")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Ubicación
                    </label>
                    <input
                      id="location"
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      placeholder="Ej. Cali, Colombia"
                      {...register("location")}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Client Notes */}
                  <div className="space-y-2">
                    <label
                      htmlFor="client_notes"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Notas Adicionales
                    </label>
                    <textarea
                      id="client_notes"
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      placeholder="Información adicional o requisitos especiales..."
                      {...register("client_notes")}
                      disabled={isLoading}
                    ></textarea>
                  </div>
                </div>

                {/* Right column - Provider selection and publication */}
                <div className="space-y-6">
                  {/* Provider Search */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Proveedor/Empleado <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar usuario por nombre o email..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            value={userSearchTerm}
                            onChange={(e) => {
                              setUserSearchTerm(e.target.value);
                              setShowUserSearch(true);
                            }}
                            onFocus={() => setShowUserSearch(true)}
                            disabled={isLoading}
                          />
                        </div>
                        {selectedProvider && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProvider(null);
                              setUserSearchTerm("");
                              setValue("providerId", 0);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Selected Provider */}
                      {selectedProvider && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-[#097EEC]" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {selectedProvider.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedProvider.email}
                            </p>
                            {selectedProvider.profession && (
                              <p className="text-xs text-gray-500">
                                {selectedProvider.profession}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* User Search Results */}
                      {showUserSearch && userSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto thin-scrollbar">
                          {userSearchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleSelectProvider(user)}
                              className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                            >
                              <div className="w-8 h-8 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-[#097EEC]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                                {user.profession && (
                                  <p className="text-xs text-gray-500">
                                    {user.profession}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {!selectedProvider && (
                      <p className="text-red-500 text-sm">
                        Debes seleccionar un proveedor
                      </p>
                    )}
                  </div>

                  {/* Publication Search (Optional) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Publicación Relacionada (Opcional)
                    </label>
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar publicación..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            value={publicationSearchTerm}
                            onChange={(e) => {
                              setPublicationSearchTerm(e.target.value);
                              setShowPublicationSearch(true);
                            }}
                            onFocus={() => setShowPublicationSearch(true)}
                            disabled={isLoading}
                          />
                        </div>
                        {selectedPublication && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPublication(null);
                              setPublicationSearchTerm("");
                              setValue("publicationId", undefined);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Selected Publication */}
                      {selectedPublication && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="font-medium text-gray-900">
                            {selectedPublication.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {selectedPublication.category}
                          </p>
                        </div>
                      )}

                      {/* Publication Search Results */}
                      {showPublicationSearch &&
                        publicationSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto thin-scrollbar">
                            {publicationSearchResults.map((publication) => (
                              <button
                                key={publication.id}
                                type="button"
                                onClick={() =>
                                  handleSelectPublication(publication)
                                }
                                className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <p className="font-medium text-gray-900">
                                  {publication.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {publication.category}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-[#097EEC] flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-[#097EEC] font-medium text-sm">
                          Información sobre Contratos
                        </h3>
                        <ul className="mt-2 text-sm text-gray-600 space-y-1 list-disc ml-4">
                          <li>
                            Los contratos permiten formalizar acuerdos de
                            trabajo
                          </li>
                          <li>
                            El proveedor debe aceptar el contrato para que sea
                            válido
                          </li>
                          <li>
                            Puedes actualizar el estado del contrato según el
                            progreso
                          </li>
                          <li>
                            Al completarse, ambas partes podrán calificarse
                            mutuamente
                          </li>
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
                    href="/work-contracts"
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#097EEC] text-white rounded-lg font-medium hover:bg-[#0A6BC7] transition-colors flex items-center justify-center disabled:opacity-50"
                    disabled={isLoading || !selectedProvider}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Creando contrato...
                      </>
                    ) : (
                      "Crear Contrato"
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

// Componente principal protegido con RoleGuard
const CreateWorkContractPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS", "PERSON"]}>
      <CreateWorkContractPageContent />
    </RoleGuard>
  );
};

export default CreateWorkContractPage;
