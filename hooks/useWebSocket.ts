import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface UseWebSocketProps {
  onNewMessage?: (data: any) => void;
  onMessageSent?: (data: any) => void;
  onMessageRead?: (data: any) => void;
  onConversationUpdated?: (data: any) => void;
  onUserTyping?: (data: any) => void;
  onMessageNotification?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = (props: UseWebSocketProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Evitar múltiples conexiones
    if (socketRef.current?.connected || isConnecting) {
      return;
    }

    const token = Cookies.get('token');
    console.log('🔑 Token obtenido:', token ? 'Sí' : 'No');
    if (!token) {
      props.onError?.('No hay token de autenticación');
      return;
    }

    setIsConnecting(true);

    try {
      const socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.suarec.com'}/messages`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        forceNew: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      socket.on('connect', () => {
        console.log('✅ WebSocket conectado exitosamente');
        setIsConnected(true);
        setIsConnecting(false);
        
        // Limpiar timeout de reconexión
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket desconectado:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Solo reconectar si no es una desconexión intencional
        if (reason !== 'io client disconnect') {
          console.log('🔄 Programando reconexión...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!socketRef.current?.connected) {
              connect();
            }
          }, 2000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
        setIsConnected(false);
        setIsConnecting(false);
        props.onError?.('Error de conexión WebSocket');
      });

      // Eventos de mensajes
      socket.on('new_message', (data) => {
        console.log('📨 Nuevo mensaje recibido:', data);
        props.onNewMessage?.(data);
        
        // SIEMPRE llamar a onMessageNotification si existe
        if (props.onMessageNotification && data.message?.sender) {
          console.log('🔔 Llamando a onMessageNotification con:', {
            message: data.message,
            sender: data.message.sender,
            conversationId: data.conversationId
          });
          props.onMessageNotification({
            message: data.message,
            sender: data.message.sender,
            conversationId: data.conversationId
          });
        } else {
          console.log('❌ onMessageNotification no disponible o datos incompletos:', {
            hasCallback: !!props.onMessageNotification,
            hasMessage: !!data.message,
            hasSender: !!data.message?.sender
          });
        }
      });

      socket.on('message_sent', (data) => {
        console.log('✅ Mensaje enviado confirmado:', data);
        props.onMessageSent?.(data);
      });

      socket.on('message_read', (data) => {
        console.log('👁️ Mensaje marcado como leído:', data);
        props.onMessageRead?.(data);
      });

      socket.on('conversation_updated', (data) => {
        console.log('💬 Conversación actualizada:', data);
        props.onConversationUpdated?.(data);
      });

      socket.on('user_typing', (data) => {
        console.log('⌨️ Usuario escribiendo:', data);
        props.onUserTyping?.(data);
      });

      socket.on('message_error', (data) => {
        console.error('❌ Error en mensaje:', data);
        props.onError?.(data.error || 'Error al enviar mensaje');
      });

      socket.on('mark_read_error', (data) => {
        console.error('❌ Error al marcar como leído:', data);
        props.onError?.(data.error || 'Error al marcar mensaje como leído');
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('❌ Error al crear conexión WebSocket:', error);
      setIsConnecting(false);
      props.onError?.('Error al conectar WebSocket');
    }
  }, [props.onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  const sendMessage = useCallback((messageData: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', messageData);
    } else {
      props.onError?.('No hay conexión WebSocket');
    }
  }, [props.onError]);

  const markAsRead = useCallback((messageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_as_read', { messageId });
    } else {
      props.onError?.('No hay conexión WebSocket');
    }
  }, [props.onError]);

  const sendTypingStatus = useCallback((recipientId: number, isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { recipientId, isTyping });
    }
  }, []);

  // Conectar al montar el componente
  useEffect(() => {
    connect();

    // Limpiar al desmontar
    return () => {
      disconnect();
    };
  }, []); // Solo se ejecuta una vez

  return {
    isConnected,
    isConnecting,
    sendMessage,
    markAsRead,
    sendTypingStatus,
    connect,
    disconnect,
    joinConversation: () => {}, // Placeholder
    leaveConversation: () => {}, // Placeholder
    sendWebSocketMessage: sendMessage, // Alias para compatibilidad
    markAsReadWebSocket: markAsRead // Alias para compatibilidad
  };
}; 