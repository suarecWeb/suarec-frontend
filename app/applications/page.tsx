/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import ApplicationService from "@/services/ApplicationService";
import MessageService from "@/services/MessageService";
import EmailVerificationService from "@/services/EmailVerificationService";
import { UserService } from "@/services/UsersService";
import { Application } from "@/interfaces/application.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import StartChatButton from "@/components/start-chat-button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Calendar,
  Eye,
  User,
  FileText,
  Clock,
  Building2,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
  UserCheck,
  X,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

const ApplicationsPageContent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [processingApplication, setProcessingApplication] = useState<
    string | null
  >(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [actionType, setActionType] = useState<
    "INTERVIEW" | "ACCEPTED" | "REJECTED" | null
  >(null);
  const [customMessage, setCustomMessage] = useState("");
  const [useDefaultMessage, setUseDefaultMessage] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Obtener información del usuario al cargar
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
        setUserRoles(decoded.roles.map((role) => role.name));
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  // Función para obtener información de la empresa del usuario
  const fetchCompanyInfo = async (userId: number) => {
    const token = Cookies.get("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    try {
      const response = await UserService.getUserById(userId);
      // El usuario contiene la información de la empresa si es de tipo BUSINESS
      if (response.data && response.data.company) {
        setCompanyInfo(response.data.company);
      } else {
        // Si no tiene empresa asociada, usar el nombre del usuario como fallback
        setCompanyInfo({ name: response.data.name || "Usuario" });
      }
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchCompanyInfo(currentUserId);
    }
  }, [currentUserId]);

  // Función para cargar aplicaciones
  const fetchApplications = async (
    params: PaginationParams = { page: 1, limit: pagination.limit },
  ) => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      // Obtener aplicaciones de la empresa del usuario actual
      const response = await ApplicationService.getCompanyApplications(
        currentUserId.toString(),
        params,
      );
      setApplications(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar las aplicaciones");
      console.error("Error al obtener aplicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchApplications();
    }
  }, [currentUserId]);

  const handlePageChange = (page: number) => {
    fetchApplications({ page, limit: pagination.limit });
  };

  // Función para obtener mensaje por defecto según el tipo de acción
  const getDefaultMessage = (
    application: Application,
    action: "INTERVIEW" | "ACCEPTED" | "REJECTED",
  ): string => {
    const candidateName = application.user?.name || "candidato";
    const jobTitle = application.publication?.title || "el trabajo";

    switch (action) {
      case "INTERVIEW":
        return `¡Hola ${candidateName}! 🎉 Tengo buenas noticias. Tu aplicación para "${jobTitle}" ha pasado a la siguiente etapa. Te invitamos a una entrevista. ¡Felicitaciones por llegar hasta aquí! Me pondré en contacto contigo pronto para coordinar los detalles.`;
      case "ACCEPTED":
        return `¡Excelentes noticias ${candidateName}! 🎊 Has sido seleccionado(a) para el puesto de "${jobTitle}". ¡Bienvenido(a) al equipo! Me comunicaré contigo para coordinar los próximos pasos y el proceso de incorporación.`;
      case "REJECTED":
        if (application.status === "PENDING") {
          return `Hola ${candidateName}, gracias por tu interés en "${jobTitle}". Aunque tu perfil es interesante, en esta ocasión hemos decidido continuar con otros candidatos que se ajustan más a los requerimientos específicos del puesto. Te animamos a seguir aplicando a futuras oportunidades. ¡Éxito en tu búsqueda laboral!`;
        } else if (application.status === "INTERVIEW") {
          return `Hola ${candidateName}, gracias por participar en el proceso de entrevista para "${jobTitle}". Después de una cuidadosa evaluación, hemos decidido continuar con otro candidato. Apreciamos el tiempo que dedicaste al proceso y te animamos a aplicar a futuras oportunidades. ¡Mucho éxito!`;
        }
        return `Hola ${candidateName}, gracias por tu interés en "${jobTitle}". En esta ocasión hemos decidido continuar con otro candidato. ¡Éxito en tu búsqueda laboral!`;
      default:
        return "";
    }
  };

  // Función para obtener descripción del email según el tipo de acción
  const getEmailDescription = (
    action: "INTERVIEW" | "ACCEPTED" | "REJECTED",
  ): string => {
    switch (action) {
      case "INTERVIEW":
        return "Tu aplicación ha progresado a la siguiente etapa del proceso de selección. ¡Felicitaciones!";
      case "ACCEPTED":
        return "¡Enhorabuena! Has sido seleccionado para formar parte de nuestro equipo.";
      case "REJECTED":
        return "Agradecemos tu interés y el tiempo dedicado al proceso de aplicación.";
      default:
        return "";
    }
  };

  // Función para abrir el modal de confirmación
  const openActionModal = (
    application: Application,
    action: "INTERVIEW" | "ACCEPTED" | "REJECTED",
  ) => {
    setSelectedApplication(application);
    setActionType(action);
    setCustomMessage(getDefaultMessage(application, action));
    setUseDefaultMessage(true);
    setShowActionModal(true);
  };

  // Función para cerrar el modal
  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedApplication(null);
    setActionType(null);
    setCustomMessage("");
    setUseDefaultMessage(true);
  };

  // Función para actualizar el estado de una aplicación
  const handleApplicationAction = async (messageContent?: string) => {
    if (!selectedApplication || !actionType || !currentUserId) return;

    const applicationId = selectedApplication.id!;
    setProcessingApplication(applicationId);

    try {
      // Actualizar el estado de la aplicación
      await ApplicationService.updateApplication(applicationId, {
        status: actionType,
      });

      // Usar el mensaje personalizado o por defecto
      const finalMessage = messageContent || customMessage;

      // Enviar mensaje automático al candidato (chat)
      if (finalMessage && selectedApplication.user?.id) {
        try {
          await MessageService.createMessage({
            content: finalMessage,
            senderId: currentUserId,
            recipientId: parseInt(selectedApplication.user.id),
          });
        } catch (messageError) {
          console.error("Error al enviar mensaje automático:", messageError);
        }
      }

      // Enviar notificación por email
      if (
        selectedApplication.user?.email &&
        selectedApplication.user?.name &&
        selectedApplication.publication?.title
      ) {
        try {
          await EmailVerificationService.sendApplicationStatusEmail({
            email: selectedApplication.user.email,
            candidateName: selectedApplication.user.name,
            companyName: companyInfo?.name || "La empresa",
            jobTitle: selectedApplication.publication.title,
            status: actionType,
            customMessage: finalMessage,
            customDescription: getEmailDescription(actionType),
          });
        } catch (emailError) {
          console.error("Error al enviar notificación por email:", emailError);
        }
      }

      // Actualizar la aplicación en el estado local
      setApplications(
        applications.map((app) =>
          app.id === applicationId
            ? { ...app, status: actionType, updated_at: new Date() }
            : app,
        ),
      );

      setError(null);
      closeActionModal();
    } catch (err) {
      console.error("Error al actualizar aplicación:", err);
      setError("No se pudo actualizar la aplicación. Inténtalo de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setProcessingApplication(null);
    }
  };

  // Filtrar aplicaciones según el término de búsqueda y estado
  const getFilteredApplications = () => {
    let filtered = applications;

    // Filtrar por estado según la pestaña activa
    if (activeTab !== "all") {
      filtered = filtered.filter((app) => {
        switch (activeTab) {
          case "pending":
            return app.status === "PENDING";
          case "interview":
            return app.status === "INTERVIEW";
          case "accepted":
            return app.status === "ACCEPTED";
          case "rejected":
            return app.status === "REJECTED";
          default:
            return true;
        }
      });
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.publication?.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (app.message &&
            app.message.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    return filtered;
  };

  const filteredApplications = getFilteredApplications();

  // Formatear fecha
  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: Date | string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "INTERVIEW":
        return "bg-blue-100 text-blue-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "INTERVIEW":
        return "En entrevista";
      case "ACCEPTED":
        return "Contratado";
      case "REJECTED":
        return "Rechazado";
      default:
        return status;
    }
  };

  // Renderizar tarjeta de aplicación
  const renderApplicationCard = (application: Application) => {
    const isProcessing = processingApplication === application.id;

    return (
      <div
        key={application.id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          {/* Header con información del usuario - Responsive */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 gap-3 lg:gap-0">
            <Link
              href={`/profile/${application.user?.id}`}
              className="flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#097EEC]/10 rounded-full p-2">
                  <User className="h-5 w-5 text-[#097EEC]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {application.user?.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {application.user?.email}
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex items-center flex-col justify-between mt-2 lg:mt-0 lg:justify-end gap-3 lg:flex-shrink-0">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}
              >
                {getStatusText(application.status)}
              </span>

              {/* Botón de chat */}
              {application.user?.id && (
                <StartChatButton
                  recipientId={parseInt(application.user.id)}
                  recipientName={application.user.name}
                  recipientType="person"
                  context="application"
                  className="flex-shrink-0"
                />
              )}
            </div>
          </div>

          {/* Información de la publicación */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Aplicó para:
              </span>
            </div>
            <p className="font-medium text-gray-800">
              {application.publication?.title}
            </p>
            {application.publication?.category && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {application.publication.category}
              </span>
            )}
          </div>

          {/* Mensaje de la aplicación */}
          {application.message && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Mensaje:
                </span>
              </div>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                {application.message}
              </p>
            </div>
          )}

          {/* Información adicional del candidato */}
          <div className="mb-4 space-y-2">
            {application.user?.cellphone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{application.user.cellphone}</span>
              </div>
            )}

            {application.user?.profession && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>{application.user.profession}</span>
              </div>
            )}

            {application.user?.cv_url && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <a
                  href={application.user.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#097EEC] hover:underline"
                >
                  Ver CV
                </a>
              </div>
            )}
          </div>

          {/* Skills del candidato */}
          {application.user?.skills && application.user.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Habilidades:
              </p>
              <div className="flex flex-wrap gap-1">
                {application.user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fecha de aplicación */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="h-3 w-3" />
            <span>
              Aplicó el {formatDate(application.created_at)} a las{" "}
              {formatTime(application.created_at)}
            </span>
          </div>

          {/* Acciones según el estado */}
          {application.status === "PENDING" && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => openActionModal(application, "INTERVIEW")}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Aceptar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openActionModal(application, "REJECTED")}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Rechazar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {application.status === "INTERVIEW" && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => openActionModal(application, "ACCEPTED")}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Contratar</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openActionModal(application, "REJECTED")}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Rechazar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Información adicional para aplicaciones finalizadas */}
          {(application.status === "ACCEPTED" ||
            application.status === "REJECTED") && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  Estado actualizado el {formatDate(application.updated_at)} a
                  las {formatTime(application.updated_at)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Aplicaciones</h1>
            <p className="mt-2 text-blue-100">
              Gestiona las aplicaciones recibidas para tus publicaciones
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar aplicaciones..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Tabs for filtering applications */}
            <Tabs
              defaultValue="pending"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-2 h-auto sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2 mb-6 w-full sm:w-auto p-1">
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2 h-auto whitespace-nowrap"
                >
                  Pendientes
                </TabsTrigger>
                <TabsTrigger
                  value="interview"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2 h-auto whitespace-nowrap"
                >
                  En entrevista
                </TabsTrigger>
                <TabsTrigger
                  value="accepted"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2 h-auto whitespace-nowrap col-span-2 sm:col-span-1"
                >
                  Contratados
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2 h-auto whitespace-nowrap"
                >
                  Rechazados
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2 h-auto whitespace-nowrap"
                >
                  Todas
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="py-32 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : (
                  <>
                    {filteredApplications.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                        {filteredApplications.map((application) =>
                          renderApplicationCard(application),
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <Briefcase className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {activeTab === "pending" &&
                            "No hay aplicaciones pendientes"}
                          {activeTab === "interview" &&
                            "No hay aplicaciones en entrevista"}
                          {activeTab === "accepted" &&
                            "No hay aplicaciones contratadas"}
                          {activeTab === "rejected" &&
                            "No hay aplicaciones rechazadas"}
                          {activeTab === "all" &&
                            "No hay aplicaciones disponibles"}
                        </h3>
                        <p className="mt-2 text-gray-500">
                          {searchTerm
                            ? "No se encontraron aplicaciones que coincidan con tu búsqueda."
                            : "Las aplicaciones aparecerán aquí cuando los usuarios apliquen a tus publicaciones."}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}

                    {/* Results Summary */}
                    {!loading && !error && filteredApplications.length > 0 && (
                      <div className="mt-6 text-sm text-gray-500 text-center">
                        Mostrando {filteredApplications.length} de{" "}
                        {pagination.total} aplicaciones
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Modal de confirmación de acción */}
        {showActionModal && selectedApplication && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div
                className={`px-6 py-4 border-b border-gray-200 ${
                  actionType === "ACCEPTED"
                    ? "bg-green-50"
                    : actionType === "INTERVIEW"
                      ? "bg-blue-50"
                      : "bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`text-lg font-semibold ${
                      actionType === "ACCEPTED"
                        ? "text-green-800"
                        : actionType === "INTERVIEW"
                          ? "text-blue-800"
                          : "text-red-800"
                    }`}
                  >
                    {actionType === "ACCEPTED" && "🎊 Contratar candidato"}
                    {actionType === "INTERVIEW" && "🎉 Invitar a entrevista"}
                    {actionType === "REJECTED" && "📝 Rechazar aplicación"}
                  </h3>
                  <button
                    onClick={closeActionModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                {/* Información del candidato */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-800">
                      {selectedApplication.user?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>
                      Aplicó para: {selectedApplication.publication?.title}
                    </span>
                  </div>
                </div>

                {/* Opciones de mensaje */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mensaje que se enviará al candidato:
                  </label>

                  {/* Toggle entre mensaje por defecto y personalizado */}
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={useDefaultMessage}
                        onChange={() => {
                          setUseDefaultMessage(true);
                          setCustomMessage(
                            getDefaultMessage(selectedApplication, actionType),
                          );
                        }}
                        className="mr-2 text-[#097EEC] focus:ring-[#097EEC]"
                      />
                      <span className="text-sm text-gray-700">
                        Usar mensaje por defecto
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!useDefaultMessage}
                        onChange={() => setUseDefaultMessage(false)}
                        className="mr-2 text-[#097EEC] focus:ring-[#097EEC]"
                      />
                      <span className="text-sm text-gray-700">
                        Personalizar mensaje
                      </span>
                    </label>
                  </div>

                  {/* Área de texto del mensaje */}
                  <div className="relative">
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      disabled={useDefaultMessage}
                      placeholder="Escribe tu mensaje personalizado..."
                      className={`w-full p-4 border-2 rounded-xl focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none text-sm ${
                        useDefaultMessage
                          ? "bg-gray-50 border-gray-200 text-gray-600"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                      rows={6}
                      maxLength={1000}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                      {customMessage.length}/1000
                    </div>
                  </div>

                  {useDefaultMessage && (
                    <p className="mt-2 text-xs text-gray-500">
                      Se usará el mensaje por defecto mostrado arriba. Puedes
                      seleccionar "Personalizar mensaje" para editarlo.
                    </p>
                  )}
                </div>

                {/* Vista previa del estado */}
                <div className="mb-6 p-4 border-l-4 border-gray-300 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Acción:</strong> El estado de la aplicación cambiará
                    a{" "}
                    <span
                      className={`font-medium ${
                        actionType === "ACCEPTED"
                          ? "text-green-600"
                          : actionType === "INTERVIEW"
                            ? "text-blue-600"
                            : "text-red-600"
                      }`}
                    >
                      {getStatusText(actionType)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Notificación:</strong> El candidato recibirá el
                    mensaje en su chat.
                  </p>
                </div>
              </div>

              {/* Footer con botones */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={closeActionModal}
                  disabled={processingApplication !== null}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleApplicationAction()}
                  disabled={
                    processingApplication !== null || !customMessage.trim()
                  }
                  className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                    actionType === "ACCEPTED"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionType === "INTERVIEW"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processingApplication ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      {actionType === "ACCEPTED" && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {actionType === "INTERVIEW" && (
                        <UserCheck className="h-4 w-4" />
                      )}
                      {actionType === "REJECTED" && (
                        <XCircle className="h-4 w-4" />
                      )}
                      <span>
                        {actionType === "ACCEPTED" &&
                          "Contratar y enviar mensaje"}
                        {actionType === "INTERVIEW" && "Invitar a entrevista"}
                        {actionType === "REJECTED" &&
                          "Rechazar y enviar mensaje"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Componente principal protegido con RoleGuard - solo empresas pueden ver aplicaciones
const ApplicationsPage = () => {
  return (
    <RoleGuard allowedRoles={["BUSINESS", "ADMIN"]}>
      <ApplicationsPageContent />
    </RoleGuard>
  );
};

export default ApplicationsPage;
