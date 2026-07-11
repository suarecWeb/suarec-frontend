import api from "./axios_config";

export interface WalletAdminItem {
  userId: number;
  userName: string;
  userEmail: string;
  balance: number;
  creditBalance: number;
  debitBalance: number;
  status: string;
}

export interface WalletAdminListResponse {
  data: WalletAdminItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WalletTransactionAdminItem {
  id: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: "CREDIT" | "DEBIT";
  reference: string;
  createdAt: string;
}

export interface WalletTransactionAdminListResponse {
  data: WalletTransactionAdminItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class WalletAdminService {
  async getWallets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: "ACTIVE" | "BLOCKED",
  ): Promise<WalletAdminListResponse> {
    const response = await api.get("/suarec/wallet-admin", {
      params: {
        page,
        limit,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(status ? { status } : {}),
      },
    });
    return response.data;
  }

  async getUserTransactions(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<WalletTransactionAdminListResponse> {
    const response = await api.get(
      `/suarec/wallet-admin/${userId}/transactions`,
      {
        params: { page, limit },
      },
    );
    return response.data;
  }

  async updateWalletStatus(
    userId: number,
    status: "ACTIVE" | "BLOCKED",
  ): Promise<WalletAdminItem> {
    const response = await api.patch(`/suarec/wallet-admin/${userId}/status`, {
      status,
    });
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

export const walletAdminService = new WalletAdminService();
