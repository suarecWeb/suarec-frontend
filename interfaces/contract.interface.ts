import { User } from "./user.interface";
import { Publication } from "./publication.interface";

export enum ContractStatus {
  PENDING = "pending",
  NEGOTIATING = "negotiating",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export interface ContractBid {
  id: string;
  contractId: string;
  bidderId: number;
  bidder?: User;
  amount: number;
  message?: string;
  isAccepted: boolean;
  createdAt: Date;
}

export interface Contract {
  id: string;
  publicationId: string;
  publication?: Publication;
  clientId: number;
  client?: User;
  totalPrice: number;
  paymentMethod: string;
  originalPaymentMethod?: string;
  serviceAddress: string;
  propertyType: string;
  neighborhood: string;
  locationDescription?: string;
  providerId: number;
  provider?: User;
  initialPrice: number;
  currentPrice: number;
  priceUnit: string;
  status: ContractStatus;
  clientMessage?: string;
  providerMessage?: string;
  requestedDate?: Date;
  requestedTime?: string;
  agreedDate?: Date;
  agreedTime?: string;
  createdAt: Date;
  updatedAt: Date;
  deleted_at?: Date;
  bids: ContractBid[];
}

export interface CreateContractDto {
  publicationId: string;
  initialPrice: number;
  totalPrice: number;
  priceUnit: string;
  clientMessage?: string;
  requestedDate: Date;
  requestedTime: string;
  paymentMethod: string;
  originalPaymentMethod?: string;
  serviceAddress: string;
  propertyType: string;
  neighborhood: string;
  locationDescription?: string;
}

export interface CreateBidDto {
  contractId: string;
  bidderId: number;
  amount: number;
  message?: string;
}

export interface AcceptBidDto {
  bidId: string;
  acceptorId: number;
}

export interface ProviderResponseDto {
  contractId: string;
  action:
    | ContractStatus.ACCEPTED
    | ContractStatus.REJECTED
    | ContractStatus.NEGOTIATING;
  providerMessage?: string;
  counterOffer?: number;
  proposedDate?: Date;
  proposedTime?: string;
}
