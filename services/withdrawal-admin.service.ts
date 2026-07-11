import api from "./axios_config";

export interface WithdrawalAdminItem {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  appliedFee: number;
  netAmount: number;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  bankName: string | null;
  accountNumberLast4: string | null;
  failureReason: string | null;
  payoutId: string | null;
  environment: "production" | "sandbox";
  createdAt: string;
  resolvedAt: string | null;
}

export interface WithdrawalAdminListResponse {
  data: WithdrawalAdminItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WithdrawalAdminDetalleResponse {
  withdrawal: WithdrawalAdminItem;
  wompiData: Record<string, unknown> | null;
  wompiError: string | null;
}

class WithdrawalAdminService {
  async getWithdrawals(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: "IN_PROGRESS" | "COMPLETED" | "FAILED",
  ): Promise<WithdrawalAdminListResponse> {
    const response = await api.get("/suarec/withdrawal-admin", {
      params: {
        page,
        limit,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(status ? { status } : {}),
      },
    });
    return response.data;
  }

  async getDetalle(id: string): Promise<WithdrawalAdminDetalleResponse> {
    const response = await api.get(`/suarec/withdrawal-admin/${id}/detalle`);
    return response.data;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
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

export const withdrawalAdminService = new WithdrawalAdminService();
