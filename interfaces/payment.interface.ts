export interface PaymentUser {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  profession?: string;
  cellphone?: string;
}

export interface ContractBid {
  id: string;
  amount: number;
  message?: string;
  isAccepted: boolean;
  createdAt: Date;
  bidder: PaymentUser;
}

export interface PaymentContract {
  id: string;
  status: string;
  initialPrice: number;
  currentPrice?: number;
  totalPrice?: number;
  suarecCommission?: number;
  priceWithoutCommission?: number;
  totalCommissionWithTax?: number;
  priceUnit: string;
  paymentMethod?: string;
  clientMessage?: string;
  providerMessage?: string;
  requestedDate?: Date;
  requestedTime?: string;
  agreedDate?: Date;
  agreedTime?: string;
  serviceAddress?: string;
  neighborhood?: string;
  quantity?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  client?: PaymentUser;
  provider?: PaymentUser;
  publication?: {
    id: string;
    title: string;
    description?: string;
  };
  bids?: ContractBid[];
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  payment_method?: string;
  reference?: string;
  wompi_payment_link?: string;
  paid_at?: Date;
  payer: PaymentUser;
  payee: PaymentUser;
  contract?: PaymentContract;
  contractTitle?: string;
  created_at: Date;
  updated_at: Date;
  completedAt?: Date;
  failureReason?: string;
}

export enum PaymentStatus {
  PENDING = "PENDING",
  FINISHED = "FINISHED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentHistoryType {
  SENT = "sent",
  RECEIVED = "received",
  ALL = "all",
}

export interface PaymentHistoryDto {
  page?: number;
  limit?: number;
  type?: PaymentHistoryType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}
