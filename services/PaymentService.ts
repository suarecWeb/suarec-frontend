import api from './axios_config';

export class PaymentService {
  static async createPayment(data: any) {
    const response = await api.post('suarec/payments', data);
    return response.data;
  }
} 