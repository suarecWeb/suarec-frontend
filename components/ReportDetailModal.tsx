"use client";
import { useEffect, useState } from "react";
import {
  X,
  ShieldAlert,
  Clock,
  FileText,
  ImageOff,
  Trash2,
  Bell,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  ContentReport,
  ReportContentType,
  ReportStatus,
} from "@/services/ModerationService";
import ModerationService from "@/services/ModerationService";
import { usePanelNoti } from "@/contexts/PanelNotiContext";
import PublicationService from "@/services/PublicationsService";
import MessageService from "@/services/MessageService";
import { Publication } from "@/interfaces/publication.interface";
import { PublicationDetailModal } from "@/app/admin/publicaciones/PublicationDetailModal";
// ─── Helpers ──────────────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Acoso",
  hate_speech: "Discurso de odio",
  violence: "Violencia",
  sexual_content: "Contenido sexual",
  misinformation: "Desinformación",
  intellectual_property: "Prop. intelectual",
  illegal_activity: "Act. ilegal",
  other: "Otro",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  publication: "Publicación",
  comment: "Comentario",
  message: "Mensaje",
  user_profile: "Perfil de usuario",
};

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
};

const buildTemplate = (userName: string, pubTitle: string) =>
  `Hola ${userName}, te informamos que tu publicación "${pubTitle}" ha sido retirada de la plataforma SUAREC por incumplir nuestros términos y condiciones de uso.\n\nSi tienes alguna duda, puedes contactarnos a través de este mismo canal.\n\n— Equipo SUAREC`;

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ActionStep = "idle" | "confirm" | "sending" | "done" | "error";

interface Props {
  report: ContentReport;
  onClose: () => void;
}

// ─── Componente principal ─────────────────────────────────────────────────────

const ReportDetailModal = ({ report, onClose }: Props) => {
  const { markReportSeen } = usePanelNoti();

  const [visible, setVisible] = useState(false);
  const [publication, setPublication] = useState<Publication | null>(null);
  const [pubLoading, setPubLoading] = useState(false);
  const [pubError, setPubError] = useState(false);
  const [showPubModal, setShowPubModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [actionStep, setActionStep] = useState<ActionStep>("idle");
  const [pendingAction, setPendingAction] = useState<
    "notify" | "delete" | null
  >(null);

  const isPublicationReport =
    report.content_type === ReportContentType.PUBLICATION;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";

    if (isPublicationReport && report.content_id) {
      setPubLoading(true);
      PublicationService.getPublicationById(report.content_id)
        .then((res) => {
          setPublication(res.data);
          const name = res.data.user?.name ?? res.data.user?.email ?? "usuario";
          setMessageText(buildTemplate(name, res.data.title));
        })
        .catch(() => setPubError(true))
        .finally(() => setPubLoading(false));
    }

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && actionStep !== "sending") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionStep]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleNotifyOnly = async () => {
    const recipientId = publication?.userId ?? publication?.user?.id;
    if (!recipientId) return;
    setActionStep("sending");
    try {
      await MessageService.sendModerationNotice({
        content: messageText,
        recipientId: Number(recipientId),
      });
      await markReportSeen(report.id);
      setActionStep("done");
      setTimeout(handleClose, 1800);
    } catch {
      setActionStep("error");
    }
  };

  const handleDeleteOnly = async () => {
    if (!publication?.id) return;
    setActionStep("sending");
    try {
      await Promise.all([
        PublicationService.deletePublication(publication.id),
        ModerationService.updateReportStatus(report.id, {
          status: ReportStatus.RESOLVED,
          resolution_notes: `Publicación eliminada. Razón: ${REASON_LABELS[report.reason] ?? report.reason}`,
        }),
      ]);
      await markReportSeen(report.id);
      setActionStep("done");
      setTimeout(handleClose, 1800);
    } catch {
      setActionStep("error");
    }
  };

  const handleConfirm = () => {
    if (pendingAction === "notify") handleNotifyOnly();
    else if (pendingAction === "delete") handleDeleteOnly();
  };

  const handleRequestConfirm = (action: "notify" | "delete") => {
    setPendingAction(action);
    setActionStep("confirm");
  };

  const handleCancelConfirm = () => {
    setPendingAction(null);
    setActionStep("idle");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 flex items-end sm:items-start justify-center p-0 sm:p-4 sm:pt-16 transition-colors duration-300 ${
          visible ? "bg-black/50" : "bg-black/0"
        }`}
        onClick={actionStep === "sending" ? undefined : handleClose}
      >
        {/* Panel — slide up */}
        <div
          className={`relative w-full sm:max-w-lg max-h-[90vh] bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${
            visible
              ? "translate-y-0 opacity-100"
              : "translate-y-full sm:translate-y-10 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Botón cerrar */}
          <button
            onClick={handleClose}
            disabled={actionStep === "sending"}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header del reporte */}
          <div className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                  Reporte de{" "}
                  {CONTENT_TYPE_LABELS[report.content_type] ??
                    report.content_type}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(report.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                {REASON_LABELS[report.reason] ?? report.reason}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
                #{report.id}
              </span>
            </div>
          </div>

          {/* Cuerpo scrolleable */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {/* Descripción opcional */}
            {report.description && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Descripción del reporte
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {report.description}
                </p>
              </div>
            )}

            {/* Quién reportó / a quién */}
            <div className="grid grid-cols-2 gap-3">
              <UserCard
                label="Reportado por"
                user={report.reporter}
                variant="neutral"
              />
              <UserCard
                label="Usuario reportado"
                user={report.reportedUser}
                variant="red"
              />
            </div>

            {/* Publicación relacionada */}
            {isPublicationReport && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500">
                  Publicación reportada
                </p>

                {pubLoading && (
                  <div className="flex items-center justify-center py-8 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#097EEC]" />
                  </div>
                )}

                {pubError && (
                  <div className="flex items-center justify-center py-8 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 gap-2">
                    <ImageOff className="h-5 w-5" />
                    <span className="text-sm">
                      No se pudo cargar la publicación
                    </span>
                  </div>
                )}

                {publication && !pubLoading && (
                  <>
                    {/* Tarjeta de publicación */}
                    <button
                      onClick={() => setShowPubModal(true)}
                      className="w-full text-left rounded-xl border border-gray-200 bg-white hover:border-[#097EEC] hover:shadow-md transition-all duration-200 overflow-hidden group"
                    >
                      <div className="flex gap-3 p-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {publication.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={publication.image_url}
                              alt={publication.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageOff className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#097EEC] transition-colors">
                            {publication.title}
                          </p>
                          {publication.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {publication.description}
                            </p>
                          )}
                          <p className="text-xs text-[#097EEC] mt-1.5 font-medium">
                            Ver detalle completo →
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Zona de acción */}
                    <ReportActionPanel
                      messageText={messageText}
                      onMessageChange={setMessageText}
                      actionStep={actionStep}
                      pendingAction={pendingAction}
                      onRequestConfirm={handleRequestConfirm}
                      onCancel={handleCancelConfirm}
                      onConfirm={handleConfirm}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPubModal && publication && (
        <PublicationDetailModal
          pub={publication}
          onClose={() => setShowPubModal(false)}
        />
      )}
    </>
  );
};

// ─── Panel de acción ──────────────────────────────────────────────────────────

interface ActionPanelProps {
  messageText: string;
  onMessageChange: (v: string) => void;
  actionStep: ActionStep;
  pendingAction: "notify" | "delete" | null;
  onRequestConfirm: (action: "notify" | "delete") => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const ReportActionPanel = ({
  messageText,
  onMessageChange,
  actionStep,
  pendingAction,
  onRequestConfirm,
  onCancel,
  onConfirm,
}: ActionPanelProps) => {
  if (actionStep === "done") {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-700">
            Acción completada
          </p>
          <p className="text-xs text-green-600">
            {pendingAction === "notify"
              ? "Notificación enviada al usuario."
              : "Publicación eliminada correctamente."}
          </p>
        </div>
      </div>
    );
  }

  if (actionStep === "error") {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">Ocurrió un error</p>
          <p className="text-xs text-red-500">
            Intenta de nuevo o revisa la conexión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
        Acción de moderación
      </p>

      {/* Mensaje editable */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
          <Send className="h-3.5 w-3.5" />
          Mensaje que recibirá el usuario
        </p>
        <textarea
          value={messageText}
          onChange={(e) => onMessageChange(e.target.value)}
          disabled={actionStep === "sending"}
          rows={5}
          className="w-full text-sm text-gray-700 bg-white border border-orange-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-colors disabled:opacity-50"
        />
      </div>

      {/* Botones */}
      {actionStep === "idle" && (
        <div className="flex gap-2">
          <button
            onClick={() => onRequestConfirm("notify")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
          >
            <Bell className="h-4 w-4" />
            Notificar
          </button>
          <button
            onClick={() => onRequestConfirm("delete")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar publicación
          </button>
        </div>
      )}

      {actionStep === "confirm" && (
        <div className="space-y-2">
          <p className="text-xs text-center text-orange-700 font-medium">
            {pendingAction === "notify"
              ? "¿Enviar notificación al usuario?"
              : "¿Eliminar publicación? Esta acción no se puede deshacer."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {actionStep === "sending" && (
        <div className="flex items-center justify-center gap-2 py-2.5 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Enviando mensaje y eliminando...</span>
        </div>
      )}
    </div>
  );
};

// ─── UserCard ─────────────────────────────────────────────────────────────────

const UserCard = ({
  label,
  user,
  variant,
}: {
  label: string;
  user: { id: number; name: string; email: string };
  variant: "neutral" | "red";
}) => {
  const colors =
    variant === "red"
      ? "bg-red-50 border-red-100"
      : "bg-gray-50 border-gray-100";
  const avatarBg = variant === "red" ? "bg-red-400" : "bg-[#097EEC]";

  return (
    <div className={`rounded-xl border p-3 ${colors}`}>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <div
          className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {(user.name ?? user.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {user.name ?? "Sin nombre"}
          </p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailModal;
