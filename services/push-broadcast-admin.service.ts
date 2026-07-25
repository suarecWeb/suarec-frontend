import api from "./axios_config";

export enum PushBroadcastDeepLink {
  EVENTOS = "eventos",
}

export interface CreatePushBroadcastPayload {
  title: string;
  body: string;
  deepLink?: PushBroadcastDeepLink;
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
}

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
