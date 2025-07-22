"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Publication } from "@/interfaces/publication.interface";
import { translatePriceUnit, calculatePriceWithTax } from "@/lib/utils";
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
    return publication.userId === currentUserId || userRoles.includes("ADMIN");
  };

  // Función para eliminar publicación
  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
      try {
        await PublicationService.deletePublication(publication.id!);
        onPublicationDeleted?.();
      } catch (err) {
        console.error("Error al eliminar publicación:", err);
        alert("Error al eliminar la publicación");
      }
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

  // Mostrar todas las publicaciones, con o sin imágenes

  return (
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
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
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
                    const priceWithTax = calculatePriceWithTax(basePrice);
                    console.log("🔍 Debug precio ACTUALIZADO:", {
                      basePrice,
                      basePrice_type: typeof basePrice,
                      priceWithTax,
                      priceWithTax_type: typeof priceWithTax,
                      calculation: `${basePrice} + (${basePrice} * 0.19) = ${priceWithTax}`,
                    });
                    return `${formatCurrency(priceWithTax, {
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

        {/* Botones de editar y eliminar para propietarios y admins */}
        {canEditPublication() && (
          <>
            <Link href={`/publications/${publication.id}/edit`}>
              <button className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors">
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
          </>
        )}
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
  );
};

export default PublicationFeedCard;
