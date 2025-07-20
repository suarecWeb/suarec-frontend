import api from "./axios_config";
import {
  Contract,
  CreateContractDto,
  CreateBidDto,
  AcceptBidDto,
  ProviderResponseDto,
} from "../interfaces/contract.interface";
import { CreateMessageDto } from "../interfaces/message.interface";
import { TokenPayload } from "../interfaces/auth.interface";
import MessageService from "./MessageService";
import EmailVerificationService from "./EmailVerificationService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/suarec`;

export class ContractService {
  static async createContract(
    contractData: CreateContractDto,
  ): Promise<Contract> {
    const response = await api.post("/suarec/contracts", contractData);
    const contract = response.data;

    // Enviar notificación interna después de crear el contrato exitosamente
    try {
      const currentUserId = this.getCurrentUserId();
      
      if (currentUserId && contract && contract.provider) {
        const clientName = contract.client?.name || "Un cliente";
        const serviceTitle = contract.publication?.title || "Servicio solicitado";
        
        // Notificación interna para el proveedor
        const internalMessage = `🔔 Nueva solicitud de servicio: ${clientName} ha solicitado tu servicio "${serviceTitle}". Revisa los detalles y responde en la sección de contratos.`;
        
        await this.sendInternalNotification(
          currentUserId, // ID del cliente (quien envía)
          contract.provider.id, // ID del proveedor (quien recibe)
          internalMessage
        );

        // Enviar notificación por email al proveedor sobre la nueva solicitud
        // TODO: Cambiar cuando sirva BREVO
        if (false) {
          await EmailVerificationService.sendServiceContractNotification({
            recipientEmail: contract.provider.email,
            recipientName: contract.provider.name,
            notificationType: "IN_PROGRESS",
            contractData: {
              contractId: contract.id,
              serviceTitle: serviceTitle,
              clientName: clientName,
              agreedPrice: contract.totalPrice,
              currency: "COP",
              customMessage: contract.clientMessage
            }
          });
        }
      }
    } catch (notificationError) {
      console.error("Error sending contract creation notification:", notificationError);
      // No lanzamos el error para no afectar la creación del contrato
    }

    return contract;
  }

  static async createBid(bidData: CreateBidDto): Promise<any> {
    const response = await api.post("/suarec/contracts/bid", bidData);
    return response.data;
  }

  static async acceptBid(acceptData: AcceptBidDto): Promise<Contract> {
    const response = await api.post("/suarec/contracts/accept-bid", acceptData);
    return response.data;
  }

  static async getMyContracts(): Promise<{
    asClient: Contract[];
    asProvider: Contract[];
  }> {
    const response = await api.get("/suarec/contracts/my-contracts");
    return response.data;
  }

  static async getPublicationBids(
    publicationId: string,
  ): Promise<{ contracts: Contract[]; totalBids: number }> {
    const response = await api.get(
      `/suarec/contracts/publication/${publicationId}/bids`,
    );
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
      const response = await api.post(
        "/suarec/contracts/provider-response",
        data,
      );
      const updatedContract = response.data;

      // Enviar notificación interna después de responder exitosamente
      try {
        const currentUserId = this.getCurrentUserId();
        
        if (currentUserId && updatedContract && updatedContract.client) {
          const clientName = updatedContract.client.name;
          const providerName = updatedContract.provider?.name || "El proveedor";
          const serviceTitle = updatedContract.publication?.title || "Tu servicio solicitado";
          
          let internalMessage: string;
          let emailNotificationType: "ACCEPTED" | "REJECTED" | "IN_PROGRESS";

          // Determinar el mensaje basado en la acción
          switch (data.action) {
            case "accepted":
              internalMessage = `✅ ¡Buenas noticias! ${providerName} ha aceptado tu solicitud para "${serviceTitle}". Puedes coordinar los detalles en la sección de contratos.`;
              emailNotificationType = "ACCEPTED";
              break;
            case "rejected":
              internalMessage = `❌ ${providerName} ha rechazado tu solicitud para "${serviceTitle}". Puedes buscar otros proveedores o contactar directamente para más información.`;
              emailNotificationType = "REJECTED";
              break;
            case "negotiating":
              internalMessage = `💬 ${providerName} ha propuesto cambios en tu solicitud para "${serviceTitle}". Revisa la propuesta en la sección de contratos.`;
              emailNotificationType = "IN_PROGRESS";
              break;
            default:
              internalMessage = `📋 ${providerName} ha respondido a tu solicitud para "${serviceTitle}". Revisa los detalles en la sección de contratos.`;
              emailNotificationType = "IN_PROGRESS";
          }

          // Notificación interna para el cliente
          await this.sendInternalNotification(
            currentUserId, // ID del proveedor (quien envía)
            updatedContract.client.id, // ID del cliente (quien recibe)
            internalMessage
          );

          // Enviar notificación por email al cliente sobre la respuesta del proveedor
          // TODO: Cambiar cuando sirva BREVO
          if (updatedContract.client.email) {
            await EmailVerificationService.sendServiceContractNotification({
              recipientEmail: updatedContract.client.email,
              recipientName: updatedContract.client.name,
              notificationType: emailNotificationType,
              contractData: {
                contractId: updatedContract.id,
                serviceTitle: serviceTitle,
                providerName: providerName,
                agreedPrice: updatedContract.currentPrice || updatedContract.totalPrice,
                currency: "COP",
                customMessage: data.providerMessage
              }
            });
          }
        }
      } catch (notificationError) {
        console.error("Error sending provider response notification:", notificationError);
        // No lanzamos el error para no afectar la respuesta del proveedor
      }

      return response.data;
    } catch (error) {
      console.error("Error responding to contract:", error);
      throw error;
    }
  }

  // Función auxiliar para enviar notificaciones internas de Suarec
  private static async sendInternalNotification(
    senderId: number,
    recipientId: number,
    message: string
  ): Promise<void> {
    try {
      const messageData: CreateMessageDto = {
        content: message,
        senderId,
        recipientId,
      };
      
      await MessageService.createMessage(messageData);
    } catch (error) {
      console.error("Error sending internal notification:", error);
      // No lanzamos el error para no bloquear el flujo principal
    }
  }

  // Función auxiliar para obtener el ID del usuario actual
  private static getCurrentUserId(): number | null {
    try {
      const token = Cookies.get("token");
      
      if (token) {
        const decoded = jwtDecode<TokenPayload>(token);
        const userId = decoded.id ? Number(decoded.id) : null;
        return userId;
      }
      
      return null;
    } catch (error) {
      console.error("❌ Error decoding token:", error);
      return null;
    }
  }
}
