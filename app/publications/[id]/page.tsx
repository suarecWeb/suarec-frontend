/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PublicationService from "@/services/PublicationsService";
import ApplicationService from "@/services/ApplicationService";
import { UserService } from "@/services/UsersService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Edit,
  Trash2,
  Share2,
  ChevronRight,
  Eye,
  Tag,
  Building2,
  Send,
  Loader2,
  Briefcase,
  HandHeart,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/interfaces/publication.interface";
import { TokenPayload } from "@/interfaces/auth.interface";
import { User } from "@/interfaces/user.interface";
import { Comment } from "@/interfaces/comment.interface";
import CommentService from "@/services/CommentsService";
import MessageService from "@/services/MessageService";
import ContractModal from "@/components/contract-modal";
import { ContractService } from "@/services/ContractService";
import { Contract } from "@/interfaces/contract.interface";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";
import {
  translatePriceUnit,
  getPublicationDisplayPrice,
  isUserCompany,
} from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import RatingService from "@/services/RatingService";
import { Star } from "lucide-react";
import toast from "react-hot-toast";

const PublicationDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  // Estados para aplicaciones
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationPrice, setApplicationPrice] = useState("");
  const [applicationPriceUnit, setApplicationPriceUnit] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Estados para contratación
  const [showContractModal, setShowContractModal] = useState(false);

  // Estados para ofertas
  const [publicationBids, setPublicationBids] = useState<{
    contracts: Contract[];
    totalBids: number;
  }>({ contracts: [], totalBids: 0 });
  const [isLoadingBids, setIsLoadingBids] = useState(false);

  // Estados para aplicaciones
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  // Estados para calificaciones del usuario
  const [userRatingStats, setUserRatingStats] = useState<{
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
    categoryStats: { [category: string]: { average: number; count: number } };
  } | null>(null);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);

  useEffect(() => {
    const fetchPublicationDetails = async () => {
      try {
        setIsLoading(true);

        if (!params.id) {
          toast.error("ID de publicación no encontrado");
          setIsLoading(false);
          return;
        }

        // Obtener el token y decodificarlo
        const token = Cookies.get("token");
        let decoded: TokenPayload | null = null;

        if (token) {
          decoded = jwtDecode<TokenPayload>(token);
          setCurrentUserId(decoded.id);
          setUserRoles(decoded.roles.map((role) => role.name));
        }

        // Obtener detalles de la publicación
        const publicationId = Array.isArray(params.id)
          ? params.id[0]
          : params.id;
        const response =
          await PublicationService.getPublicationById(publicationId);
        const publicationData = response.data;

        setPublication(publicationData);
        console.log(response.data.user?.id + " pub data");
        // Obtener información del autor
        if (publicationData.user?.id) {
          const authorResponse = await UserService.getUserById(
            parseInt(publicationData.user.id),
          );
          console.log(authorResponse + " obtener user by id");
          setAuthor(authorResponse.data);

          // Cargar estadísticas de calificaciones del autor
          await loadUserRatingStats(parseInt(publicationData.user.id));
        }

        // Obtener comentarios
        if (publicationData.comments) {
          setComments(publicationData.comments);
        }

        // Verificar si el usuario ya aplicó (solo si no es el autor y está logueado)
        if (publicationData.user?.id) {
          if (decoded && parseInt(publicationData.user.id) !== decoded.id) {
            try {
              const applicationCheck =
                await ApplicationService.checkUserApplication(
                  decoded.id.toString(),
                  publicationId,
                );
              setHasApplied(applicationCheck.data.hasApplied);
              if (applicationCheck.data.application) {
                setApplicationId(applicationCheck.data.application.id || null);
              }
            } catch (err) {
              // Si hay error, asumimos que no ha aplicado
              setHasApplied(false);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles de la publicación:", err);
        toast.error("No se pudo cargar la publicación");
        setIsLoading(false);
      }
    };

    fetchPublicationDetails();
  }, [params.id]);

  // Cargar ofertas cuando la publicación esté disponible
  useEffect(() => {
    if (publication?.id) {
      loadPublicationBids();
      // Si es una solicitud de servicio, también cargar aplicaciones
      if (publication.type === "SERVICE_REQUEST") {
        loadApplications();
      }
    }
  }, [publication?.id]);

  const handleDeletePublication = async () => {
    if (!publication?.id) return;

    try {
      await PublicationService.deletePublication(publication.id);
      router.push("/feed");
    } catch (err) {
      console.error("Error al eliminar la publicación:", err);
      toast.error("No se pudo eliminar la publicación");
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditPublication = () => {
    if (!publication || !currentUserId) return false;

    // Obtener el ID del propietario de la publicación
    const publicationUserId = publication.user?.id || publication.userId;
    if (!publicationUserId) return false;

    // Asegurar que ambos IDs sean números para comparación correcta
    const currentUserIdNumber = Number(currentUserId);
    const publicationUserIdNumber = Number(publicationUserId);

    // Debug logs
    console.log("🔍 Debug autorización (detalle):", {
      currentUserId,
      currentUserIdNumber,
      publicationUserId: publicationUserId,
      publicationUserIdNumber,
      publicationUser: publication.user,
      userRoles,
      isOwner: publicationUserId == currentUserId,
      isAdmin: userRoles.includes("ADMIN"),
    });

    return publicationUserId == currentUserId || userRoles.includes("ADMIN");
  };

  // Función para determinar si la publicación es de una empresa
  const isCompanyPublication = () => {
    console.log("🔍 Debug empresa:", {
      author: author,
      hasCompany: author?.company !== undefined && author?.company !== null,
    });
    return author?.company !== undefined && author?.company !== null;
  };

  // Función para manejar la aplicación a una publicación
  const handleApply = async () => {
    if (!currentUserId || !publication?.id) return;

    setIsApplying(true);

    try {
      const applicationData = {
        userId: currentUserId,
        publicationId: publication.id,
        message: applicationMessage.trim() || undefined,
        price: applicationPrice ? Number(applicationPrice) : undefined,
        priceUnit: applicationPriceUnit || undefined,
      };

      const response =
        await ApplicationService.createApplication(applicationData);

      setHasApplied(true);
      setApplicationId(response.data.id || null);
      setShowApplicationModal(false);
      setApplicationMessage("");
      setApplicationPrice("");
      setApplicationPriceUnit("");

      // Mostrar mensaje de éxito
      setError(null);
      // Podrías mostrar un toast de éxito aquí
    } catch (err: any) {
      console.error("Error al aplicar:", err);
      toast.error(
        err.response?.data?.message ||
          "No se pudo enviar la aplicación. Inténtalo de nuevo.",
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Función para manejar contratar (nuevo sistema de contrataciones)
  const handleHire = () => {
    setShowContractModal(true);
  };

  // Función para compartir la publicación
  const handleShare = () => {
    if (navigator.share && window) {
      navigator
        .share({
          title: publication?.title || "Publicación en SUAREC",
          text: publication?.description || "Mira esta publicación en SUAREC",
          url: window.location.href,
        })
        .catch((error) => console.log("Error al compartir:", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("Enlace copiado al portapapeles"))
        .catch((error) => toast.error("Error al copiar enlace:", error));
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUserId || !publication?.id) return;

    setIsSubmittingComment(true);

    try {
      const commentData = {
        description: commentText,
        created_at: new Date(),
        publicationId: publication.id,
        userId: currentUserId,
      };

      const response = await CommentService.createComment(commentData);
      const newComment = response.data;

      const commentForUI = {
        ...newComment,
        user: {
          id: currentUserId,
          name: "Tú",
        },
      };

      setComments([commentForUI, ...comments]);
      setCommentText("");
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      toast.error("No se pudo enviar el comentario. Inténtalo de nuevo.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Función para cargar ofertas de la publicación
  const loadPublicationBids = async () => {
    if (!publication?.id) return;

    try {
      setIsLoadingBids(true);
      const bidsData = await ContractService.getPublicationBids(publication.id);
      setPublicationBids(bidsData);
    } catch (error) {
      console.error("Error loading publication bids:", error);
    } finally {
      setIsLoadingBids(false);
    }
  };

  const loadUserRatingStats = async (userId: number) => {
    try {
      setIsLoadingRatings(true);
      const stats = await RatingService.getUserRatingStats(userId);
      setUserRatingStats(stats);
    } catch (error) {
      console.error("Error loading user rating stats:", error);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  // Función para cargar aplicaciones de una solicitud
  const loadApplications = async () => {
    if (!publication?.id) return;

    try {
      setIsLoadingApplications(true);
      const response = await ApplicationService.getPublicationApplications(
        publication.id,
      );
      console.log("🔍 Debug - Aplicaciones cargadas:", response.data.data);

      // Log detallado de cada aplicación
      response.data.data.forEach((app: any, index: number) => {
        console.log(`🔍 Debug - Aplicación ${index + 1}:`, {
          id: app.id,
          price: app.price,
          priceUnit: app.priceUnit,
          message: app.message,
          status: app.status,
          user: app.user?.name,
        });
      });

      setApplications(response.data.data || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Función para aceptar una aplicación
  const handleAcceptApplication = async (applicationId: string) => {
    try {
      console.log("Intentando aceptar aplicación:", applicationId);
      const response = await ApplicationService.updateApplication(
        applicationId,
        {
          status: "ACCEPTED",
        },
      );
      console.log("Respuesta del servidor:", response);
      toast.success("Aplicación aceptada");
      // Recargar aplicaciones
      loadApplications();
    } catch (error: any) {
      console.error("Error accepting application:", error);
      console.error("Error details:", error.response?.data);
      toast.error("No se pudo aceptar la aplicación. Inténtalo de nuevo.");
    }
  };

  // Función para rechazar una aplicación
  const handleRejectApplication = async (applicationId: string) => {
    try {
      console.log("Intentando rechazar aplicación:", applicationId);
      const response = await ApplicationService.updateApplication(
        applicationId,
        {
          status: "REJECTED",
        },
      );
      console.log("Respuesta del servidor:", response);
      toast.success("Aplicación rechazada");
      // Recargar aplicaciones
      loadApplications();
    } catch (error: any) {
      console.error("Error rejecting application:", error);
      console.error("Error details:", error.response?.data);
      toast.error("No se pudo rechazar la aplicación. Inténtalo de nuevo.");
    }
  };

  // Función para iniciar el servicio (cambiar a EN_PROGRESO)
  const handleStartService = async (applicationId: string) => {
    try {
      console.log("Intentando iniciar servicio:", applicationId);
      const response = await ApplicationService.updateApplication(
        applicationId,
        {
          status: "IN_PROGRESS",
        },
      );
      console.log("Respuesta del servidor:", response);
      toast.success("Servicio iniciado");
      // Recargar aplicaciones
      loadApplications();
    } catch (error: any) {
      console.error("Error starting service:", error);
      console.error("Error details:", error.response?.data);
      toast.error("No se pudo iniciar el servicio. Inténtalo de nuevo.");
    }
  };

  // Función para terminar el servicio
  const handleCompleteService = async (applicationId: string) => {
    try {
      console.log("Intentando terminar servicio:", applicationId);
      const response = await ApplicationService.updateApplication(
        applicationId,
        {
          status: "COMPLETED",
        },
      );
      console.log("Respuesta del servidor:", response);
      toast.success("Servicio completado. Procede con el pago.");
      // Recargar aplicaciones
      loadApplications();
    } catch (error: any) {
      console.error("Error completing service:", error);
      console.error("Error details:", error.response?.data);
      toast.error("No se pudo completar el servicio. Inténtalo de nuevo.");
    }
  };

  // Función para ir al chat
  const handleGoToChat = (application: any) => {
    // Navegar al chat con el aplicante usando el parámetro 'sender'
    router.push(`/chat?sender=${application.user?.id}`);
  };

  // Función para proceder con el pago
  const handleProceedToPayment = (application: any) => {
    // Navegar a la página de pagos con los datos de la aplicación
    const paymentData = {
      amount: application.price,
      recipientId: application.user?.id,
      recipientName: application.user?.name,
      serviceDescription: publication?.title,
      applicationId: application.id,
    };

    // Guardar los datos de pago en localStorage para la página de pagos
    localStorage.setItem("pendingPayment", JSON.stringify(paymentData));

    // Navegar a la página de pagos
    router.push("/payments");
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Detalles de Publicación</h1>
            <p className="mt-2 text-blue-100">
              Información completa sobre la publicación
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
                <Link
                  href="/publications"
                  className="text-red-600 hover:underline mt-2 inline-block"
                >
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Volver a publicaciones
                </Link>
              </div>
            </div>
          )}

          {/* Modal de aplicación */}
          {showApplicationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {publication?.type === "SERVICE_REQUEST"
                    ? "Aplicar a esta solicitud"
                    : "Aplicar a esta publicación"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {publication?.type === "SERVICE_REQUEST"
                    ? "¿Estás interesado en esta solicitud? Puedes enviar un mensaje opcional junto con tu propuesta."
                    : "¿Estás interesado en esta oportunidad? Puedes enviar un mensaje opcional junto con tu aplicación."}
                </p>

                <textarea
                  placeholder="Escribe un mensaje opcional..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  rows={4}
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  disabled={isApplying}
                />

                {/* Campos de precio para solicitudes de servicio */}
                {publication?.type === "SERVICE_REQUEST" && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio propuesto
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        placeholder="Ej: 50000"
                        value={applicationPrice}
                        onChange={(e) => setApplicationPrice(e.target.value)}
                        disabled={isApplying}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidad
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        value={applicationPriceUnit}
                        onChange={(e) =>
                          setApplicationPriceUnit(e.target.value)
                        }
                        disabled={isApplying}
                      >
                        <option value="">Seleccionar</option>
                        <option value="hour">Por hora</option>
                        <option value="day">Por día</option>
                        <option value="service">Por servicio</option>
                        <option value="project">Por proyecto</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setApplicationMessage("");
                      setApplicationPrice("");
                      setApplicationPriceUnit("");
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                    disabled={isApplying}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-[#097EEC] hover:bg-[#0A6BC7] text-white rounded-lg transition-colors flex items-center gap-2"
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4" />
                        Aplicar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm delete modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ¿Confirmar eliminación?
                </h3>
                <p className="text-gray-600 mb-6">
                  Esta acción eliminará permanentemente la publicación "
                  {publication?.title}" y no podrá ser recuperada.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletePublication}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Navigation breadcrumbs */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Link
                  href="/"
                  className="hover:text-[#097EEC] transition-colors"
                >
                  Inicio
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link
                  href="/feed"
                  className="hover:text-[#097EEC] transition-colors"
                >
                  Publicaciones
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-gray-800 font-medium">Detalles</span>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-64 w-full" />
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-48 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              publication && (
                <>
                  {/* Publication Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {publication.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Publicado el {formatDate(publication.created_at)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-[#097EEC] rounded-full text-xs font-medium">
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            {publication.category}
                          </span>
                          {publication.price && (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                              <span className="font-semibold">
                                {(() => {
                                  const basePrice = publication.price;
                                  const isProviderCompany = isUserCompany(
                                    publication.user,
                                  );
                                  const priceInfo = getPublicationDisplayPrice(
                                    basePrice,
                                    publication.type,
                                    publication.priceUnit,
                                    isProviderCompany,
                                  );
                                  console.log("🔍 Debug precio header:", {
                                    basePrice,
                                    displayPrice: priceInfo.price,
                                    showsTax: priceInfo.showsTax,
                                  });
                                  return formatCurrency(priceInfo.price);
                                })()}
                              </span>
                              <span className="ml-1">
                                {translatePriceUnit(
                                  publication.priceUnit || "",
                                )}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShare}
                          className="p-2 text-gray-500 hover:text-[#097EEC] hover:bg-blue-50 rounded-full transition-colors"
                          aria-label="Compartir"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>

                        {canEditPublication() && (
                          <>
                            <Link href={`/publications/${publication.id}/edit`}>
                              <button
                                className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                                aria-label="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Botones de Aplicar/Contratar */}
                    {currentUserId && publication.userId !== currentUserId && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        {publication.type === "SERVICE_REQUEST" ? (
                          // Botón para aplicar a solicitud de servicio
                          <div className="flex flex-col sm:flex-row gap-4">
                            {hasApplied ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">
                                  Ya aplicaste a esta solicitud
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowApplicationModal(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                                disabled={isApplying}
                              >
                                <Briefcase className="h-5 w-5" />
                                Aplicar a esta solicitud
                              </button>
                            )}
                          </div>
                        ) : isCompanyPublication() ? (
                          // Botón para aplicar a empresa
                          <div className="flex flex-col sm:flex-row gap-4">
                            {hasApplied ? (
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">
                                  Ya aplicaste a esta publicación
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowApplicationModal(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                                disabled={isApplying}
                              >
                                <Briefcase className="h-5 w-5" />
                                Aplicar a esta oportunidad
                              </button>
                            )}
                          </div>
                        ) : (
                          // Botón para contratar servicio ofrecido
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button
                              onClick={handleHire}
                              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                            >
                              <HandHeart className="h-5 w-5" />
                              Contratar este servicio
                            </button>
                          </div>
                        )}

                        <p className="text-sm text-gray-500 mt-3">
                          {publication.type === "SERVICE_REQUEST"
                            ? "Al aplicar, el solicitante podrá ver tu perfil y propuesta para decidir si te contrata."
                            : isCompanyPublication()
                              ? "Al aplicar, la empresa podrá ver tu perfil y decidir si contactarte."
                              : "Inicia el proceso de contratación con negociación de precios."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Main Content */}
                  <div className="grid md:grid-cols-3 gap-6 p-6">
                    {/* Left column - Publication details */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Publication images */}
                      {(publication.gallery_images &&
                        publication.gallery_images.length > 0) ||
                      publication.image_url ? (
                        <div className="space-y-4">
                          {publication.gallery_images &&
                          publication.gallery_images.length > 0 ? (
                            // Mostrar galería de imágenes
                            <div className="space-y-4">
                              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                                Galería de Imágenes
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {publication.gallery_images.map(
                                  (imageUrl, index) => (
                                    <div
                                      key={index}
                                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt={`${publication.title} - Imagen ${index + 1}`}
                                        width={300}
                                        height={300}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                      />
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : publication.image_url ? (
                            // Mostrar imagen principal si no hay galería
                            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
                              <Image
                                src={publication.image_url}
                                alt={publication.title}
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        // Placeholder cuando no hay imágenes
                        <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <div className="text-blue-600 text-center">
                            <Building2 className="h-20 w-20 mx-auto mb-4 opacity-60" />
                            <p className="text-lg font-medium">Sin imágenes</p>
                            <p className="text-sm text-blue-500 mt-2">
                              Esta publicación no incluye imágenes
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Publication description */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                          Descripción
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {publication.description ||
                              "No hay descripción disponible."}
                          </p>
                        </div>
                      </div>

                      {/* Campos específicos para solicitudes de servicio */}
                      {publication.type === "SERVICE_REQUEST" && (
                        <div className="space-y-4">
                          {publication.requirements && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                                Requisitos Específicos
                              </h4>
                              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {publication.requirements}
                              </p>
                            </div>
                          )}

                          {publication.location && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                                Ubicación
                              </h4>
                              <p className="text-gray-700">
                                {publication.location}
                              </p>
                            </div>
                          )}

                          {publication.urgency && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                                Urgencia
                              </h4>
                              <p className="text-gray-700">
                                {publication.urgency === "low" &&
                                  "Baja (1-2 semanas)"}
                                {publication.urgency === "medium" &&
                                  "Media (3-5 días)"}
                                {publication.urgency === "high" &&
                                  "Alta (1-2 días)"}
                                {publication.urgency === "urgent" &&
                                  "Urgente (Hoy/Mañana)"}
                              </p>
                            </div>
                          )}

                          {publication.preferredSchedule && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                                Horario Preferido
                              </h4>
                              <p className="text-gray-700">
                                {publication.preferredSchedule === "morning" &&
                                  "Mañana (8:00 AM - 12:00 PM)"}
                                {publication.preferredSchedule ===
                                  "afternoon" && "Tarde (12:00 PM - 6:00 PM)"}
                                {publication.preferredSchedule === "evening" &&
                                  "Noche (6:00 PM - 10:00 PM)"}
                                {publication.preferredSchedule === "weekend" &&
                                  "Fines de semana"}
                                {publication.preferredSchedule === "flexible" &&
                                  "Horario flexible"}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ofertas recibidas - Solo mostrar si es el autor de la publicación */}
                      {currentUserId &&
                        publication.userId === currentUserId &&
                        !isCompanyPublication() && (
                          <div className="border-t border-gray-200 pt-6 mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                              <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                              <TrendingUp className="h-5 w-5 text-[#097EEC]" />
                              {publication.type === "SERVICE_REQUEST"
                                ? "Aplicaciones Recibidas"
                                : "Ofertas Recibidas"}
                              {publicationBids.totalBids > 0 && (
                                <span className="bg-[#097EEC] text-white text-sm px-2 py-1 rounded-full">
                                  {publicationBids.totalBids}
                                </span>
                              )}
                            </h3>

                            {isLoadingBids ? (
                              <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                  >
                                    <Skeleton className="h-4 w-32 mb-2" />
                                    <Skeleton className="h-3 w-48" />
                                  </div>
                                ))}
                              </div>
                            ) : publicationBids.contracts.length > 0 ? (
                              <div className="space-y-4">
                                {publicationBids.contracts.map((contract) => (
                                  <div
                                    key={contract.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#097EEC] rounded-full flex items-center justify-center">
                                          <UserIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            {contract.client?.name || "Usuario"}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {formatDate(contract.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-green-600">
                                          $
                                          {contract.currentPrice?.toLocaleString()}{" "}
                                          {contract.priceUnit}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {contract.status === "pending"
                                            ? "Pendiente"
                                            : contract.status === "negotiating"
                                              ? "En negociación"
                                              : contract.status === "accepted"
                                                ? "Aceptado"
                                                : contract.status}
                                        </p>
                                      </div>
                                    </div>

                                    {contract.clientMessage && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {contract.clientMessage}
                                      </p>
                                    )}

                                    {contract.bids &&
                                      contract.bids.length > 0 && (
                                        <div className="bg-gray-50 rounded-lg p-3">
                                          <p className="text-xs font-medium text-gray-700 mb-2">
                                            Ofertas en esta contratación:
                                          </p>
                                          <div className="space-y-2">
                                            {contract.bids.map((bid) => (
                                              <div
                                                key={bid.id}
                                                className="flex justify-between items-center text-sm"
                                              >
                                                <span className="text-gray-600">
                                                  {bid.bidder?.name ||
                                                    "Usuario"}
                                                  : $
                                                  {bid.amount?.toLocaleString()}
                                                </span>
                                                {bid.isAccepted && (
                                                  <span className="text-green-600 text-xs font-medium">
                                                    ✓ Aceptada
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                    <div className="flex gap-2 mt-3">
                                      <Link href={`/contracts`}>
                                        <button className="px-4 py-2 bg-[#097EEC] text-white text-sm rounded-lg hover:bg-[#097EEC]/90 transition-colors">
                                          Ver detalles
                                        </button>
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>
                                  No hay ofertas aún. ¡Las ofertas aparecerán
                                  aquí cuando alguien contrate tu servicio!
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Aplicaciones recibidas - Solo mostrar si es el autor de una solicitud */}
                      {currentUserId &&
                        publication.userId === currentUserId &&
                        publication.type === "SERVICE_REQUEST" && (
                          <div className="border-t border-gray-200 pt-6 mt-8">
                            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                              <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                              <Briefcase className="h-5 w-5 text-green-500" />
                              Aplicaciones Recibidas
                              {applications.length > 0 && (
                                <span className="bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                                  {applications.length}
                                </span>
                              )}
                            </h3>

                            {isLoadingApplications ? (
                              <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                  >
                                    <Skeleton className="h-4 w-32 mb-2" />
                                    <Skeleton className="h-3 w-48" />
                                  </div>
                                ))}
                              </div>
                            ) : applications.length > 0 ? (
                              <div className="space-y-4">
                                {applications.map((application) => (
                                  <div
                                    key={application.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                          <UserIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-900">
                                            {application.user?.name ||
                                              "Usuario"}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {formatDate(application.created_at)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${
                                            application.status === "PENDING"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : application.status ===
                                                  "ACCEPTED"
                                                ? "bg-green-100 text-green-800"
                                                : application.status ===
                                                    "IN_PROGRESS"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : application.status ===
                                                      "COMPLETED"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : application.status ===
                                                        "REJECTED"
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {application.status === "PENDING" &&
                                            "Pendiente"}
                                          {application.status === "ACCEPTED" &&
                                            "Aceptada"}
                                          {application.status ===
                                            "IN_PROGRESS" && "En Progreso"}
                                          {application.status === "COMPLETED" &&
                                            "Completado"}
                                          {application.status === "REJECTED" &&
                                            "Rechazada"}
                                        </span>
                                      </div>
                                    </div>

                                    {application.message && (
                                      <p className="text-sm text-gray-600 mb-3">
                                        {application.message}
                                      </p>
                                    )}

                                    {/* Mostrar precio si existe */}
                                    {application.price && (
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-green-800">
                                            Precio propuesto:
                                          </span>
                                          <span className="text-lg font-bold text-green-600">
                                            $
                                            {application.price.toLocaleString()}
                                          </span>
                                        </div>
                                        {application.priceUnit && (
                                          <span className="text-xs text-green-600">
                                            por {application.priceUnit}
                                          </span>
                                        )}
                                      </div>
                                    )}

                                    {/* Botones de acción según el estado y el rol del usuario */}
                                    {(() => {
                                      const isOwner =
                                        currentUserId ===
                                        Number(publication?.user?.id);
                                      console.log(
                                        "🔍 Debug autorización botones:",
                                        {
                                          currentUserId,
                                          publicationUserId:
                                            publication?.user?.id,
                                          publicationUserIdNumber: Number(
                                            publication?.user?.id,
                                          ),
                                          isOwner,
                                          applicationStatus: application.status,
                                          applicationId: application.id,
                                          publication: publication,
                                        },
                                      );

                                      // Mostrar siempre para debug
                                      console.log(
                                        "🔍 Mostrando botones para aplicación:",
                                        application.status,
                                      );

                                      return isOwner;
                                    })() && (
                                      <div className="flex gap-2 mt-3">
                                        {/* Botones para aplicaciones pendientes */}
                                        {application.status === "PENDING" && (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleAcceptApplication(
                                                  application.id,
                                                )
                                              }
                                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                              Aceptar
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleRejectApplication(
                                                  application.id,
                                                )
                                              }
                                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                              Rechazar
                                            </button>
                                          </>
                                        )}

                                        {/* Botones para aplicaciones aceptadas */}
                                        {application.status === "ACCEPTED" && (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleGoToChat(application)
                                              }
                                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                              <MessageCircle className="h-4 w-4" />
                                              Ir al Chat
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleStartService(
                                                  application.id,
                                                )
                                              }
                                              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                                            >
                                              Iniciar Servicio
                                            </button>
                                          </>
                                        )}

                                        {/* Botones para servicios en progreso */}
                                        {application.status ===
                                          "IN_PROGRESS" && (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleGoToChat(application)
                                              }
                                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                              <MessageCircle className="h-4 w-4" />
                                              Ir al Chat
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleCompleteService(
                                                  application.id,
                                                )
                                              }
                                              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                              Terminar Servicio
                                            </button>
                                          </>
                                        )}

                                        {/* Estado completado */}
                                        {application.status === "COMPLETED" && (
                                          <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
                                              <CheckCircle className="h-5 w-5" />
                                              <span className="text-sm font-medium">
                                                Servicio completado
                                              </span>
                                            </div>
                                            <button
                                              onClick={() =>
                                                handleProceedToPayment(
                                                  application,
                                                )
                                              }
                                              className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                              <span className="font-medium">
                                                Proceder con el Pago
                                              </span>
                                              <span className="text-xs">
                                                $
                                                {application.price?.toLocaleString() ||
                                                  0}
                                              </span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* DEBUG: Mostrar botones sin autorización temporalmente */}
                                    {application.status === "ACCEPTED" && (
                                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-xs text-yellow-800 mb-2">
                                          🔍 DEBUG - Botones sin autorización:
                                        </p>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() =>
                                              handleGoToChat(application)
                                            }
                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                          >
                                            <MessageCircle className="h-4 w-4" />
                                            Ir al Chat
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleStartService(application.id)
                                            }
                                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                                          >
                                            Iniciar Servicio
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    <Link
                                      href={`/profile/${application.user?.id}`}
                                    >
                                      <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                        Ver perfil
                                      </button>
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>
                                  No hay aplicaciones aún. ¡Las aplicaciones
                                  aparecerán aquí cuando alguien aplique a tu
                                  solicitud!
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Comments section */}
                      <div className="border-t border-gray-200 pt-6 mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                          <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                          <MessageSquare className="h-5 w-5 text-[#097EEC]" />
                          Comentarios
                        </h3>

                        {/* Comment form */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                          <textarea
                            placeholder="Deja un comentario..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={!currentUserId || isSubmittingComment}
                          ></textarea>
                          <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-500">
                              {!currentUserId && (
                                <span>
                                  <Link
                                    href="/auth/login"
                                    className="text-[#097EEC] hover:underline font-medium"
                                  >
                                    Inicia sesión
                                  </Link>{" "}
                                  para comentar
                                </span>
                              )}
                            </p>
                            <button
                              className="px-6 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              disabled={
                                !commentText.trim() ||
                                !currentUserId ||
                                isSubmittingComment
                              }
                              onClick={handleSubmitComment}
                            >
                              {isSubmittingComment ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Comentar
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Comments list */}
                        <div className="space-y-4">
                          {comments.length > 0 ? (
                            comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-4">
                                    {comment.user?.id &&
                                    comment.user.id !== "" &&
                                    comment.user.id !== "undefined" ? (
                                      <Link
                                        href={`/profile/${comment.user.id}`}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                      >
                                        <div className="bg-[#097EEC] rounded-full p-3 text-white">
                                          <UserIcon className="h-5 w-5" />
                                        </div>
                                      </Link>
                                    ) : (
                                      <div className="bg-[#097EEC] rounded-full p-3 text-white">
                                        <UserIcon className="h-5 w-5" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      {comment.user?.id &&
                                      comment.user.id !== "" &&
                                      comment.user.id !== "undefined" ? (
                                        <Link
                                          href={`/profile/${comment.user.id}`}
                                          className="hover:text-[#097EEC] transition-colors cursor-pointer"
                                        >
                                          <p className="font-semibold text-gray-800">
                                            {comment.user?.name || "Usuario"}
                                          </p>
                                        </Link>
                                      ) : (
                                        <p className="font-semibold text-gray-800">
                                          {comment.user?.name || "Usuario"}
                                        </p>
                                      )}
                                      <p className="text-sm text-gray-500 mb-2">
                                        {formatDate(comment.created_at)} a las{" "}
                                        {formatTime(comment.created_at)}
                                      </p>
                                      <p className="text-gray-700 leading-relaxed">
                                        {comment.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>
                                No hay comentarios aún. ¡Sé el primero en
                                comentar!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right column - Author info and pricing */}
                    <div className="space-y-6">
                      {/* Pricing Card */}
                      {publication.price && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                            {(() => {
                              const isProviderCompany = isUserCompany(
                                publication.user,
                              );
                              const priceInfo = getPublicationDisplayPrice(
                                publication.price,
                                publication.type,
                                publication.priceUnit,
                                isProviderCompany,
                              );
                              return priceInfo.showsTax
                                ? "Tarifa del Servicio"
                                : "Salario Ofrecido";
                            })()}
                          </h3>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              {(() => {
                                const basePrice = publication.price;
                                const isProviderCompany = isUserCompany(
                                  publication.user,
                                );
                                const priceInfo = getPublicationDisplayPrice(
                                  basePrice,
                                  publication.type,
                                  publication.priceUnit,
                                  isProviderCompany,
                                );
                                return formatCurrency(priceInfo.price, {
                                  showCurrency: true,
                                });
                              })()}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                              por{" "}
                              {translatePriceUnit(publication.priceUnit || "")}
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-600">
                                {(() => {
                                  const isProviderCompany = isUserCompany(
                                    publication.user,
                                  );
                                  const priceInfo = getPublicationDisplayPrice(
                                    publication.price,
                                    publication.type,
                                    publication.priceUnit,
                                    isProviderCompany,
                                  );
                                  return priceInfo.showsTax
                                    ? "💡 Precio con IVA incluido. Puedes negociar durante el proceso de contratación."
                                    : "💼 Salario bruto mensual. Negociable según experiencia y habilidades.";
                                })()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Author info */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-[#097EEC] rounded-full"></span>
                          {publication?.type === "SERVICE_REQUEST"
                            ? "Información del Solicitante"
                            : "Información del Proveedor"}
                        </h3>

                        {author ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              {author.id &&
                              author.id !== "" &&
                              author.id !== "undefined" ? (
                                <Link
                                  href={`/profile/${author.id}`}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                  <UserAvatarDisplay
                                    user={{
                                      id: author.id
                                        ? typeof author.id === "string"
                                          ? parseInt(author.id)
                                          : author.id
                                        : 0,
                                      name: author.name,
                                      profile_image: author.profile_image,
                                      // email: author.email, // Ocultar email
                                    }}
                                    size="lg"
                                  />
                                </Link>
                              ) : (
                                <UserAvatarDisplay
                                  user={{
                                    id: author.id
                                      ? typeof author.id === "string"
                                        ? parseInt(author.id)
                                        : author.id
                                      : 0,
                                    name: author.name,
                                    profile_image: author.profile_image,
                                    // email: author.email, // Ocultar email
                                  }}
                                  size="lg"
                                />
                              )}
                              <div>
                                {author.id &&
                                author.id !== "" &&
                                author.id !== "undefined" ? (
                                  <Link
                                    href={`/profile/${author.id}`}
                                    className="hover:text-[#097EEC] transition-colors cursor-pointer"
                                  >
                                    <p className="font-semibold text-gray-800">
                                      {author.name}
                                    </p>
                                  </Link>
                                ) : (
                                  <p className="font-semibold text-gray-800">
                                    {author.name}
                                  </p>
                                )}
                                {author.profession && (
                                  <p className="text-sm text-gray-600">
                                    {author.profession}
                                  </p>
                                )}
                              </div>
                            </div>

                            {author.skills && author.skills.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                  Habilidades:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {author.skills
                                    .slice(0, 5)
                                    .map((skill: string, index: number) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  {author.skills.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                                      +{author.skills.length - 5} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Ocultar información privada del autor
                            <div className="space-y-2">
                              {author.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-4 w-4" />
                                  <span>{author.email}</span>
                                </div>
                              )}
                              {author.cellphone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  <span>{author.cellphone}</span>
                                </div>
                              )}
                            </div>
                            */}

                            {/* Rating section */}
                            {userRatingStats &&
                              userRatingStats.totalRatings > 0 && (
                                <div className="pt-3 border-t border-gray-200">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`h-4 w-4 ${
                                            star <=
                                            userRatingStats.averageRating
                                              ? "text-yellow-400 fill-current"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                      (
                                      {userRatingStats.averageRating.toFixed(1)}
                                      )
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {userRatingStats.totalRatings} calificación
                                    {userRatingStats.totalRatings !== 1
                                      ? "es"
                                      : ""}
                                  </p>
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>Información del proveedor no disponible</p>
                          </div>
                        )}
                      </div>

                      {/* Publication stats */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                          Estadísticas
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Comentarios:
                            </span>
                            <span className="font-semibold text-gray-800">
                              {comments.length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Categoría:
                            </span>
                            <span className="font-semibold text-gray-800">
                              {publication.category}
                            </span>
                          </div>
                          {publicationBids.totalBids > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Ofertas activas:
                              </span>
                              <span className="font-semibold text-[#097EEC]">
                                {publicationBids.totalBids}
                              </span>
                            </div>
                          )}
                          {userRatingStats &&
                            userRatingStats.totalRatings > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  Calificación del proveedor:
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-yellow-600">
                                    {userRatingStats.averageRating.toFixed(1)}
                                  </span>
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>

          {/* Contract Modal */}
          {showContractModal && publication && (
            <ContractModal
              publication={publication}
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PublicationDetailPage;
