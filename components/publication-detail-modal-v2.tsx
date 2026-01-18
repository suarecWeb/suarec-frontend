"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Tag,
  MapPin,
  Clock,
  DollarSign,
  User,
  Building2,
  Star,
  MessageSquare,
  Share2,
  Heart,
  Edit,
  Trash2,
  AlertTriangle,
  Briefcase,
  CheckCircle,
  HandHeart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Publication } from "@/interfaces/publication.interface";
import { User as UserInterface } from "@/interfaces/user.interface";
import { Comment } from "@/interfaces/comment.interface";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";
import { translatePriceUnit, getPublicationDisplayPrice } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import StartChatButton from "./start-chat-button";
import CommentService from "@/services/CommentsService";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { usePublicationLikes } from "@/hooks/usePublicationLikes";
import ApplicationService from "@/services/ApplicationService";
import ContractModal from "./contract-modal";
import Link from "next/link";
import { Author } from "./publications/author";
import { Comments } from "./publications/comments";
import PublicationService from "@/services/PublicationsService";

interface PublicationDetailModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
  onPublicationDeleted?: () => void;
}

const PublicationDetailModal = ({
  publication,
  isOpen,
  onClose,
  onPublicationDeleted,
}: PublicationDetailModalProps) => {
  const [author, setAuthor] = useState<UserInterface | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationPrice, setApplicationPrice] = useState("");
  const [applicationPriceUnit, setApplicationPriceUnit] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

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

  const {
    likesCount,
    hasLiked,
    isLoading: isLikeLoading,
    toggleLike,
  } = usePublicationLikes({
    publicationId: publication?.id || "",
    initialLikesCount: publication?.likesCount || 0,
    initialHasLiked: publication?.hasLiked || false,
  });

  // Verificar si el usuario puede editar/eliminar la publicación
  const canEditPublication = () => {
    if (!currentUserId || !publication) return false;
    const publicationUserId = publication.user?.id || publication.userId;
    const currentUserIdNumber = Number(currentUserId);
    const publicationUserIdNumber = Number(publicationUserId);
    return (
      currentUserIdNumber === publicationUserIdNumber ||
      userRoles.includes("ADMIN")
    );
  };

  // Cargar autor y comentarios cuando se abre el modal
  useEffect(() => {
    if (isOpen && publication) {
      loadAuthor();
      loadFullPublication();
      checkUserApplication();
    }
  }, [isOpen, publication]);

  const loadFullPublication = async () => {
    if (!publication?.id) return;
    try {
      // Obtener la publicación completa con comentarios usando el servicio
      const response = await PublicationService.getPublicationById(
        publication.id,
      );
      const fullPublication = response.data;
      console.log("Full publication data:", fullPublication);
      console.log("Full publication comments:", fullPublication.comments);
      setComments(fullPublication.comments || []);
    } catch (error) {
      console.error("Error loading full publication:", error);
      // Fallback: usar los comentarios que vienen con la publicación (si los hay)
      setComments(publication.comments || []);
    }
  };

  const checkUserApplication = async () => {
    if (!publication?.id || !currentUserId || !publication.user?.id) return;
    if (Number(publication.user.id) === currentUserId) return;

    try {
      const applicationCheck = await ApplicationService.checkUserApplication(
        currentUserId.toString(),
        publication.id,
      );
      setHasApplied(applicationCheck.data.hasApplied);
      if (applicationCheck.data.application) {
        setApplicationId(applicationCheck.data.application.id || null);
      }
    } catch (err) {
      setHasApplied(false);
    }
  };

  const isCompanyPublication = () => {
    return author?.company !== undefined && author?.company !== null;
  };

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
      toast.success("Aplicación enviada exitosamente");
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

  const handleHire = () => {
    setShowContractModal(true);
  };

  const loadAuthor = async () => {
    if (!publication?.user?.id) return;
    try {
      setAuthor(publication.user as UserInterface);
    } catch (error) {
      console.error("Error loading author:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !publication?.id || !currentUserId) return;
    setIsSubmittingComment(true);
    try {
      const response = await CommentService.createComment({
        description: commentText,
        publicationId: publication.id,
        userId: currentUserId,
        created_at: new Date(),
      });

      // Agregar el nuevo comentario a la lista local
      const newComment = {
        ...response.data,
        user: {
          id: currentUserId,
          name: "Tú", // Placeholder temporal
        },
      };
      setComments((prevComments) => [newComment, ...prevComments]);
      setCommentText("");
      toast.success("Comentario agregado exitosamente");
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Error al agregar comentario");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePublication = async () => {
    if (!publication?.id) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/publications/${publication.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Publicación eliminada exitosamente");
      onPublicationDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Error al eliminar la publicación");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen || !publication) return null;

  return (
    <>
      {/* Modal principal */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
          onClick={handleModalClick}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-[#097EEC] hidden lg:block" />
              <div className="hidden lg:block">
                <p className="text-sm text-gray-500">
                  {publication.category} • {formatDate(publication.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
              {/* Botón de aplicar en el header */}
              {currentUserId &&
                publication.userId !== currentUserId &&
                !hasApplied &&
                (publication.type === "SERVICE_REQUEST" ||
                  isCompanyPublication()) && (
                  <button
                    onClick={() => setShowApplicationModal(true)}
                    className="flex items-center gap-1 lg:gap-2 bg-green-600 text-white px-2 lg:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm text-xs lg:text-sm"
                    disabled={isApplying}
                  >
                    <Briefcase className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">
                      Aplicar a esta{" "}
                      {publication.type === "SERVICE_REQUEST"
                        ? "solicitud"
                        : "oportunidad"}
                    </span>
                    <span className="sm:hidden">Aplicar</span>
                  </button>
                )}

              {/* Botón de contratar servicio en el header */}
              {currentUserId &&
                publication.userId !== currentUserId &&
                publication.type !== "SERVICE_REQUEST" &&
                !isCompanyPublication() && (
                  <button
                    onClick={handleHire}
                    className="flex items-center gap-1 lg:gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-2 lg:px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-sm text-xs lg:text-sm"
                  >
                    <HandHeart className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">
                      Contratar este servicio
                    </span>
                    <span className="sm:hidden">Contratar</span>
                  </button>
                )}
              {canEditPublication() && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/publications/${publication.id}/edit`,
                        "_blank",
                      )
                    }
                    className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 text-xs lg:text-sm"
                  >
                    <Edit className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1 lg:gap-2 text-red-600 hover:text-red-700 px-2 lg:px-3 text-xs lg:text-sm"
                  >
                    <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 text-xs lg:text-sm"
              >
                <X className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Cerrar</span>
              </Button>
            </div>
          </div>

          {/* Content - Two Column Layout */}
          <div className="flex h-[calc(90vh-80px)] relative">
            {/* Left Column - Main Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Imagen principal */}
              {publication.image_url && (
                <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
                  <img
                    src={publication.image_url}
                    alt={publication.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
                    <div className="text-white">
                      <h2 className="text-xl md:text-2xl font-bold mb-2">
                        {publication.title}
                      </h2>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                          <Tag className="h-3.5 w-3.5 mr-1" />
                          {publication.category}
                        </span>
                        {publication.price && (
                          <span className="inline-flex items-center px-2.5 py-1 bg-green-500/80 backdrop-blur-sm rounded-full font-semibold">
                            {formatCurrency(publication.price)}
                            {publication.priceUnit && (
                              <span className="ml-1 text-xs">
                                / {translatePriceUnit(publication.priceUnit)}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido principal */}
              <div className="p-6 space-y-6">
                {/* Descripción */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Descripción
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {publication.description}
                  </p>
                </div>

                {/* Detalles específicos según el tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publication.price && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Precio</p>
                        <p className="font-semibold text-green-700">
                          {formatCurrency(publication.price)}
                          {publication.priceUnit && (
                            <span className="text-sm text-gray-500 ml-1">
                              / {translatePriceUnit(publication.priceUnit)}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {publication.location && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Ubicación</p>
                        <p className="font-semibold text-blue-700">
                          {publication.location}
                        </p>
                      </div>
                    </div>
                  )}

                  {publication.urgency && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Urgencia</p>
                        <p className="font-semibold text-orange-700 capitalize">
                          {publication.urgency}
                        </p>
                      </div>
                    </div>
                  )}

                  {publication.preferredSchedule && (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Horario preferido
                        </p>
                        <p className="font-semibold text-purple-700 capitalize">
                          {publication.preferredSchedule}
                        </p>
                      </div>
                    </div>
                  )}

                  {publication.requirements && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg md:col-span-2">
                      <Briefcase className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Requisitos</p>
                        <p className="font-semibold text-yellow-700">
                          {publication.requirements}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de acción principales */}
                {currentUserId && publication.userId !== currentUserId && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex flex-col gap-4">
                      {/* Mostrar estado de aplicación si ya aplicó */}
                      {hasApplied &&
                        (publication.type === "SERVICE_REQUEST" ||
                          isCompanyPublication()) && (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">
                              Ya aplicaste a esta{" "}
                              {publication.type === "SERVICE_REQUEST"
                                ? "solicitud"
                                : "oportunidad"}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Botones de acción secundarios */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200 pb-20 lg:pb-0">
                  <StartChatButton
                    recipientId={
                      publication.user?.id ? Number(publication.user.id) : 0
                    }
                    recipientName={publication.user?.name || ""}
                    className="flex-shrink-0"
                  />

                  <button
                    onClick={toggleLike}
                    disabled={isLikeLoading}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      hasLiked
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    } ${isLikeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Heart
                      className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`}
                    />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/feed/${publication.id}`;
                      if (navigator.share) {
                        navigator.share({
                          title: publication.title,
                          text: publication.description || publication.title,
                          url: url,
                        });
                      } else {
                        navigator.clipboard.writeText(url);
                        toast.success("Enlace copiado al portapapeles");
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Button for Mobile */}
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="lg:hidden fixed bottom-6 right-6 z-20 bg-[#097EEC] text-white p-3 rounded-full shadow-lg hover:bg-[#0A6BC7] transition-all duration-200 flex items-center gap-2"
            >
              {showSidePanel ? (
                <>
                  <ChevronRight className="h-5 w-5" />
                  <span className="text-sm font-medium">Publicación</span>
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Info & Comentarios
                  </span>
                </>
              )}
            </button>

            {/* Right Column - Author and Comments */}
            <div
              className={`
              lg:w-80 lg:border-l lg:border-gray-200 bg-gray-50 overflow-y-auto
              ${
                showSidePanel
                  ? "fixed inset-0 z-10 w-full lg:relative lg:inset-auto"
                  : "hidden lg:block"
              }
              transition-all duration-300 ease-in-out
            `}
            >
              <div className="p-4 space-y-4">
                {/* Close button for mobile */}
                <div className="lg:hidden flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información del Proveedor
                  </h3>
                  <button
                    onClick={() => setShowSidePanel(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {/* Author Component */}
                <Author
                  author={author}
                  publicationType={publication?.type || ""}
                  userRatingStats={null}
                  isLoadingRatings={false}
                />

                {/* Comments Component */}
                <Comments
                  comments={comments}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  currentUserId={currentUserId}
                  isSubmittingComment={isSubmittingComment}
                  onSubmitComment={handleSubmitComment}
                  formatDate={(date) =>
                    new Date(date).toLocaleDateString("es-ES")
                  }
                  formatTime={(date) =>
                    new Date(date).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals adicionales */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Eliminar publicación
              </h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar esta publicación?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeletePublication}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aplicar a la publicación
              </h3>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="Mensaje opcional..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                rows={3}
              />
              {publication?.type === "SERVICE_REQUEST" && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    type="number"
                    value={applicationPrice}
                    onChange={(e) => setApplicationPrice(e.target.value)}
                    placeholder="Precio"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={applicationPriceUnit}
                    onChange={(e) => setApplicationPriceUnit(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Unidad</option>
                    <option value="HOUR">Por hora</option>
                    <option value="DAY">Por día</option>
                    <option value="PROJECT">Por proyecto</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationModal(false)}
                  disabled={isApplying}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isApplying ? "Enviando..." : "Aplicar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showContractModal && publication && (
        <ContractModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          publication={publication}
        />
      )}
    </>
  );
};

export default PublicationDetailModal;
