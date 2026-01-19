"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Tag,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Briefcase,
  CheckCircle,
  HandHeart,
  Heart,
  Share2,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Publication } from "@/interfaces/publication.interface";
import { User as UserInterface } from "@/interfaces/user.interface";
import { Comment } from "@/interfaces/comment.interface";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";
import { translatePriceUnit } from "@/lib/utils";
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
      const response = await PublicationService.getPublicationById(
        publication.id,
      );
      const fullPublication = response.data;
      setComments(fullPublication.comments || []);
    } catch (error) {
      console.error("Error loading full publication:", error);
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

      const newComment = {
        ...response.data,
        user: {
          id: currentUserId,
          name: "Tú",
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
          onClick={handleModalClick}
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Tag className="h-5 w-5 text-[#097EEC] flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {publication.title}
                </h2>
                <p className="text-xs text-gray-500 truncate">
                  {publication.category} • {formatDate(publication.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Botones de acción */}
              {currentUserId &&
                publication.userId !== currentUserId &&
                !hasApplied &&
                (publication.type === "SERVICE_REQUEST" ||
                  isCompanyPublication()) && (
                  <Button
                    onClick={() => setShowApplicationModal(true)}
                    className="bg-green-600 hover:bg-green-700 px-2 sm:px-4 py-2 text-xs sm:text-sm"
                    disabled={isApplying}
                  >
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Aplicar</span>
                  </Button>
                )}

              {currentUserId &&
                publication.userId !== currentUserId &&
                publication.type !== "SERVICE_REQUEST" &&
                !isCompanyPublication() && (
                  <Button
                    onClick={handleHire}
                    className="bg-green-600 hover:bg-green-700 px-2 sm:px-4 py-2 text-xs sm:text-sm"
                  >
                    <HandHeart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Contratar</span>
                  </Button>
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
                    className="px-2 sm:px-3"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-700 px-2 sm:px-3"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="px-2 sm:px-3"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            {/* Layout de 3 columnas en pantallas grandes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 lg:p-6">
              {/* Columna izquierda - Info del autor (solo desktop) */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-6">
                  <Author
                    author={author}
                    publicationType={publication?.type || ""}
                    userRatingStats={null}
                    isLoadingRatings={false}
                  />
                </div>
              </div>

              {/* Columna central - Contenido principal */}
              <div className="lg:col-span-6">
                {/* Imagen */}
                {publication.image_url && (
                  <div className="relative w-full h-64 sm:h-80 lg:h-96 overflow-hidden lg:rounded-xl">
                    <img
                      src={publication.image_url}
                      alt={publication.title}
                      className="w-full h-full object-cover"
                    />
                    {publication.price && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="inline-flex items-center px-4 py-2 bg-green-500/90 backdrop-blur-sm rounded-full text-white font-semibold">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(publication.price)}
                          {publication.priceUnit && (
                            <span className="ml-1 text-xs">
                              / {translatePriceUnit(publication.priceUnit)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Info del autor en mobile */}
                <div className="lg:hidden p-4 border-b border-gray-200">
                  <Author
                    author={author}
                    publicationType={publication?.type || ""}
                    userRatingStats={null}
                    isLoadingRatings={false}
                  />
                </div>

                {/* Descripción y detalles */}
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Descripción
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {publication.description}
                    </p>
                  </div>

                  {/* Grid de detalles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {publication.location && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Ubicación</p>
                          <p className="font-semibold text-blue-700 truncate">
                            {publication.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {publication.urgency && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Urgencia</p>
                          <p className="font-semibold text-orange-700 capitalize truncate">
                            {publication.urgency}
                          </p>
                        </div>
                      </div>
                    )}

                    {publication.preferredSchedule && (
                      <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">
                            Horario preferido
                          </p>
                          <p className="font-semibold text-purple-700 capitalize truncate">
                            {publication.preferredSchedule}
                          </p>
                        </div>
                      </div>
                    )}

                    {publication.requirements && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg sm:col-span-2">
                        <Briefcase className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600">Requisitos</p>
                          <p className="font-semibold text-yellow-700">
                            {publication.requirements}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estado de aplicación */}
                  {hasApplied &&
                    (publication.type === "SERVICE_REQUEST" ||
                      isCompanyPublication()) && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-sm">
                          Ya aplicaste a esta{" "}
                          {publication.type === "SERVICE_REQUEST"
                            ? "solicitud"
                            : "oportunidad"}
                        </span>
                      </div>
                    )}

                  {/* Acciones */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
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
                      }`}
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
                          toast.success("Enlace copiado");
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Comentarios */}
              <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-gray-200">
                <div className="lg:sticky lg:top-6 h-[600px] flex flex-col">
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
      </div>

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
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
      )}

      {/* Modal de aplicación */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aplicar a la publicación
            </h3>
            <textarea
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Mensaje opcional..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
              rows={3}
            />
            {publication?.type === "SERVICE_REQUEST" && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input
                  type="number"
                  value={applicationPrice}
                  onChange={(e) => setApplicationPrice(e.target.value)}
                  placeholder="Precio"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                />
                <select
                  value={applicationPriceUnit}
                  onChange={(e) => setApplicationPriceUnit(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
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
      )}

      {/* Modal de contrato */}
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
