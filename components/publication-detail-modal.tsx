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
  const [showDetailModal, setShowDetailModal] = useState(false);

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
      loadComments();
      checkUserApplication();
    }
  }, [isOpen, publication]);

  const checkUserApplication = async () => {
    if (!publication?.id || !currentUserId || !publication.user?.id) return;

    // Solo verificar si no es el autor
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
      // Si hay error, asumimos que no ha aplicado
      setHasApplied(false);
    }
  };

  // Función para determinar si la publicación es de una empresa
  const isCompanyPublication = () => {
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

  // Función para manejar contratar
  const handleHire = () => {
    setShowContractModal(true);
  };

  const loadAuthor = async () => {
    if (!publication?.user?.id) return;

    try {
      // Aquí podrías hacer una llamada a la API para obtener información completa del autor
      // Por ahora usamos la información que ya tenemos en la publicación
      setAuthor(publication.user as UserInterface);
    } catch (error) {
      console.error("Error loading author:", error);
    }
  };

  const loadComments = async () => {
    if (!publication?.id) return;

    try {
      const response = await CommentService.getPublicationComments(
        publication.id,
      );
      setComments(response.data?.data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !publication?.id || !currentUserId) return;

    setIsSubmittingComment(true);
    try {
      await CommentService.createComment({
        description: commentText,
        publicationId: publication.id,
        userId: currentUserId,
        created_at: new Date(),
      });

      setCommentText("");
      await loadComments(); // Recargar comentarios
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
        headers: {
          "Content-Type": "application/json",
        },
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

  const closeModal = () => {
    setShowDeleteModal(false);
    setIsDeleting(false);
  };

  // Prevenir que el modal se cierre al hacer clic en el contenido
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
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
          onClick={handleModalClick}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-[#097EEC]" />
              <div>
                <p className="text-sm text-gray-500">
                  {publication.category} • {formatDate(publication.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cerrar
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-0">
            {/* Imagen principal - Ahora más prominente */}
            {publication.image_url && (
              <div className="relative w-full h-80 md:h-96 lg:h-[500px] overflow-hidden">
                <img
                  src={publication.image_url}
                  alt={publication.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay con información básica */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6">
                  <div className="text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
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

            {/* Galería de imágenes adicionales */}
            {publication.gallery_images &&
              publication.gallery_images.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Galería de imágenes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {publication.gallery_images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.open(imageUrl, "_blank")}
                      >
                        <img
                          src={imageUrl}
                          alt={`${publication.title} - Imagen ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Contenido principal */}
            <div className="p-6 space-y-6">
              {/* Información del autor - Movida después de la imagen */}
              {author && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatarDisplay
                      user={{
                        id: author.id ? Number(author.id) : 0,
                        name: author.name,
                        profile_image: author.profile_image,
                        // email: author.email, // Ocultar email
                      }}
                      size="lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {author.name}
                      </h3>
                      {author.profession && (
                        <p className="text-sm text-gray-600">
                          {author.profession}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Habilidades */}
                  {author.skills && author.skills.length > 0 && (
                    <div className="mt-3">
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
                </div>
              )}

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
                {/* Precio */}
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

                {/* Ubicación */}
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

                {/* Urgencia */}
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

                {/* Horario preferido */}
                {publication.preferredSchedule && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Horario preferido</p>
                      <p className="font-semibold text-purple-700 capitalize">
                        {publication.preferredSchedule}
                      </p>
                    </div>
                  </div>
                )}

                {/* Requisitos */}
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
                              Ya aplicaste a esta oportunidad
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

                    <p className="text-sm text-gray-500">
                      {publication.type === "SERVICE_REQUEST"
                        ? "Al aplicar, el solicitante podrá ver tu perfil y propuesta para decidir si te contrata."
                        : isCompanyPublication()
                          ? "Al aplicar, la empresa podrá ver tu perfil y decidir si contactarte."
                          : "Inicia el proceso de contratación con negociación de precios."}
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción secundarios */}
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

              {/* Sección de comentarios */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Comentarios ({comments.length})
                </h3>

                {/* Formulario de comentario */}
                {currentUserId && (
                  <div className="mb-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#097EEC] focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="bg-[#097EEC] hover:bg-[#097EEC]/90"
                      >
                        {isSubmittingComment ? "Enviando..." : "Comentar"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de comentarios */}
                <div className="space-y-4">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <UserAvatarDisplay
                          user={{
                            id: comment.user?.id ? Number(comment.user.id) : 0,
                            name: comment.user?.name || "Usuario",
                            profile_image: comment.user?.profile_image,
                            // email: comment.user?.email, // Ocultar email
                          }}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.user?.name || "Usuario"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {comment.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No hay comentarios aún.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar publicación
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar esta publicación? Esta
                acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeModal}
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

      {/* Application Modal */}
      {showApplicationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowApplicationModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aplicar a la publicación
                  </h3>
                  <p className="text-sm text-gray-500">Envía tu propuesta</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApplicationModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Describe por qué eres la persona ideal para este trabajo..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#097EEC] focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio propuesto (opcional)
                  </label>
                  <input
                    type="number"
                    value={applicationPrice}
                    onChange={(e) => setApplicationPrice(e.target.value)}
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad de precio
                  </label>
                  <select
                    value={applicationPriceUnit}
                    onChange={(e) => setApplicationPriceUnit(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-transparent"
                  >
                    <option value="">Seleccionar</option>
                    <option value="HOUR">Por hora</option>
                    <option value="DAY">Por día</option>
                    <option value="WEEK">Por semana</option>
                    <option value="MONTH">Por mes</option>
                    <option value="PROJECT">Por proyecto</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
                  {isApplying ? "Enviando..." : "Enviar aplicación"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
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
