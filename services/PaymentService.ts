import api from './axios_config';
import Cookies from 'js-cookie';

export enum PaymentHistoryType {
  SENT = 'sent',
  RECEIVED = 'received',
  ALL = 'all'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface PaymentHistoryDto {
  page?: number;
  limit?: number;
  type?: PaymentHistoryType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

export class PaymentService {
  static async createPayment(data: any) {
    const response = await api.post('suarec/payments', data);
    return response.data;
  }

  static async getUserPayments(userId: number) {
    const response = await api.get(`suarec/payments/my/${userId}`);
    return response.data;
  }

  static async getMyPaymentHistory(params: PaymentHistoryDto = {}) {
    const token = Cookies.get('token');
    const response = await api.get('suarec/payments/my-history', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}