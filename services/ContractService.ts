import api from './axios_config';
import { Contract, CreateContractDto, CreateBidDto, AcceptBidDto, ProviderResponseDto } from '../interfaces/contract.interface';
import Cookies from 'js-cookie';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/suarec`;

export class ContractService {
  static async createContract(contractData: CreateContractDto): Promise<Contract> {
    const response = await api.post('/suarec/contracts', contractData);
    return response.data;
  }

  static async createBid(bidData: CreateBidDto): Promise<any> {
    const response = await api.post('/suarec/contracts/bid', bidData);
    return response.data;
  }

  static async acceptBid(acceptData: AcceptBidDto): Promise<Contract> {
    const response = await api.post('/suarec/contracts/accept-bid', acceptData);
    return response.data;
  }

  static async getMyContracts(): Promise<{ asClient: Contract[], asProvider: Contract[] }> {
    const response = await api.get('/suarec/contracts/my-contracts');
    return response.data;
  }

  static async getPublicationBids(publicationId: string): Promise<{ contracts: Contract[], totalBids: number }> {
    const response = await api.get(`/suarec/contracts/publication/${publicationId}/bids`);
    return response.data;
  }

  static async getContractById(contractId: string): Promise<Contract> {
    const response = await api.get(`/suarec/contracts/${contractId}`);
    return response.data;
  }

  static async cancelContract(contractId: string): Promise<Contract> {
    const response = await api.delete(`/suarec/contracts/${contractId}/cancel`);
    return response.data;
  }

  static async providerResponse(data: ProviderResponseDto): Promise<any> {
    try {
      const response = await api.post('/suarec/contracts/provider-response', data);
      return response.data;
    } catch (error) {
      console.error('Error responding to contract:', error);
      throw error;
    }
  }
} 