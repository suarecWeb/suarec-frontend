import { User } from "./user.interface";
import { Publication } from "./publication.interface";

export enum ContractStatus {
  PENDING = 'pending',
  NEGOTIATING = 'negotiating',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
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
  bids: ContractBid[];
}

export interface CreateContractDto {
  publicationId: string;
  initialPrice: number;
  priceUnit: string;
  clientMessage?: string;
  requestedDate?: Date;
  requestedTime?: string;
}

export interface CreateBidDto {
  contractId: string;
  amount: number;
  message?: string;
}

export interface AcceptBidDto {
  bidId: string;
}

export interface ProviderResponseDto {
  contractId: string;
  action: 'accept' | 'reject' | 'negotiate';
  providerMessage?: string;
  counterOffer?: number;
  proposedDate?: Date;
  proposedTime?: string;
} 