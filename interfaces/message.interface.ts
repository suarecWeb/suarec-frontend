// interfaces/message.interface.ts
export type TicketStatus = "open" | "resolved" | "closed";

export interface MessageMetadata {
  subject?: string;
  [key: string]: unknown;
}

export interface MessageParticipant {
  id: number;
  name: string;
  email?: string;
  profile_image?: string;
}

export interface Message {
  id?: string;
  content: string;
  read: boolean;
  sent_at: Date | string;
  read_at?: Date | string;
  status?: TicketStatus | "message";
  ticket_id?: string;
  type?: string | null;
  metadata?: MessageMetadata | null;
  senderId: number;
  recipientId: number;

  // Relaciones para UI
  sender?: MessageParticipant;
  recipient?: MessageParticipant;
}

export interface CreateMessageDto {
  content: string;
  senderId: number;
  recipientId: number;
  ticket_id?: string;
}

export interface CreateSupportTicketDto {
  subject: string;
  description: string;
}

export interface AddMessageToTicketDto {
  ticketId: string;
  content: string;
}

export type AdminReplyDto = AddMessageToTicketDto;

export interface SupportTicket
  extends Omit<Message, "id" | "sender" | "recipient" | "status"> {
  id: string;
  status?: TicketStatus;
  sender: MessageParticipant & { email: string };
  recipient: MessageParticipant & { email: string };
}

export interface Conversation {
  user: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}
