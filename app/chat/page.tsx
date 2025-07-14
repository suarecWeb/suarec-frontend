"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import MessageService from "@/services/MessageService";
import { Conversation, Message } from "@/interfaces/message.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import RoleGuard from "@/components/role-guard";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

// import MessageNotification from "@/components/MessageNotification";
import UserSearch from "@/components/UserSearch";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useNotification } from "@/contexts/NotificationContext";
import {
  MessageSquare,
  Users,
  Search,
  Send,
  Circle,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Plus,
} from "lucide-react";

const ChatPageContent = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(true);

  const [showUserSearch, setShowUserSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Notifications hook
  const { showMessageNotification } = useNotification();

      // WebSocket setup
  const {
    isConnected,
    isConnecting,
    sendMessage: sendWebSocketMessage,
    markAsRead: markAsReadWebSocket,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onMessageRead,
    onConversationUpdated,
  } = useWebSocketContext();

  // Detectar vista móvil
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);

    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // En móvil, mostrar conversaciones por defecto
  useEffect(() => {
    if (isMobileView && !selectedConversation) {
      setShowMobileConversations(true);
    }
  }, [isMobileView, selectedConversation]);

  useEffect(() => {
    const token = Cookies.get("token");
    console.log('Token encontrado:', !!token);
    
    if (!token) {
      console.log('No hay token, redirigiendo a login');
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      console.log('Token decodificado, userId:', decoded.id);
      setCurrentUserId(decoded.id);
    } catch (error) {
      console.error("Error al decodificar token:", error);
      router.push("/auth/login");
    }


  }, [router]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  // Abrir conversación específica si se recibe parámetro sender
  useEffect(() => {
    const senderId = searchParams.get('sender');
    if (senderId && conversations.length > 0 && currentUserId && !selectedConversation) {
      const senderIdNum = parseInt(senderId);
      const conversation = conversations.find(conv => conv.user.id === senderIdNum);
      
      if (conversation) {
        console.log('🔍 Abriendo conversación específica para sender:', senderIdNum);
        loadMessages(conversation);
      } else {
        console.log('❌ No se encontró conversación para sender:', senderIdNum);
      }
    }
  }, [conversations, currentUserId, searchParams, selectedConversation]);

  // Auto-scroll to bottom only within the messages container
  useEffect(() => {
    // Solo hacer scroll automático al cargar una conversación por primera vez
    if (selectedConversation && messages.length > 0 && loadingMessages === false) {
      // Usar scrollTop en lugar de scrollIntoView para evitar el scroll de toda la página
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [selectedConversation?.user.id]); // Solo cuando cambia la conversación seleccionada

  // Escuchar confirmaciones de mensajes enviados
  useEffect(() => {
    const handleMessageSent = (event: CustomEvent) => {
      console.log('✅ Mensaje enviado confirmado en chat:', event.detail);
      setSendingMessage(false);
    };

    window.addEventListener('message_sent_confirmation', handleMessageSent as EventListener);

    return () => {
      window.removeEventListener('message_sent_confirmation', handleMessageSent as EventListener);
    };
  }, []);

  // Escuchar nuevos mensajes del WebSocket
  useEffect(() => {
    if (!currentUserId) return;

    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      console.log('Nuevo mensaje recibido en chat:', data);
      console.log('Current user ID:', currentUserId);
      console.log('Selected conversation:', selectedConversation?.user.id);
      console.log('Debug datos del mensaje:', {
        messageId: data.message.id,
        senderId: data.message.senderId,
        senderIdType: typeof data.message.senderId,
        recipientId: data.message.recipientId,
        recipientIdType: typeof data.message.recipientId,
        senderObject: data.message.sender,
        content: data.message.content,
        currentUserId: currentUserId,
        currentUserIdType: typeof currentUserId
      });
      
      const { message } = data;
      
      // Solo procesar el mensaje si es relevante para el usuario actual
      if (message.recipientId === currentUserId || message.senderId === currentUserId) {
        console.log('Mensaje relevante para el usuario actual');
        
        // Actualizar mensajes si estamos en la conversación correcta
        if (selectedConversation && 
            (message.senderId === selectedConversation.user.id || 
             message.recipientId === selectedConversation.user.id)) {
          
          console.log('Actualizando mensajes en conversación activa');
          
          setMessages(prev => {
            // Evitar duplicados
            const existingMessage = prev.find(msg => msg.id === message.id);
            if (existingMessage) {
              console.log('Mensaje duplicado, saltando');
              return prev;
            }
            
            // Solo remover el mensaje temporal específico si este mensaje es la confirmación
            // Buscar un mensaje temporal que coincida con el contenido y el sender
            const tempMessageIndex = prev.findIndex(msg => 
              msg.id?.startsWith('temp_') && 
              msg.content === message.content && 
              msg.senderId === message.senderId
            );
            
            let filteredMessages = prev;
            if (tempMessageIndex !== -1) {
              // Remover solo el mensaje temporal específico
              filteredMessages = prev.filter((_, index) => index !== tempMessageIndex);
              console.log('Reemplazando mensaje temporal específico');
            } else {
              console.log('Agregando nuevo mensaje sin remover temporales');
            }
            
            // Hacer scroll automático solo si estamos cerca del final del contenedor
            setTimeout(() => {
              if (messagesContainerRef.current) {
                const container = messagesContainerRef.current;
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
                
                // Solo hacer scroll si estamos cerca del final
                if (isNearBottom) {
                  container.scrollTop = container.scrollHeight;
                }
              }
            }, 100);
            
            return [...filteredMessages, message];
          });
          
          // Marcar como leído automáticamente si soy el destinatario y estoy viendo la conversación
          if (message.recipientId === currentUserId && message.id && !message.read) {
            console.log('📖 Marcando mensaje como leído automáticamente');
            setTimeout(() => {
              if (message.id) {
                markAsReadWebSocket?.(message.id);
              }
            }, 500); // Pequeño delay para simular que el usuario "vio" el mensaje
          }
        } else {
          console.log('Mensaje no es para la conversación activa');
        }
        
        // Actualizar lista de conversaciones
        setConversations(prev => {
          const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId;
          const existingConvIndex = prev.findIndex(conv => conv.user.id === otherUserId);
          
          if (existingConvIndex !== -1) {
            // Actualizar conversación existente
            const updatedConversations = [...prev];
            updatedConversations[existingConvIndex] = {
              ...updatedConversations[existingConvIndex],
              lastMessage: message,
              unreadCount: message.recipientId === currentUserId ? 
                (updatedConversations[existingConvIndex].unreadCount || 0) + 1 : 
                updatedConversations[existingConvIndex].unreadCount || 0
            };
            // Reordenar conversaciones por último mensaje
            return sortConversationsByLastMessage(updatedConversations);
          } else {
            // Crear nueva conversación (esto requeriría más lógica para obtener datos del usuario)
            console.log('Nueva conversación necesaria para usuario:', otherUserId);
            return prev;
          }
        });
      }
    };

    const handleMessageRead = (data: { messageId: string; readAt: Date }) => {
      console.log('👁️ Mensaje marcado como leído:', data);
      
      // Actualizar el estado de leído del mensaje
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, read: true, read_at: data.readAt }
          : msg
      ));
      
      console.log('✅ Estado de lectura actualizado para mensaje:', data.messageId);
    };

    const handleConversationUpdated = (data: { conversationId: string; lastMessage: Message }) => {
      console.log('Conversación actualizada:', data);
      // La lógica ya está manejada en handleNewMessage
    };

    // Obtener el contexto WebSocket y configurar listeners
    // Los hooks ya están disponibles en el scope superior
    
    console.log('Registrando listeners de WebSocket en chat');
    console.log('Estado conexión:', isConnected);
    
    // Configurar los listeners y obtener funciones de limpieza
    const removeNewMessageListener = onNewMessage(handleNewMessage);
    const removeMessageReadListener = onMessageRead(handleMessageRead);
    const removeConversationUpdatedListener = onConversationUpdated(handleConversationUpdated);

    console.log('Listeners registrados exitosamente');

    return () => {
      console.log('🧹 Limpiando listeners de WebSocket en chat');
      // Limpiar listeners cuando el componente se desmonte
      removeNewMessageListener();
      removeMessageReadListener();
      removeConversationUpdatedListener();
    };
  }, [currentUserId, selectedConversation, markAsReadWebSocket, onNewMessage, onMessageRead, onConversationUpdated]);

  // Función para ordenar conversaciones por último mensaje (más reciente primero)
  const sortConversationsByLastMessage = (conversations: Conversation[]) => {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a.lastMessage.sent_at).getTime();
      const dateB = new Date(b.lastMessage.sent_at).getTime();
      return dateB - dateA; // Más reciente primero
    });
  };

  const fetchConversations = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await MessageService.getConversations(currentUserId);
      const sortedConversations = sortConversationsByLastMessage(response.data);
      setConversations(sortedConversations);
    } catch (err) {
      console.error("Error al cargar conversaciones:", err);
      setError("Error al cargar las conversaciones");
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation: Conversation) => {
    if (!currentUserId) return;

    try {
      setLoadingMessages(true);
      const response = await MessageService.getMessagesBetweenUsers(
        currentUserId,
        conversation.user.id,
        { page: 1, limit: 50 }
      );
      setMessages(response.data.data.reverse()); // Mostrar mensajes más antiguos primero
      setSelectedConversation(conversation);

      // En móvil, ocultar la lista de conversaciones cuando se selecciona una
      if (isMobileView) {
        setShowMobileConversations(false);
      }

      // Unirse a la conversación en WebSocket
      const conversationId = `${Math.min(currentUserId, conversation.user.id)}_${Math.max(currentUserId, conversation.user.id)}`;
      // joinConversation(conversationId); // Comentado temporalmente

      // Marcar mensajes como leídos
      const unreadMessages = response.data.data.filter(
        msg => !msg.read && msg.recipientId === currentUserId
      );
      
      for (const msg of unreadMessages) {
        if (msg.id) {
          await MessageService.markAsRead(msg.id);
        }
      }

      // Actualizar el conteo de no leídos en la conversación
      setConversations(prev =>
        prev.map(conv =>
          conv.user.id === conversation.user.id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      // También actualizar los mensajes para marcarlos como leídos localmente
      setMessages(prev =>
        prev.map(msg =>
          msg.recipientId === currentUserId
            ? { ...msg, read: true, read_at: new Date() }
            : msg
        )
      );

      // Enviar eventos de "marcado como leído" para todos los mensajes no leídos
      for (const msg of unreadMessages) {
        if (msg.id && markAsReadWebSocket) {
          markAsReadWebSocket(msg.id);
        }
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
      setError("Error al cargar los mensajes");
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUserId || sendingMessage) return;

    try {
      setSendingMessage(true);
      const messageData = {
        content: newMessage,
        senderId: currentUserId,
        recipientId: selectedConversation.user.id,
      };

      console.log('📤 Enviando mensaje a través de WebSocket:', messageData);
      console.log('🔌 WebSocket conectado:', isConnected);

      // Enviar mensaje a través de WebSocket
      sendWebSocketMessage(messageData);
      
      // Agregar el mensaje localmente (se actualizará cuando llegue la confirmación)
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        content: newMessage,
        senderId: currentUserId,
        recipientId: selectedConversation.user.id,
        sent_at: new Date(),
        read: false,
        sender: {
          id: currentUserId,
          name: "Tú",
          profile_image: undefined, // No usar foto para mensajes temporales
        },
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      // Hacer scroll automático solo dentro del contenedor de mensajes
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);

      // Actualizar la conversación con el nuevo mensaje
      setConversations(prev => {
        const updatedConversations = prev.map(conv =>
          conv.user.id === selectedConversation.user.id
            ? { ...conv, lastMessage: tempMessage }
            : conv
        );
        // Reordenar conversaciones por último mensaje
        return sortConversationsByLastMessage(updatedConversations);
      });

      // Resetear el estado de envío después de un breve delay
      setTimeout(() => {
        setSendingMessage(false);
      }, 1000);
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setError("Error al enviar el mensaje");
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };



  const handleSelectUser = (user: any) => {
    // Crear una nueva conversación con el usuario seleccionado
    const newConversation: Conversation = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image: user.profile_image,
      },
      lastMessage: {
        id: '',
        content: '',
        senderId: 0,
        recipientId: 0,
        sent_at: new Date(),
        read: false,
      },
      unreadCount: 0,
    };

    // Agregar la conversación a la lista si no existe
    const existingConversation = conversations.find(conv => conv.user.id === user.id);
    if (!existingConversation) {
      setConversations(prev => {
        const updatedConversations = [newConversation, ...prev];
        return sortConversationsByLastMessage(updatedConversations);
      });
    }

    // Cargar los mensajes (puede estar vacío si es nueva)
    loadMessages(existingConversation || newConversation);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8 mt-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Mensajes</h1>
                <p className="mt-2 text-blue-100">Comunícate con otros usuarios de la plataforma</p>
              </div>
              <ConnectionStatus isConnected={isConnected} isConnecting={isConnecting} />

            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden chat-container h-[calc(100vh-200px)]">
            <div className="flex h-full relative">
              {/* Sidebar - Lista de conversaciones */}
              <div className={`${
                isMobileView 
                  ? `absolute inset-0 z-10 ${showMobileConversations ? 'block' : 'hidden'}` 
                  : 'w-1/3'
              } border-r border-gray-200 flex flex-col bg-white`}>
                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar conversaciones..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setShowUserSearch(true)}
                      className="px-3 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2"
                      title="Nuevo mensaje"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-8 w-8 text-[#097EEC] animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">Cargando conversaciones...</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.user.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?.user.id === conversation.user.id ? "bg-blue-50 border-l-4 border-l-[#097EEC]" : ""
                        }`}
                        onClick={() => loadMessages(conversation)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {conversation.user.profile_image ? (
                              <img
                                src={conversation.user.profile_image}
                                alt={conversation.user.name}
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 bg-[#097EEC]/10 rounded-full flex items-center justify-center ${conversation.user.profile_image ? 'hidden' : ''}`}>
                              <UserIcon className="h-6 w-6 text-[#097EEC]" />
                            </div>
                            {/* Removed unread count badge */}

                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-900 truncate">{conversation.user.name}</p>
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.sent_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>

                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No tienes conversaciones aún</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`${
                isMobileView 
                  ? `absolute inset-0 z-20 ${showMobileConversations ? 'hidden' : 'block'}` 
                  : 'flex-1'
              } flex flex-col bg-white`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="chat-header p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3">
                        {isMobileView && (
                          <button
                            onClick={() => setShowMobileConversations(true)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{selectedConversation.user.name}</h3>
                          <p className="text-sm text-gray-500">{selectedConversation.user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                            {isConnected ? 'En línea' : 'Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div 
                      ref={messagesContainerRef}
                      className="flex-1 overflow-y-auto chat-messages messages-container p-4 space-y-4"
                    >
                      {loadingMessages ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 text-[#097EEC] animate-spin mx-auto mb-4" />
                          <p className="text-gray-500">Cargando mensajes...</p>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex items-end gap-2 ${message.sender?.id === currentUserId ? "justify-end" : "justify-start"}`}
                            >
                            {/* Removed profile images for sender */}
                            <div
                              className={`chat-message max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                                message.sender?.id === currentUserId
                                  ? "bg-[#097EEC] text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <div className="message-content">
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className={`text-xs ${
                                  message.sender?.id === currentUserId ? "text-blue-100" : "text-gray-500"
                                }`}>
                                  {formatTime(message.sent_at)}
                                </span>
                                {message.sender?.id === currentUserId && (
                                  <div className="w-4 h-4 flex items-center justify-center ml-1">
                                    {message.read ? (
                                      <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500" title="Leído"></div>
                                    ) : (
                                      <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200" title="Enviado"></div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Removed profile images for receiver */}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No hay mensajes en esta conversación</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="chat-input p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <textarea
                          value={newMessage}
                          onChange={handleTypingChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Escribe un mensaje..."
                          className="auto-resize-textarea flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none min-h-[40px] max-h-32"
                          rows={1}
                          disabled={sendingMessage}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-3 py-2 sm:px-4 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                        >
                          {sendingMessage ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isMobileView ? 'Selecciona una conversación' : 'Selecciona una conversación'}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {isMobileView 
                          ? 'Elige una conversación de la lista para comenzar a chatear' 
                          : 'Elige una conversación para comenzar a chatear'
                        }
                      </p>
                      {isMobileView && (
                        <button
                          onClick={() => setShowMobileConversations(true)}
                          className="mt-4 px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors"
                        >
                          Ver conversaciones
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>



        {/* User Search Modal */}
        <UserSearch
          isOpen={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelectUser={handleSelectUser}
        />
      </div>
    </>
  );
};

const ChatPage = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'PERSON', 'BUSINESS']}>
      <ChatPageContent />
    </RoleGuard>
  );
};

export default ChatPage;