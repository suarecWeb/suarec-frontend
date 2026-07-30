// services/MessageService.ts
import api from "./axios_config";
import {
  Message,
  CreateMessageDto,
  Conversation,
  AddMessageToTicketDto,
  AdminReplyDto,
  CreateSupportTicketDto,
  SupportTicket,
  TicketStatus,
} from "@/interfaces/message.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

const baseURL = "/suarec/messages";

// Obtener todas las conversaciones del usuario
const getConversations = (userId: number) =>
  api.get<Conversation[]>(`${baseURL}/conversations/${userId}`);

// Obtener mensajes entre dos usuarios
const getMessagesBetweenUsers = (
  user1Id: number,
  user2Id: number,
  params?: PaginationParams,
) =>
  api.get<PaginationResponse<Message>>(
    `${baseURL}/between/${user1Id}/${user2Id}`,
    { params },
  );

// Crear un nuevo mensaje
const createMessage = (messageData: CreateMessageDto) =>
  api.post<Message>(baseURL, messageData);

// Crear un ticket de soporte. La identidad del usuario se toma del token.
const createSupportTicket = (ticketData: CreateSupportTicketDto) =>
  api.post<Message>(`${baseURL}/create-ticket`, ticketData);

// Enviar respuesta de admin a ticket de soporte
const sendAdminReply = (messageData: AdminReplyDto) =>
  api.post<Message>(`${baseURL}/admin-reply`, messageData);

// Marcar mensaje como leído
const markAsRead = (messageId: string) =>
  api.patch<Message>(`${baseURL}/${messageId}/read`);

// Contar mensajes no leídos
const countUnreadMessages = (userId: number, senderId: number) =>
  api.get<number>(`${baseURL}/unread/${userId}/${senderId}`);

// Obtener mensaje por ID
const getMessageById = (id: string) => api.get<Message>(`${baseURL}/${id}`);

// Eliminar mensaje (solo admin)
const deleteMessage = (id: string) => api.delete(`${baseURL}/${id}`);

// Obtener tickets de soporte (solo admin)
const getSupportTickets = (params?: PaginationParams) =>
  api.get<PaginationResponse<SupportTicket>>(`${baseURL}/support-tickets`, {
    params,
  });

// Obtener ticket activo de un usuario
const getActiveTicket = (userId: number) =>
  api.get<Message | null>(`${baseURL}/active-ticket/${userId}`);

// Actualizar estado de un ticket (solo admin)
const updateTicketStatus = (messageId: string, status: TicketStatus) =>
  api.patch<SupportTicket>(`${baseURL}/${messageId}/status`, { status });

// Obtener todos los mensajes de un ticket específico
const getTicketMessages = (ticketId: string) =>
  api.get<Message[]>(`${baseURL}/ticket/${ticketId}/messages`);

// Enviar aviso de moderación desde la plataforma (aparece como "Suarec Soporte")
const sendModerationNotice = (data: { recipientId: number; content: string }) =>
  api.post<Message>(`${baseURL}/moderation-notify`, data);

// Agregar mensaje a un ticket existente
const addMessageToTicket = (ticketId: string, content: string) => {
  const data: AddMessageToTicketDto = { ticketId, content };
  return api.post<Message>(`${baseURL}/add-to-ticket`, data);
};

const MessageService = {
  getConversations,
  getMessagesBetweenUsers,
  createMessage,
  createSupportTicket,
  sendModerationNotice,
  sendAdminReply,
  markAsRead,
  countUnreadMessages,
  getMessageById,
  deleteMessage,
  getSupportTickets,
  getActiveTicket,
  updateTicketStatus,
  getTicketMessages,
  addMessageToTicket,
};

export default MessageService;
