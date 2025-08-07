"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  Clock,
  DollarSign,
  User,
  Building2,
  Star,
  Send,
  Briefcase,
  Calendar,
  Eye,
  Tag,
  TrendingUp,
  Edit,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Publication } from "@/interfaces/publication.interface";
import { translatePriceUnit, getPublicationDisplayPrice } from "@/lib/utils";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";
import GalleryPreview from "@/components/ui/GalleryPreview";
import { usePublicationLikes } from "@/hooks/usePublicationLikes";
import { formatCurrency } from "@/lib/formatCurrency";
import StartChatButton from "./start-chat-button";
import PublicationService from "@/services/PublicationsService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

interface PublicationFeedCardProps {
  publication: Publication;
  userRole?: string;
  publicationBids?: { contracts: any[]; totalBids: number };
  onPublicationDeleted?: () => void;
}

const PublicationFeedCard = ({
  publication,
  userRole,
  publicationBids,
  onPublicationDeleted,
}: PublicationFeedCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    publicationId: publication.id!,
    initialLikesCount: publication.likesCount || 0,
    initialHasLiked: publication.hasLiked || false,
  });

  // Verificar si el usuario puede editar/eliminar la publicación
  const canEditPublication = () => {
    if (!currentUserId) return false;

    // Obtener el ID del propietario de la publicación
    const publicationUserId = publication.user?.id || publication.userId;

    // Asegurar que ambos IDs sean números para comparación correcta
    const currentUserIdNumber = Number(currentUserId);
    const publicationUserIdNumber = Number(publicationUserId);

    // Debug logs
    console.log("🔍 Debug autorización:", {
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

  // Función para eliminar publicación
  const handleDelete = async () => {
    console.log("🔍 Debug eliminación:", {
      publicationId: publication.id,
      currentUserId,
      userRoles,
      canEdit: canEditPublication(),
    });

    setIsDeleting(true);
    try {
      console.log("🔍 Enviando solicitud de eliminación...");
      await PublicationService.deletePublication(publication.id!);
      console.log("🔍 Publicación eliminada exitosamente");
      setShowDeleteModal(false);
      onPublicationDeleted?.();
    } catch (err) {
      console.error("❌ Error al eliminar publicación:", err);
      alert("Error al eliminar la publicación");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24)
      return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    if (diffInHours < 48) return "Ayer";
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  // Función para obtener el ID del usuario de forma segura
  const getUserId = () => {
    return publication.user?.id || publication.userId?.toString() || "";
  };

  // Función para verificar si hay un ID válido
  const hasValidUserId = () => {
    const userId = getUserId();
    return userId && userId !== "" && userId !== "undefined";
  };

  // Función para cerrar el modal
  const closeModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showDeleteModal) {
        closeModal();
      }
    };

    if (showDeleteModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal, isDeleting]);

  // Mostrar todas las publicaciones, con o sin imágenes

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {hasValidUserId() ? (
              <Link
                href={`/profile/${getUserId()}`}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <UserAvatarDisplay
                  user={{
                    id: publication.userId,
                    name: publication.user?.name || "Usuario",
                    profile_image: publication.user?.profile_image,
                    email: publication.user?.email,
                  }}
                  size="md"
                />
              </Link>
            ) : (
              <UserAvatarDisplay
                user={{
                  id: publication.userId,
                  name: publication.user?.name || "Usuario",
                  profile_image: publication.user?.profile_image,
                  email: publication.user?.email,
                }}
                size="md"
              />
            )}
            <div>
              {hasValidUserId() ? (
                <Link
                  href={`/profile/${getUserId()}`}
                  className="hover:text-[#097EEC] transition-colors cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 text-sm">
                    {publication.user?.name || "Usuario"}
                  </h3>
                </Link>
              ) : (
                <h3 className="font-bold text-gray-900 text-sm">
                  {publication.user?.name || "Usuario"}
                </h3>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Tag className="h-3 w-3" />
                <span>{publication.category}</span>
                <Calendar className="h-3 w-3 ml-2" />
                <span>{formatDate(publication.created_at)}</span>
              </div>
            </div>
          </div>
          {/* Botones de acción solo si puede editar */}
          {canEditPublication() && (
            <div className="flex items-center gap-2">
              <Link href={`/publications/${publication.id}/edit`}>
                <button className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors p-2 hover:bg-amber-50 rounded-lg">
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
        </div>

        {/* NUEVO LAYOUT: Imágenes más grandes arriba, contenido abajo */}
        <div className="space-y-4">
          {/* Galería de imágenes */}
          {publication.image_url ||
          (publication.gallery_images &&
            publication.gallery_images.length > 0) ? (
            <GalleryPreview
              images={
                publication.image_url
                  ? [publication.image_url]
                  : publication.gallery_images || []
              }
              title={publication.title}
              maxDisplay={4}
              className="mb-3"
            />
          ) : null}

          {/* Contenido principal */}
          <div className="w-full">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {publication.title}
            </h2>

            <div className="flex items-center gap-2 mb-2">
              {/* <DollarSign className="h-4 w-4 text-green-600" /> */}
              <span className="text-green-700 font-semibold text-base">
                {publication.price
                  ? (() => {
                      const basePrice = publication.price;
                      const priceInfo = getPublicationDisplayPrice(
                        basePrice,
                        publication.type,
                        publication.priceUnit,
                      );

                      console.log("🔍 Debug precio ESCALABLE:", {
                        basePrice,
                        displayPrice: priceInfo.price,
                        showsTax: priceInfo.showsTax,
                        taxApplied: priceInfo.taxApplied,
                        publicationType: publication.type,
                        priceUnit: publication.priceUnit,
                      });

                      return `${formatCurrency(priceInfo.price, {
                        showCurrency: true,
                      })} ${translatePriceUnit(publication.priceUnit || "")}`;
                    })()
                  : "Precio a convenir"}
              </span>
            </div>

            {publication.description && (
              <p
                className="text-gray-700 text-sm mb-3"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {publication.description}
              </p>
            )}

            {/* Información de ofertas activas */}
            {publicationBids && publicationBids.totalBids > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-medium text-xs">
                    {publicationBids.totalBids} oferta
                    {publicationBids.totalBids > 1 ? "s" : ""} activa
                    {publicationBids.totalBids > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Link href={`/feed/${publication.id}`}>
                <Button
                  size="sm"
                  className="bg-[#097EEC] hover:bg-[#097EEC]/90 text-xs px-3 py-1"
                >
                  Ver más
                </Button>
              </Link>
              {/* <Button
                variant="outline"
                size="sm"
                className="border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white text-xs px-3 py-1"
              >
                <Send className="h-3 w-3 mr-1" />
                Mensaje
              </Button> */}
              <StartChatButton
                recipientId={parseInt(publication.user?.id || "0")}
                recipientName={publication.user?.name || ""}
                className="flex-shrink-0 text-sm"
                variant="outline"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={toggleLike}
            disabled={isLikeLoading}
            className={`flex items-center gap-2 text-sm transition-colors ${
              hasLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            } ${isLikeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{publication.comments?.length || 0}</span>
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors">
            <Share2 className="h-4 w-4" />
            <span>Compartir</span>
          </button>
        </div>

        {/* Comments Section (Collapsible) */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3">
              {publication.comments && publication.comments.length > 0 ? (
                publication.comments.map((comment, index) => {
                  const commentUserId = comment.user?.id || "";
                  const hasValidCommentUserId =
                    commentUserId &&
                    commentUserId !== "" &&
                    commentUserId !== "undefined";

                  return (
                    <div key={index} className="flex items-start gap-3">
                      {hasValidCommentUserId ? (
                        <Link
                          href={`/profile/${commentUserId}`}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <UserAvatarDisplay
                            user={{
                              id:
                                typeof comment.user?.id === "string"
                                  ? parseInt(comment.user.id)
                                  : (comment.user?.id as number) || 0,
                              name: comment.user?.name || "Usuario",
                              profile_image: comment.user?.profile_image,
                              email: comment.user?.email,
                            }}
                            size="sm"
                          />
                        </Link>
                      ) : (
                        <UserAvatarDisplay
                          user={{
                            id:
                              typeof comment.user?.id === "string"
                                ? parseInt(comment.user.id)
                                : (comment.user?.id as number) || 0,
                            name: comment.user?.name || "Usuario",
                            profile_image: comment.user?.profile_image,
                            email: comment.user?.email,
                          }}
                          size="sm"
                        />
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            {hasValidCommentUserId ? (
                              <Link
                                href={`/profile/${commentUserId}`}
                                className="hover:text-[#097EEC] transition-colors cursor-pointer"
                              >
                                <span className="text-sm font-medium text-gray-900">
                                  {comment.user?.name || "Usuario"}
                                </span>
                              </Link>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">
                                {comment.user?.name || "Usuario"}
                              </span>
                            )}
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
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No hay comentarios aún.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  {publication.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {publication.description?.substring(0, 100)}
                  {publication.description &&
                    publication.description.length > 100 &&
                    "..."}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Tag className="h-3 w-3" />
                  <span>{publication.category}</span>
                  <Calendar className="h-3 w-3 ml-2" />
                  <span>{formatDate(publication.created_at)}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      ¿Estás seguro?
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Esta publicación será eliminada permanentemente. Los
                      comentarios y ofertas asociadas también se eliminarán.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Eliminando...
                  </div>
                ) : (
                  "Eliminar publicación"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicationFeedCard;
