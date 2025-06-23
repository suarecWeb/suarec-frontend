import axios from './axios_config';
import { Contract, CreateContractDto, CreateBidDto, AcceptBidDto } from '../interfaces/contract.interface';

export class ContractService {
  static async createContract(contractData: CreateContractDto): Promise<Contract> {
    const response = await axios.post('/contracts', contractData);
    return response.data;
  }

  static async createBid(bidData: CreateBidDto): Promise<any> {
    const response = await axios.post('/contracts/bid', bidData);
    return response.data;
  }

  static async acceptBid(acceptData: AcceptBidDto): Promise<Contract> {
    const response = await axios.post('/contracts/accept-bid', acceptData);
    return response.data;
  }

  static async getMyContracts(): Promise<{ asClient: Contract[], asProvider: Contract[] }> {
    const response = await axios.get('/contracts/my-contracts');
    return response.data;
  }

  static async getPublicationBids(publicationId: string): Promise<{ contracts: Contract[], totalBids: number }> {
    const response = await axios.get(`/contracts/publication/${publicationId}/bids`);
    return response.data;
  }

  static async getContractById(contractId: string): Promise<Contract> {
    const response = await axios.get(`/contracts/${contractId}`);
    return response.data;
  }

  static async cancelContract(contractId: string): Promise<Contract> {
    const response = await axios.delete(`/contracts/${contractId}/cancel`);
    return response.data;
  }
} 