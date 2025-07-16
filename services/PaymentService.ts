import api from "./axios_config";
import Cookies from "js-cookie";

export enum PaymentHistoryType {
  SENT = "sent",
  RECEIVED = "received",
  ALL = "all",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  FINISHED = "FINISHED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  BANK_TRANSFER = "bank_transfer",
  DIGITAL_WALLET = "digital_wallet",
  CASH = "cash",
}

export interface PaymentHistoryDto {
  page?: number;
  limit?: number;
  type?: PaymentHistoryType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

export interface AdminPaymentFilterDto {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  payerId?: number;
  payeeId?: number;
  startDate?: string;
  endDate?: string;
  contractId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface UpdatePaymentStatusDto {
  status: PaymentStatus;
}

export interface PaymentStatusByContractDto {
  contractId: string;
  hasPendingPayments: boolean;
  hasCompletedPayments: boolean;
  hasActivePayments: boolean;
  latestStatus?: PaymentStatus;
}

export class PaymentService {
  static async createPayment(data: any) {
    const response = await api.post("suarec/payments", data);
    return response.data;
  }

  static async getUserPayments(userId: number) {
    const response = await api.get(`suarec/payments/my/${userId}`);
    return response.data;
  }

  static async getMyPaymentHistory(params: PaymentHistoryDto = {}) {
    const token = Cookies.get("token");
    const response = await api.get("suarec/payments/my-history", {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async getAllPaymentsForAdmin(params: AdminPaymentFilterDto = {}) {
    const token = Cookies.get("token");

    // Limpiar parámetros undefined
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    console.log("Enviando parámetros limpios:", cleanParams); // Debug

    const response = await api.get("suarec/payments", {
      params: cleanParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  static async updatePaymentStatus(
    paymentId: string,
    updateData: UpdatePaymentStatusDto,
  ) {
    const token = Cookies.get("token");
    const response = await api.post(
      `suarec/payments/${paymentId}/update`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  }

  static async getPaymentStatusByContract(
    contractId: string,
  ): Promise<PaymentStatusByContractDto> {
    const token = Cookies.get("token");
    const response = await api.get(
      `suarec/payments/contract/${contractId}/status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  }
}
