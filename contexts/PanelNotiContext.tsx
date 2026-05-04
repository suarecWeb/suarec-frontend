"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { sileo } from "sileo";
import { IdPhotosService, IdPhoto } from "@/services/IdPhotosService";
import ModerationService, {
  ContentReport,
  ReportStatus,
} from "@/services/ModerationService";
import { PaymentService, PaymentStatus } from "@/services/PaymentService";

// ─── Helpers para toasts ─────────────────────────────────────────────────────

const nowTime = () =>
  new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

const CONTENT_TYPE_LABELS: Record<string, string> = {
  publication: "Publicación",
  comment: "Comentario",
  message: "Mensaje",
  user_profile: "Perfil",
};

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Acoso",
  hate_speech: "Discurso de odio",
  violence: "Violencia",
  sexual_content: "Cont. sexual",
  misinformation: "Desinformación",
  intellectual_property: "Prop. intelectual",
  illegal_activity: "Act. ilegal",
  other: "Otro",
};

const iconStyle = (bg: string): React.CSSProperties => ({
  width: 30,
  height: 30,
  minWidth: 30,
  borderRadius: "50%",
  background: bg,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  flexShrink: 0,
});

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface PanelNotiState {
  /** Fotos de ID esperando revisión */
  pendingPhotos: IdPhoto[];
  /** Reportes de contenido pendientes */
  pendingReports: ContentReport[];
  /** Pagos en estado PENDING (desembolsos por procesar) */
  pendingPaymentsCount: number;
  /** Suma de fotos + reportes */
  totalPending: number;
  loading: boolean;
  isConnected: boolean;
  refresh: () => void;
  /** Marca un reporte como under_review en el backend y lo quita del badge */
  markReportSeen: (id: number) => Promise<void>;
}

// ─── Contexto ────────────────────────────────────────────────────────────────

const PanelNotiContext = createContext<PanelNotiState | undefined>(undefined);

export const usePanelNoti = (): PanelNotiState => {
  const ctx = useContext(PanelNotiContext);
  if (!ctx)
    throw new Error("usePanelNoti must be used within PanelNotiProvider");
  return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const PanelNotiProvider = ({ children }: { children: ReactNode }) => {
  const [pendingPhotos, setPendingPhotos] = useState<IdPhoto[]>([]);
  const [pendingReports, setPendingReports] = useState<ContentReport[]>([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch HTTP ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [photos, reports, payments] = await Promise.all([
        IdPhotosService.getPendingIdPhotos(),
        ModerationService.getReports({
          status: ReportStatus.PENDING,
          limit: 100,
        }),
        PaymentService.getAllPaymentsForAdmin({
          status: PaymentStatus.PENDING,
          limit: 1,
        }),
      ]);
      setPendingPhotos(photos ?? []);
      setPendingReports(reports.data.data ?? []);
      // getAllPaymentsForAdmin devuelve PaginationResponse — usamos el total del meta
      const paymentsData = payments.data as any;
      setPendingPaymentsCount(
        paymentsData?.meta?.total ?? paymentsData?.total ?? 0,
      );
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, []);

  // ── WebSocket ────────────────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    const token = Cookies.get("token");
    if (!token || socketRef.current?.connected) return;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

    const socket = io(`${backendUrl}/messages`, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 3000,
    });

    socket.on("connect", () => {
      setIsConnected(true);
      fetchData(true);
    });

    socket.on("disconnect", () => setIsConnected(false));

    // ── Eventos admin preparados para cuando el backend los emita ────────────
    socket.on("admin:pending_photo", (photo: IdPhoto) => {
      setPendingPhotos((prev) =>
        prev.some((p) => p.id === photo.id) ? prev : [photo, ...prev],
      );
      sileo.info({
        title: `Foto de ID · ${nowTime()}`,
        description: `${photo.photo_type === "front" ? "Frente" : "Reverso"} · usuario #${photo.user_id}`,
        position: "bottom-right",
        duration: 6000,
        icon: <div style={iconStyle("#F97316")}>🪪</div>,
        button: {
          title: "Revisar",
          onClick: () => {
            window.location.href = "/users";
          },
        },
      });
    });

    socket.on("admin:photo_reviewed", (data: { photoId: number }) => {
      setPendingPhotos((prev) => prev.filter((p) => p.id !== data.photoId));
    });

    socket.on("admin:new_report", (report: ContentReport) => {
      setPendingReports((prev) =>
        prev.some((r) => r.id === report.id) ? prev : [report, ...prev],
      );
      sileo.info({
        title: `Nuevo reporte · ${nowTime()}`,
        description: `${CONTENT_TYPE_LABELS[report.content_type] ?? report.content_type} — ${REASON_LABELS[report.reason] ?? report.reason}`,
        position: "bottom-right",
        duration: 6000,
        fill: "#097EEC",
        icon: <div style={iconStyle("#ffffff")}>🛡️</div>,
        styles: {
          title: "!text-black",
          description: "!text-black",
          button: "!text-white",
        },
        button: {
          title: "Revisar",
          onClick: () => {
            window.location.href = "/admin/tickets";
          },
        },
      });
    });

    socket.on("admin:report_resolved", (data: { reportId: number }) => {
      setPendingReports((prev) => prev.filter((r) => r.id !== data.reportId));
    });

    socket.on("admin:new_payment", () => {
      setPendingPaymentsCount((n) => n + 1);
      sileo.info({
        title: `Nuevo pago · ${nowTime()}`,
        description: "Pago pendiente de desembolso",
        position: "bottom-right",
        duration: 6000,
        icon: <div style={iconStyle("#097EEC")}>💳</div>,
        button: {
          title: "Ver",
          onClick: () => {
            window.location.href = "/payments";
          },
        },
      });
    });

    socket.on("admin:payment_processed", () => {
      setPendingPaymentsCount((n) => Math.max(0, n - 1));
    });

    socketRef.current = socket;
  }, [fetchData]);

  // ── Polling de respaldo (15s) ─────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => fetchData(true), 15000);
  }, [fetchData]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // ── Ciclo de vida ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    connectSocket();
    startPolling();

    return () => {
      stopPolling();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [fetchData, connectSocket, startPolling, stopPolling]);

  const markReportSeen = useCallback(
    async (id: number) => {
      // Optimistic: quitar del array local antes de esperar la red
      setPendingReports((prev) => prev.filter((r) => r.id !== id));
      try {
        await ModerationService.updateReportStatus(id, {
          status: ReportStatus.UNDER_REVIEW,
        });
      } catch {
        // Si falla, volvemos a hacer un fetch silencioso para restaurar el estado real
        fetchData(true);
      }
    },
    [fetchData],
  );

  const totalPending = pendingPhotos.length + pendingReports.length;

  return (
    <PanelNotiContext.Provider
      value={{
        pendingPhotos,
        pendingReports,
        pendingPaymentsCount,
        totalPending,
        loading,
        isConnected,
        refresh: () => fetchData(true),
        markReportSeen,
      }}
    >
      {children}
    </PanelNotiContext.Provider>
  );
};
