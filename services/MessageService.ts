// services/MessageService.ts
import api from "./axios_config";
import { Message, CreateMessageDto, Conversation } from "@/interfaces/message.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

const baseURL = "/suarec/messages";

// Obtener todas las conversaciones del usuario
const getConversations = (userId: number) => 
  api.get<Conversation[]>(`${baseURL}/conversations/${userId}`);

// Obtener mensajes entre dos usuarios
const getMessagesBetweenUsers = (user1Id: number, user2Id: number, params?: PaginationParams) => 
  api.get<PaginationResponse<Message>>(`${baseURL}/between/${user1Id}/${user2Id}`, { params });

// Crear un nuevo mensaje
const createMessage = (messageData: CreateMessageDto) => 
  api.post<Message>(baseURL, messageData);

// Marcar mensaje como leído
const markAsRead = (messageId: string) => 
  api.patch<Message>(`${baseURL}/${messageId}/read`);

// Contar mensajes no leídos
const countUnreadMessages = (userId: number, senderId: number) => 
  api.get<number>(`${baseURL}/unread/${userId}/${senderId}`);

// Obtener mensaje por ID
const getMessageById = (id: string) => 
  api.get<Message>(`${baseURL}/${id}`);

// Eliminar mensaje (solo admin)
const deleteMessage = (id: string) => 
  api.delete(`${baseURL}/${id}`);

const MessageService = {
  getConversations,
  getMessagesBetweenUsers,
  createMessage,
  markAsRead,
  countUnreadMessages,
  getMessageById,
  deleteMessage,
};

export default MessageService;