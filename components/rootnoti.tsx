"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedContent from "@/components/AnimatedContent";
import { usePanelNoti } from "@/contexts/PanelNotiContext";
import { IdPhoto } from "@/services/IdPhotosService";
import { ContentReport } from "@/services/ModerationService";
import ReportDetailModal from "@/components/ReportDetailModal";
import {
  ShieldAlert,
  CreditCard,
  RefreshCw,
  ChevronRight,
  Clock,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  user_profile: "Perfil",
};

const formatPhotoTime = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const time = d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Hoy ${time}`;
  if (isYesterday) return `Ayer ${time}`;
  return (
    d.toLocaleDateString("es-CO", { day: "numeric", month: "short" }) +
    ` · ${time}`
  );
};

// ─── Panel interno (consume el contexto) ─────────────────────────────────────

const VISIBLE_LIMIT = 7;

const PanelNotiInner = () => {
  const {
    pendingPhotos,
    pendingReports,
    totalPending,
    loading,
    isConnected,
    refresh,
  } = usePanelNoti();
  const [tab, setTab] = useState<"fotos" | "reportes">("fotos");
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(
    null,
  );
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  return (
    <aside className="w-full rounded-2xl bg-white shadow-xl p-4 min-h-[300px] flex flex-col font-jakarta">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-eras-bold uppercase tracking-wide text-gray-500">
            Pendientes
          </p>
          {totalPending > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
              {totalPending}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de conexión WS */}
          {isConnected ? (
            <span title="Tiempo real activo">
              <Wifi className="h-3 w-3 text-green-500" />
            </span>
          ) : (
            <span title="Polling activo">
              <WifiOff className="h-3 w-3 text-gray-300" />
            </span>
          )}
          {/* Refresh manual */}
          <button
            onClick={refresh}
            className="text-gray-400 hover:text-[#097EEC] transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab("fotos")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            tab === "fotos"
              ? "bg-[#097EEC] text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <CreditCard className="h-3 w-3" />
          ID
          {pendingPhotos.length > 0 && (
            <span
              className={`rounded-full px-1 text-xs font-bold ${
                tab === "fotos"
                  ? "bg-white/30 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {pendingPhotos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab("reportes")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            tab === "reportes"
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          <ShieldAlert className="h-3 w-3" />
          Reportes
          {pendingReports.length > 0 && (
            <span
              className={`rounded-full px-1 text-xs font-bold ${
                tab === "reportes"
                  ? "bg-white/30 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {pendingReports.length}
            </span>
          )}
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-2 pr-0.5">
        {loading ? (
          <div className="flex items-center justify-center pt-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#097EEC]" />
          </div>
        ) : tab === "fotos" ? (
          pendingPhotos.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-6 w-6" />}
              text="Sin fotos pendientes"
            />
          ) : (
            <>
              {(showAllPhotos
                ? pendingPhotos
                : pendingPhotos.slice(0, VISIBLE_LIMIT)
              ).map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
              {pendingPhotos.length > VISIBLE_LIMIT && (
                <button
                  onClick={() => setShowAllPhotos((v) => !v)}
                  className="w-full text-center text-xs text-gray-400 hover:text-[#097EEC] transition-colors py-1.5 rounded-lg hover:bg-gray-50"
                >
                  {showAllPhotos
                    ? "Ver menos"
                    : `Ver ${pendingPhotos.length - VISIBLE_LIMIT} más`}
                </button>
              )}
            </>
          )
        ) : pendingReports.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="h-6 w-6" />}
            text="Sin reportes pendientes"
          />
        ) : (
          <>
            {(showAllReports
              ? pendingReports
              : pendingReports.slice(0, VISIBLE_LIMIT)
            ).map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onOpen={() => setSelectedReport(report)}
              />
            ))}
            {pendingReports.length > VISIBLE_LIMIT && (
              <button
                onClick={() => setShowAllReports((v) => !v)}
                className="w-full text-center text-xs text-gray-400 hover:text-amber-600 transition-colors py-1.5 rounded-lg hover:bg-amber-50"
              >
                {showAllReports
                  ? "Ver menos"
                  : `Ver ${pendingReports.length - VISIBLE_LIMIT} más`}
              </button>
            )}
          </>
        )}
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </aside>
  );
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const EmptyState = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="flex flex-col items-center justify-center pt-12 text-gray-300">
    {icon}
    <p className="mt-2 text-xs text-center">{text}</p>
  </div>
);

const PhotoCard = ({ photo }: { photo: IdPhoto }) => (
  <Link
    href={`/users?userId=${photo.user_id}&openModal=requiredFields`}
    className="block"
  >
    <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 hover:border-orange-300 transition-colors">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800">Foto de ID</p>
          <p className="text-xs text-gray-500">
            {photo.photo_type === "front" ? "Frente" : "Reverso"} · usuario #
            {photo.user_id}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-orange-600">
              <Clock className="h-3 w-3" />
              {photo.created_at ? formatPhotoTime(photo.created_at) : "—"}
            </span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const ReportCard = ({
  report,
  onOpen,
}: {
  report: ContentReport;
  onOpen: () => void;
}) => (
  <button
    onClick={onOpen}
    className="w-full text-left rounded-xl border border-red-100 bg-red-50 p-3 hover:border-red-300 hover:bg-red-100/60 transition-colors"
  >
    <div className="flex items-start gap-2">
      <ShieldAlert className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 truncate">
          {CONTENT_TYPE_LABELS[report.content_type] ?? report.content_type}
        </p>
        <p className="text-xs text-gray-500">
          {REASON_LABELS[report.reason] ?? report.reason}
        </p>
        {report.reportedUser && (
          <p className="text-xs text-gray-400 truncate">
            {report.reportedUser.name ?? report.reportedUser.email}
          </p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-red-600">
            <Clock className="h-3 w-3" />
            {formatPhotoTime(report.created_at)}
          </span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
        </div>
      </div>
    </div>
  </button>
);

// ─── Export: el provider viene del AdminSidePanel padre ──────────────────────

const RootNoti = () => (
  <AnimatedContent
    distance={70}
    direction="horizontal"
    reverse={true}
    duration={0.7}
    ease="power3.out"
    initialOpacity={0}
    animateOpacity
    scale={1}
    threshold={0.1}
    delay={0}
    className="hidden md:block"
  >
    <PanelNotiInner />
  </AnimatedContent>
);

export default RootNoti;
