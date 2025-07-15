'use client';
import React, { createContext, useContext, ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { Message, CreateMessageDto } from '@/interfaces/message.interface';
import { useNotification } from './NotificationContext';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  sendMessage: (messageData: CreateMessageDto) => void;
  markAsRead: (messageId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  onNewMessage: (callback: (data: { message: Message; conversationId: string }) => void) => () => void;
  onMessageSent: (callback: (data: { message: Message }) => void) => () => void;
  onMessageError: (callback: (data: { error: string }) => void) => () => void;
  onMessageRead: (callback: (data: { messageId: string; readAt: Date }) => void) => () => void;
  onConversationUpdated: (callback: (data: { conversationId: string; lastMessage: Message }) => void) => () => void;
  onMessageNotification: (callback: (data: { message: Message; sender: any; conversationId: string }) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isManualDisconnect, setIsManualDisconnect] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const eventListenersRef = useRef<Map<string, Function[]>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showMessageNotification } = useNotification();

  // Función para obtener el ID del usuario actual
  const getCurrentUserId = useCallback(() => {
    if (currentUserId) return currentUserId;
    
    const token = Cookies.get('token');
    if (!token) return null;
    
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const userId = decoded.id || decoded.sub;
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }, [currentUserId]);

  const connect = useCallback(() => {
    // Verificar si estamos en una ruta de autenticación
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot', '/auth/verify-email', '/auth/check-email', '/auth/change'];
      const isAuthRoute = authRoutes.some(route => currentPath.startsWith(route));
      
      if (isAuthRoute) {
        console.log('🔒 En ruta de autenticación, saltando conexión WebSocket');
        return;
      }
    }

    // Evitar múltiples conexiones
    if (socketRef.current?.connected || isConnecting) {
      console.log('🔌 WebSocket ya conectado o conectando, saltando...');
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      console.log('🔑 No hay token de autenticación');
      return;
    }

    // Inicializar el ID del usuario actual
    getCurrentUserId();

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
        console.log('✅ WebSocket global conectado exitosamente');
        setIsConnected(true);
        setIsConnecting(false);
        setIsManualDisconnect(false);
        
        // Limpiar timeout de reconexión
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ WebSocket global desconectado:', reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Solo reconectar si no es una desconexión intencional y no hay una reconexión ya programada
        if (reason !== 'io client disconnect' && !reconnectTimeoutRef.current && !isManualDisconnect) {
          console.log('🔄 Programando reconexión global...');
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (!socketRef.current?.connected && !isConnecting) {
              connect();
            }
          }, 3000);
        }
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket global:', error);
        setIsConnected(false);
        setIsConnecting(false);
      });

      // Eventos de mensajes - GLOBAL
      socket.on('new_message', (data) => {
        console.log('📨 Nuevo mensaje recibido GLOBAL:', data);
        
        // Solo mostrar notificación si NO soy yo quien envió el mensaje
        if (data.message?.sender) {
          const userId = getCurrentUserId();
          
          // Solo mostrar notificación si el mensaje no es mío
          if (userId && data.message.senderId !== userId) {
            console.log('🔔 Mostrando notificación global para:', data.message.sender.name);
            showMessageNotification(data.message.content, data.message.sender.name, data.message.sender.id);
          } else {
            console.log('🔕 No mostrando notificación - mensaje propio');
          }
        }
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('new_message') || [];
        console.log('🎯 Distribuyendo a', listeners.length, 'listeners de new_message');
        listeners.forEach((callback, index) => {
          try {
            console.log(`📡 Ejecutando listener ${index + 1} de new_message`);
            callback(data);
          } catch (error) {
            console.error('Error en listener new_message:', error);
          }
        });
      });

      socket.on('message_sent', (data) => {
        console.log('✅ Mensaje enviado confirmado GLOBAL:', data);
        // Emitir un evento personalizado para que el chat pueda escuchar
        window.dispatchEvent(new CustomEvent('message_sent_confirmation', { detail: data }));
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('message_sent') || [];
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en listener message_sent:', error);
          }
        });
      });

      socket.on('message_read', (data) => {
        console.log('👁️ Mensaje marcado como leído GLOBAL:', data);
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('message_read') || [];
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en listener message_read:', error);
          }
        });
      });

      socket.on('conversation_updated', (data) => {
        console.log('💬 Conversación actualizada GLOBAL:', data);
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('conversation_updated') || [];
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en listener conversation_updated:', error);
          }
        });
      });

      socket.on('user_typing', (data) => {
        console.log('⌨️ Usuario escribiendo GLOBAL:', data);
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('user_typing') || [];
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en listener user_typing:', error);
          }
        });
      });

      socket.on('message_error', (data) => {
        console.error('❌ Error en mensaje GLOBAL:', data);
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('message_error') || [];
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en listener message_error:', error);
          }
        });
      });

      socket.on('mark_read_error', (data) => {
        console.error('❌ Error al marcar como leído GLOBAL:', data);
        
        // Distribuir a listeners específicos
        const listeners = eventListenersRef.current.get('mark_read_error') || [];
        listeners.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error en listener mark_read_error:', error);
          }
        });
      });

      socketRef.current = socket;
      setSocket(socket);
    } catch (error) {
      console.error('❌ Error al crear conexión WebSocket global:', error);
      setIsConnecting(false);
    }
  }, [showMessageNotification, getCurrentUserId]);

  const disconnect = useCallback(() => {
    setIsManualDisconnect(true);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  const sendMessage = useCallback((messageData: CreateMessageDto) => {
    console.log('Intentando enviar mensaje WebSocket:', messageData);
    console.log('Estado conexión:', socketRef.current?.connected);
    
    if (socketRef.current?.connected) {
      console.log('Enviando mensaje por WebSocket');
      socketRef.current.emit('send_message', messageData);
    } else {
      console.error('❌ No hay conexión WebSocket global');
    }
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_as_read', { messageId });
    } else {
      console.error('❌ No hay conexión WebSocket global');
    }
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_conversation', { conversationId });
    } else {
      console.error('Socket not connected');
    }
  }, [isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_conversation', { conversationId });
    } else {
      console.error('Socket not connected');
    }
  }, [isConnected]);

  const onNewMessage = useCallback((callback: (data: { message: Message; conversationId: string }) => void) => {
    const listeners = eventListenersRef.current.get('new_message') || [];
    listeners.push(callback);
    eventListenersRef.current.set('new_message', listeners);
    
    console.log('Listener de new_message registrado. Total listeners:', listeners.length);
    
    // Retornar función de limpieza
    return () => {
      const currentListeners = eventListenersRef.current.get('new_message') || [];
      const filteredListeners = currentListeners.filter(listener => listener !== callback);
      eventListenersRef.current.set('new_message', filteredListeners);
      console.log(' Listener de new_message removido. Listeners restantes:', filteredListeners.length);
    };
  }, []);

  const onMessageSent = useCallback((callback: (data: { message: Message }) => void) => {
    const listeners = eventListenersRef.current.get('message_sent') || [];
    listeners.push(callback);
    eventListenersRef.current.set('message_sent', listeners);
    
    // Retornar función de limpieza
    return () => {
      const currentListeners = eventListenersRef.current.get('message_sent') || [];
      const filteredListeners = currentListeners.filter(listener => listener !== callback);
      eventListenersRef.current.set('message_sent', filteredListeners);
    };
  }, []);

  const onMessageError = useCallback((callback: (data: { error: string }) => void) => {
    const listeners = eventListenersRef.current.get('message_error') || [];
    listeners.push(callback);
    eventListenersRef.current.set('message_error', listeners);
    
    // Retornar función de limpieza
    return () => {
      const currentListeners = eventListenersRef.current.get('message_error') || [];
      const filteredListeners = currentListeners.filter(listener => listener !== callback);
      eventListenersRef.current.set('message_error', filteredListeners);
    };
  }, []);

  const onMessageRead = useCallback((callback: (data: { messageId: string; readAt: Date }) => void) => {
    const listeners = eventListenersRef.current.get('message_read') || [];
    listeners.push(callback);
    eventListenersRef.current.set('message_read', listeners);
    
    // Retornar función de limpieza
    return () => {
      const currentListeners = eventListenersRef.current.get('message_read') || [];
      const filteredListeners = currentListeners.filter(listener => listener !== callback);
      eventListenersRef.current.set('message_read', filteredListeners);
    };
  }, []);

  const onConversationUpdated = useCallback((callback: (data: { conversationId: string; lastMessage: Message }) => void) => {
    const listeners = eventListenersRef.current.get('conversation_updated') || [];
    listeners.push(callback);
    eventListenersRef.current.set('conversation_updated', listeners);
    
    // Retornar función de limpieza
    return () => {
      const currentListeners = eventListenersRef.current.get('conversation_updated') || [];
      const filteredListeners = currentListeners.filter(listener => listener !== callback);
      eventListenersRef.current.set('conversation_updated', filteredListeners);
    };
  }, []);

  const onMessageNotification = useCallback((callback: (data: { message: Message; sender: any; conversationId: string }) => void) => {
    const listeners = eventListenersRef.current.get('message_notification') || [];
    listeners.push(callback);
    eventListenersRef.current.set('message_notification', listeners);
    
    // Retornar función de limpieza
    return () => {
      const currentListeners = eventListenersRef.current.get('message_notification') || [];
      const filteredListeners = currentListeners.filter(listener => listener !== callback);
      eventListenersRef.current.set('message_notification', filteredListeners);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{
      socket,
      isConnected,
      isConnecting,
      sendMessage,
      markAsRead,
      joinConversation,
      leaveConversation,
      onNewMessage,
      onMessageSent,
      onMessageError,
      onMessageRead,
      onConversationUpdated,
      onMessageNotification,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 