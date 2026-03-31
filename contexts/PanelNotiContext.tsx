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
import { IdPhotosService, IdPhoto } from "@/services/IdPhotosService";
import ModerationService, {
  ContentReport,
  ReportStatus,
} from "@/services/ModerationService";
import { PaymentService, PaymentStatus } from "@/services/PaymentService";

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
    });

    socket.on("admin:photo_reviewed", (data: { photoId: number }) => {
      setPendingPhotos((prev) => prev.filter((p) => p.id !== data.photoId));
    });

    socket.on("admin:new_report", (report: ContentReport) => {
      setPendingReports((prev) =>
        prev.some((r) => r.id === report.id) ? prev : [report, ...prev],
      );
    });

    socket.on("admin:report_resolved", (data: { reportId: number }) => {
      setPendingReports((prev) => prev.filter((r) => r.id !== data.reportId));
    });

    socket.on("admin:new_payment", () => {
      setPendingPaymentsCount((n) => n + 1);
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
      }}
    >
      {children}
    </PanelNotiContext.Provider>
  );
};
