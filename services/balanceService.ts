import api from "./axios_config";

export interface BalanceTransaction {
  id: string;
  amount: number;
  creditBalanceBefore: number;
  creditBalanceAfter: number;
  debitBalanceBefore: number;
  debitBalanceAfter: number;
  type:
    | "otp_verification_debit"
    | "otp_verification_credit"
    | "payment_completed_credit";
  status: "pending" | "completed" | "cancelled";
  description?: string;
  reference?: string;
  contract?: {
    id: string;
    publication?: {
      title: string;
    };
  };
  paymentTransaction?: {
    id: string;
    amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BalanceHistoryResponse {
  data: BalanceTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BalanceStats {
  currentBalance: number;
  totalDebits: number;
  totalCredits: number;
  pendingDebits: number;
  canRequestNewService: boolean;
}

export interface CurrentBalance {
  debitBalance: number;
  creditBalance: number;
  canRequestNewService: boolean;
}

class BalanceService {
  /**
   * Obtiene el balance actual del usuario
   */
  async getCurrentBalance(): Promise<CurrentBalance> {
    const response = await api.get("/suarec/balance/current");
    console.log("🔍 BalanceService Response:", response.data);
    return response.data;
  }

  /**
   * Obtiene el historial de transacciones de balance
   */
  async getBalanceHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<BalanceHistoryResponse> {
    const response = await api.get("/suarec/balance/history", {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Obtiene estadísticas de balance del usuario
   */
  async getBalanceStats(): Promise<BalanceStats> {
    const response = await api.get("/suarec/balance/stats");
    return response.data;
  }

  /**
   * Verifica si el usuario puede solicitar nuevos servicios
   */
  async canRequestNewService(): Promise<{ canRequestNewService: boolean }> {
    const response = await api.get("/suarec/balance/can-request-service");
    return response.data;
  }

  /**
   * Formatea el balance para mostrar en la UI
   */
  formatBalance(balance: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  }

  /**
   * Obtiene el color del balance basado en si es positivo o negativo
   */
  getBalanceColor(balance: number): string {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-600";
  }

  /**
   * Obtiene el texto descriptivo del tipo de transacción
   */
  getTransactionTypeDescription(type: string): string {
    switch (type) {
      case "otp_verification_debit":
        return "Saldo negativo por verificación OTP";
      case "otp_verification_credit":
        return "Saldo positivo por verificación OTP";
      case "payment_completed_credit":
        return "Saldo positivo por pago completado";
      default:
        return "Transacción de balance";
    }
  }

  /**
   * Obtiene el icono para el tipo de transacción
   */
  getTransactionIcon(type: string): string {
    switch (type) {
      case "otp_verification_debit":
        return "📉";
      case "otp_verification_credit":
        return "📈";
      case "payment_completed_credit":
        return "💰";
      default:
        return "💳";
    }
  }
}

export const balanceService = new BalanceService();
