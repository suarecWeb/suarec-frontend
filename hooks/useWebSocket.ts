import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface UseWebSocketProps {
  onNewMessage?: (data: any) => void;
  onMessageSent?: (data: any) => void;
  onMessageRead?: (data: any) => void;
  onConversationUpdated?: (data: any) => void;
  onUserTyping?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = ({
  onNewMessage,
  onMessageSent,
  onMessageRead,
  onConversationUpdated,
  onUserTyping,
  onError
}: UseWebSocketProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token = Cookies.get('token');
    if (!token) {
      onError?.('No hay token de autenticación');
      return;
    }

    setIsConnecting(true);

    try {
      const socket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/messages`, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      socket.on('connect', () => {
        console.log('WebSocket conectado');
        setIsConnected(true);
        setIsConnecting(false);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket desconectado');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error);
        setIsConnected(false);
        setIsConnecting(false);
        onError?.('Error de conexión');
      });

      // Eventos de mensajes
      socket.on('new_message', (data) => {
        console.log('Nuevo mensaje recibido:', data);
        onNewMessage?.(data);
      });

      socket.on('message_sent', (data) => {
        console.log('Mensaje enviado confirmado:', data);
        onMessageSent?.(data);
      });

      socket.on('message_read', (data) => {
        console.log('Mensaje marcado como leído:', data);
        onMessageRead?.(data);
      });

      socket.on('conversation_updated', (data) => {
        console.log('Conversación actualizada:', data);
        onConversationUpdated?.(data);
      });

      socket.on('user_typing', (data) => {
        console.log('Usuario escribiendo:', data);
        onUserTyping?.(data);
      });

      socket.on('message_error', (data) => {
        console.error('Error en mensaje:', data);
        onError?.(data.error || 'Error al enviar mensaje');
      });

      socket.on('mark_read_error', (data) => {
        console.error('Error al marcar como leído:', data);
        onError?.(data.error || 'Error al marcar mensaje como leído');
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Error al crear conexión WebSocket:', error);
      setIsConnecting(false);
      onError?.('Error al conectar WebSocket');
    }
  }, [onNewMessage, onMessageSent, onMessageRead, onConversationUpdated, onUserTyping, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((messageData: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', messageData);
    } else {
      onError?.('No hay conexión WebSocket');
    }
  }, [onError]);

  const markAsRead = useCallback((messageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_as_read', { messageId });
    } else {
      onError?.('No hay conexión WebSocket');
    }
  }, [onError]);

  const sendTypingStatus = useCallback((recipientId: number, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { recipientId, isTyping });
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    markAsRead,
    sendTypingStatus,
    connect,
    disconnect
  };
}; 