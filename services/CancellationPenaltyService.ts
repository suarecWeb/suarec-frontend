import api from "./axios_config";

export interface CancellationPenaltyData {
  contractId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description: string;
  paymentType: string;
}

export interface CancellationPenaltyResponse {
  id: string;
  wompi_payment_link: string;
  status: string;
  amount: number;
  currency: string;
}

export class CancellationPenaltyService {
  /**
   * Crea un pago de penalización por cancelación de contrato
   */
  static async createPenaltyPayment(
    data: CancellationPenaltyData,
  ): Promise<CancellationPenaltyResponse> {
    try {
      const response = await api.post(
        `/suarec/contracts/${data.contractId}/cancellation-penalty`,
        {
          amount: data.amount,
          currency: data.currency,
          payment_method: data.paymentMethod,
          description: data.description,
          payment_type: data.paymentType,
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error creating cancellation penalty payment:", error);
      throw error;
    }
  }

  /**
   * Verifica el estado del pago de penalización
   */
  static async checkPenaltyPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await api.get(`/suarec/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error("Error checking penalty payment status:", error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de penalizaciones de cancelación para un usuario
   */
  static async getPenaltyHistory(userId: number): Promise<any[]> {
    try {
      const response = await api.get(`/suarec/payments/penalties/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting penalty history:", error);
      throw error;
    }
  }
}
