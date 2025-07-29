// interfaces/message.interface.ts
export interface Message {
  id?: string;
  content: string;
  read: boolean;
  sent_at: Date;
  read_at?: Date;
  status?: string; // "open", "closed", "resolved", "message"
  ticket_id?: string;
  senderId: number;
  recipientId: number;

  // Relaciones para UI
  sender?: {
    id: number;
    name: string;
    profile_image?: string;
  };
  recipient?: {
    id: number;
    name: string;
    profile_image?: string;
  };
}

export interface CreateMessageDto {
  content: string;
  senderId: number;
  recipientId: number;
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
