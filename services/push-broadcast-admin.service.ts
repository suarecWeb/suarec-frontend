import api from "./axios_config";

export enum PushBroadcastDeepLink {
  EVENTOS = "eventos",
}

export interface CreatePushBroadcastPayload {
  title: string;
  body: string;
  deepLink?: PushBroadcastDeepLink;
  // Roadmap notificaciones-programadas.txt: ISO 8601 con offset explícito
  // (hora Colombia -05:00, ver toColombiaISOString) -- sin esto, envío
  // inmediato (comportamiento original)
  scheduledFor?: string;
  repeatDaily?: boolean;
}

export interface PushBroadcastItem {
  id: string;
  title: string;
  body: string;
  type: string;
  deepLink: string | null;
  status: "pending" | "processing" | "done" | "failed";
  totalTokens: number | null;
  successCount: number;
  errorCount: number;
  createdAt: string;
  processedAt: string | null;
  errorMessage: string | null;
  scheduledFor: string | null;
  repeatDaily: boolean;
}

// Colombia es UTC-5 FIJO (sin horario de verano) -- mismo offset que ya usa
// el backend (getColombiaStartOfDay en push-broadcast.service.ts). Arma un
// ISO con el offset explícito para que nunca dependa de la zona horaria del
// navegador del admin (RF-9 del roadmap).
const COLOMBIA_OFFSET = "-05:00";

class PushBroadcastAdminService {
  async create(
    payload: CreatePushBroadcastPayload,
  ): Promise<PushBroadcastItem> {
    const response = await api.post("/suarec/push/broadcast", payload);
    return response.data;
  }

  async getHistory(): Promise<PushBroadcastItem[]> {
    const response = await api.get("/suarec/push/broadcast/history");
    return response.data;
  }

  async getScheduled(): Promise<PushBroadcastItem[]> {
    const response = await api.get("/suarec/push/broadcast/programadas");
    return response.data;
  }

  async cancel(id: string): Promise<void> {
    await api.delete(`/suarec/push/broadcast/${id}`);
  }

  // dateStr: "2026-10-17", timeStr: "18:00" (inputs nativos <input type="date"/"time">)
  toColombiaISOString(dateStr: string, timeStr: string): string {
    return `${dateStr}T${timeStr}:00${COLOMBIA_OFFSET}`;
  }

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Bogota",
    }).format(new Date(dateString));
  }
}

export const pushBroadcastAdminService = new PushBroadcastAdminService();
