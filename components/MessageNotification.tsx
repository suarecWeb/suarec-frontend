'use client';

import React from 'react';
import Image from 'next/image';
import { X, MessageSquare, User } from 'lucide-react';

interface MessageNotificationProps {
  id: string;
  message: {
    id: string;
    content: string;
    created_at: string;
    senderId: number;
    recipientId: number;
  };
  sender: {
    id: number;
    name: string;
    profile_image?: string;
  };
  conversationId: string;
  onRemove: (id: string) => void;
  onOpenChat: (conversationId: string) => void;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({
  id,
  message,
  sender,
  conversationId,
  onRemove,
  onOpenChat,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-in slide-in-from-right-2">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {sender.profile_image ? (
            <Image
              src={sender.profile_image}
              alt={sender.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {sender.name}
            </h4>
            <button
              onClick={() => onRemove(id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {message.content}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatTime(message.created_at)}
            </span>
            
            <button
              onClick={() => onOpenChat(conversationId)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              Ver chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageNotification; 