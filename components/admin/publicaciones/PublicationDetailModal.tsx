"use client";
import { useEffect, useState } from "react";
import {
  Publication,
  PublicationType,
} from "@/interfaces/publication.interface";
import {
  X,
  Calendar,
  Tag,
  DollarSign,
  User as UserIcon,
  Eye,
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  AlertTriangle,
  ImageOff,
  Briefcase,
  HandHelping,
  Building2,
  ChevronLeft,
  ChevronRight,
  Bell,
  Trash2,
} from "lucide-react";
import MessageService from "@/services/MessageService";
import PublicationService from "@/services/PublicationsService";
import toast from "react-hot-toast";

const TYPE_LABELS: Record<
  PublicationType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [PublicationType.SERVICE]: {
    label: "Oferta de servicio",
    color: "bg-blue-100 text-blue-700",
    icon: <Briefcase className="h-3.5 w-3.5" />,
  },
  [PublicationType.SERVICE_REQUEST]: {
    label: "Solicitud",
    color: "bg-amber-100 text-amber-700",
    icon: <HandHelping className="h-3.5 w-3.5" />,
  },
  [PublicationType.JOB]: {
    label: "Vacante",
    color: "bg-purple-100 text-purple-700",
    icon: <Building2 className="h-3.5 w-3.5" />,
  },
};

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  LOW: { label: "Baja", color: "text-green-600 bg-green-50" },
  MEDIUM: { label: "Media", color: "text-amber-600 bg-amber-50" },
  HIGH: { label: "Alta", color: "text-red-600 bg-red-50" },
};

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const MODERATION_NOTICE =
  "Hola, el equipo de Soporte Suarec ha revisado tu publicación y encontró que no cumple con nuestras políticas de uso. Por favor revisa el contenido y realiza los ajustes necesarios para evitar la eliminación de tu cuenta.";

interface Props {
  pub: Publication & { deleted_at?: Date };
  onClose: () => void;
}

export const PublicationDetailModal = ({ pub, onClose }: Props) => {
  const [visible, setVisible] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [notifying, setNotifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const allImages = [
    ...(pub.image_url ? [pub.image_url] : []),
    ...(pub.gallery_images ?? []),
  ];
  const hasGallery = allImages.length > 1;

  const typeInfo = TYPE_LABELS[pub.type] ?? {
    label: pub.type,
    color: "bg-gray-100 text-gray-600",
    icon: null,
  };

  const urgencyInfo = pub.urgency ? URGENCY_LABELS[pub.urgency] : null;

  useEffect(() => {
    // Un frame de delay para que la transición CSS se dispare correctamente
    const raf = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleNotify = async () => {
    if (!pub.user?.id) return;
    setNotifying(true);
    try {
      await MessageService.sendModerationNotice({
        recipientId: Number(pub.user.id),
        content: MODERATION_NOTICE,
      });
      toast.success("Notificación enviada al usuario");
    } catch {
      toast.error("No se pudo enviar la notificación");
    } finally {
      setNotifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await PublicationService.deletePublication(String(pub.id));
      toast.success("Publicación eliminada");
      handleClose();
    } catch {
      toast.error("No se pudo eliminar la publicación");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndex((i) => (i - 1 + allImages.length) % allImages.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGalleryIndex((i) => (i + 1) % allImages.length);
  };

  return (
    // Backdrop
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-colors duration-300 ${
        visible ? "bg-black/50" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      {/* Panel — slide up desde abajo */}
      <div
        className={`relative w-full sm:max-w-2xl max-h-[92vh] bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full sm:translate-y-10 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle visible solo en mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow text-gray-500 hover:text-gray-800 hover:bg-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Imagen principal / galería */}
        {allImages.length > 0 ? (
          <div className="relative w-full h-56 sm:h-72 bg-gray-100 flex-shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImages[galleryIndex]}
              alt={pub.title}
              className="w-full h-full object-cover transition-opacity duration-200"
            />

            {/* Controles de galería */}
            {hasGallery && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGalleryIndex(i);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === galleryIndex
                          ? "bg-white scale-125"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badge eliminada sobre imagen */}
            {pub.deleted_at && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Eliminada
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-36 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <ImageOff className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {/* Tipo + categoría */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${typeInfo.color}`}
            >
              {typeInfo.icon}
              {typeInfo.label}
            </span>
            {pub.category && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <Tag className="h-3.5 w-3.5" />
                {pub.category}
              </span>
            )}
            {pub.deleted_at && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                Eliminada el {formatDate(pub.deleted_at)}
              </span>
            )}
          </div>

          {/* Título */}
          <h2 className="text-xl font-bold text-gray-900 leading-snug">
            {pub.title}
          </h2>

          {/* Precio */}
          {pub.price != null && (
            <div className="inline-flex items-center gap-1.5 text-lg font-semibold text-green-700">
              <DollarSign className="h-5 w-5" />
              {Number(pub.price).toLocaleString("es-CO")}
              {pub.priceUnit && (
                <span className="text-sm font-normal text-gray-500">
                  /{pub.priceUnit}
                </span>
              )}
            </div>
          )}

          {/* Descripción */}
          {pub.description && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {pub.description}
            </p>
          )}

          {/* Campos específicos de solicitudes/vacantes */}
          {(pub.location ||
            pub.urgency ||
            pub.preferredSchedule ||
            pub.requirements) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {pub.location && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{pub.location}</span>
                </div>
              )}
              {pub.urgency && urgencyInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500">Urgencia:</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgencyInfo.color}`}
                  >
                    {urgencyInfo.label}
                  </span>
                </div>
              )}
              {pub.preferredSchedule && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{pub.preferredSchedule}</span>
                </div>
              )}
              {pub.requirements && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Requisitos</p>
                  <p className="leading-relaxed whitespace-pre-line">
                    {pub.requirements}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Autor */}
          {pub.user && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-[#097EEC] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {(pub.user.name ?? pub.user.email ?? "?")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {pub.user.name ?? "Sin nombre"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {pub.user.email}
                </p>
              </div>
              <UserIcon className="h-4 w-4 text-[#097EEC] ml-auto flex-shrink-0" />
            </div>
          )}

          {/* Acciones admin */}
          {!pub.deleted_at && pub.user && (
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleNotify}
                disabled={notifying}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <Bell className="h-4 w-4" />
                {notifying ? "Enviando..." : "Notificar usuario"}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
                  confirmDelete
                    ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
                    : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {deleting
                  ? "Eliminando..."
                  : confirmDelete
                    ? "¿Confirmar?"
                    : "Eliminar"}
              </button>
            </div>
          )}

          {/* Stats + fecha */}
          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-gray-100">
            {pub.visitors != null && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                <Eye className="h-4 w-4" />
                {pub.visitors} visitas
              </span>
            )}
            {pub.likes != null && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                <Heart className="h-4 w-4" />
                {pub.likesCount ?? pub.likes.length} likes
              </span>
            )}
            {pub.comments != null && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                <MessageCircle className="h-4 w-4" />
                {pub.comments.length} comentarios
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-400 ml-auto">
              <Calendar className="h-4 w-4" />
              {formatDate(pub.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
