export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  payer: {
    id: string;
    name: string;
    email: string;
  };
  payee: {
    id: string;
    name: string;
    email: string;
  };
  created_at: Date;
  updated_at: Date;
  completedAt?: Date;
  failureReason?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum PaymentHistoryType {
  SENT = 'sent',
  RECEIVED = 'received',
  ALL = 'all'
}

export interface PaymentHistoryDto {
  page?: number;
  limit?: number;
  type?: PaymentHistoryType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}
