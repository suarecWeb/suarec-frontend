"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import MessageService from "@/services/MessageService";
import { Conversation, Message } from "@/interfaces/message.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import RoleGuard from "@/components/role-guard";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import CreateTicketButton from "@/components/CreateTicketButton";

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
import Image from "next/image";
import toast from "react-hot-toast";

const ChatPageContent = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
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
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [isTypingRecipient, setIsTypingRecipient] = useState(false);
  const typingCleanupRef = useRef<(() => void) | null>(null);
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
    socket,
    sendMessage: sendWebSocketMessage,
    markAsRead: markAsReadWebSocket,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onMessageRead,
    onConversationUpdated,
    sendTypingStatus,
    onUserTyping,
  } = useWebSocketContext();

  // Cleanup typing timeout al desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Escuchar typing del otro usuario
  useEffect(() => {
    if (!selectedConversation?.user?.id) return;

    const cleanup = onUserTyping(
      (data: { userId: number; isTyping: boolean }) => {
        if (data.userId === selectedConversation.user.id) {
          setIsTypingRecipient(data.isTyping);
        }
      },
    );

    typingCleanupRef.current = cleanup;
    return () => {
      cleanup();
      setIsTypingRecipient(false);
    };
  }, [selectedConversation?.user?.id, onUserTyping]);

  // Verificar conexión WebSocket al cargar la página
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      console.log(
        "🔌 WebSocket no conectado en chat, verificando en 2 segundos...",
      );
      const connectionCheck = setTimeout(() => {
        if (!isConnected && !isConnecting) {
          console.log("🔌 WebSocket aún no conectado, forzando reconexión...");
          // Forzar reconexión si no está conectado después de 2 segundos
          window.location.reload();
        }
      }, 2000);

      return () => clearTimeout(connectionCheck);
    }
  }, [isConnected, isConnecting]);

  // Escuchar cambios de estado de tickets
  useEffect(() => {
    if (!socket) return;

    const handleTicketStatusChanged = (data: {
      ticketId: string;
      status: string;
    }) => {
      if (activeTicket && activeTicket.id === data.ticketId) {
        if (data.status === "closed" || data.status === "resolved") {
          setActiveTicket(null);
          toast.success(
            data.status === "closed"
              ? "Tu ticket ha sido cerrado"
              : "Tu ticket ha sido resuelto",
          );
        }
      }
    };

    socket.on("ticket_status_changed", handleTicketStatusChanged);

    return () => {
      socket.off("ticket_status_changed", handleTicketStatusChanged);
    };
  }, [socket, activeTicket]);

  // Detectar vista móvil
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // En móvil, mostrar conversaciones por defecto
  useEffect(() => {
    if (isMobileView && !selectedConversation) {
      setShowMobileConversations(true);
    }
  }, [isMobileView, selectedConversation]);

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setCurrentUserId(decoded.id);
    } catch (error) {
      router.push("/auth/login");
    }
  }, [router]);

  // Abrir conversación específica si se recibe parámetro sender

  // Auto-scroll to bottom only within the messages container
  useEffect(() => {
    // Solo hacer scroll automático al cargar una conversación por primera vez
    if (
      selectedConversation &&
      messages.length > 0 &&
      loadingMessages === false
    ) {
      // Usar scrollTop en lugar de scrollIntoView para evitar el scroll de toda la página
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [
    selectedConversation?.user.id,
    messages.length,
    loadingMessages,
    selectedConversation,
  ]); // Solo cuando cambia la conversación seleccionada

  // Escuchar confirmaciones de mensajes enviados
  useEffect(() => {
    const handleMessageSent = (event: CustomEvent) => {
      setSendingMessage(false);
    };

    window.addEventListener(
      "message_sent_confirmation",
      handleMessageSent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "message_sent_confirmation",
        handleMessageSent as EventListener,
      );
    };
  }, []);

  // Escuchar nuevos mensajes del WebSocket
  useEffect(() => {
    if (!currentUserId) return;

    const handleNewMessage = (data: {
      message: Message;
      conversationId: string;
    }) => {
      const { message } = data;

      // Extraer senderId y recipientId del mensaje o de las relaciones
      const messageSenderId = message.senderId || message.sender?.id;
      const messageRecipientId = message.recipientId || message.recipient?.id;

      console.log("📨 Nuevo mensaje recibido:", message);
      console.log("📨 Mensaje completo:", JSON.stringify(message, null, 2));
      console.log("👤 Usuario actual:", currentUserId);
      console.log(
        "💬 Conversación seleccionada:",
        selectedConversation?.user.id,
      );
      console.log("🔍 Verificando relevancia:", {
        messageSenderId,
        messageRecipientId,
        selectedUserId: selectedConversation?.user.id,
        isRelevantForUser:
          messageRecipientId === currentUserId ||
          messageSenderId === currentUserId,
        isRelevantForConversation:
          selectedConversation &&
          (messageSenderId === selectedConversation.user.id ||
            messageRecipientId === selectedConversation.user.id),
      });

      // Solo procesar el mensaje si es relevante para el usuario actual
      if (
        messageRecipientId === currentUserId ||
        messageSenderId === currentUserId
      ) {
        // Actualizar mensajes si estamos en la conversación correcta
        if (
          selectedConversation &&
          (messageSenderId === selectedConversation.user.id ||
            messageRecipientId === selectedConversation.user.id)
        ) {
          console.log("✅ Mensaje aplicado a conversación actual");
          setMessages((prev) => {
            console.log("🔄 Actualizando mensajes. Prev count:", prev.length);
            console.log(
              "📨 Nuevo mensaje a agregar:",
              message.id,
              message.content,
            );
            console.log("📨 Mensaje ticket_id:", message.ticket_id);

            // Evitar duplicados por ID
            const existingMessage = prev.find((msg) => msg.id === message.id);
            if (existingMessage) {
              console.log("🚫 Mensaje duplicado ignorado:", message.id);
              return prev;
            }

            // Remover mensaje temporal si existe
            const tempMessageIndex = prev.findIndex(
              (msg) =>
                msg.id?.startsWith("temp_") &&
                msg.content === message.content &&
                msg.senderId === message.senderId,
            );

            let filteredMessages = prev;
            if (tempMessageIndex !== -1) {
              console.log("🗑️ Removiendo mensaje temporal:", tempMessageIndex);
              filteredMessages = prev.filter(
                (_, index) => index !== tempMessageIndex,
              );
            }

            // Agregar el mensaje directamente al final
            const newMessages = [...filteredMessages, message];
            console.log(
              "✅ Mensaje agregado. Nuevo count:",
              newMessages.length,
            );

            return newMessages;
          });

          // Comentado: Marcado como leído automático
          // if (
          //   message.recipientId === currentUserId &&
          //   message.id &&
          //   !message.read
          // ) {
          //   setTimeout(() => {
          //     if (message.id) {
          //       markAsReadWebSocket?.(message.id);
          //     }
          //   }, 500);
          // }
        } else {
        }

        // Actualizar lista de conversaciones
        setConversations((prev) => {
          const otherUserId =
            messageSenderId === currentUserId
              ? messageRecipientId
              : messageSenderId;

          // Si no podemos determinar el otherUserId, no actualizar
          if (!otherUserId) {
            return prev;
          }
          const existingConvIndex = prev.findIndex(
            (conv) => conv.user.id === otherUserId,
          );

          if (existingConvIndex !== -1) {
            // Actualizar conversación existente
            const updatedConversations = [...prev];
            updatedConversations[existingConvIndex] = {
              ...updatedConversations[existingConvIndex],
              lastMessage: message,
              unreadCount:
                message.recipientId === currentUserId
                  ? (updatedConversations[existingConvIndex].unreadCount || 0) +
                    1
                  : updatedConversations[existingConvIndex].unreadCount || 0,
            };
            // Reordenar conversaciones por último mensaje
            return sortConversationsByLastMessage(updatedConversations);
          } else {
            // Crear nueva conversación cuando es la primera vez que hablan
            console.log(
              "🆕 Creando nueva conversación para usuario:",
              otherUserId,
            );

            // Crear objeto de usuario básico para la nueva conversación
            const newConversationUser = {
              id: otherUserId,
              name: message.sender?.name || `Usuario ${otherUserId}`,
              email: "", // Email no disponible en message.sender, se actualizará cuando se recargue la lista
              profile_image: message.sender?.profile_image,
            };

            const newConversation: Conversation = {
              user: newConversationUser,
              lastMessage: message,
              unreadCount: message.recipientId === currentUserId ? 1 : 0,
            };

            // Agregar la nueva conversación al inicio de la lista
            const updatedConversations = [newConversation, ...prev];

            // La información completa del usuario se obtendrá cuando se recargue la lista de conversaciones
            console.log("✅ Nueva conversación agregada a la lista");

            return sortConversationsByLastMessage(updatedConversations);
          }
        });
      }
    };

    // Comentado: Listener de mensajes leídos
    // const handleMessageRead = (data: { messageId: string; readAt: Date }) => {
    //   console.log("📖 Evento message_read recibido:", data);
    //   setMessages((prev) =>
    //     prev.map((msg) =>
    //       msg.id === data.messageId
    //         ? { ...msg, read: true, read_at: data.readAt }
    //         : msg,
    //     ),
    //   );
    // };

    const handleConversationUpdated = (data: {
      conversationId: string;
      lastMessage: Message;
    }) => {};

    // Obtener el contexto WebSocket y configurar listeners
    // Los hooks ya están disponibles en el scope superior

    console.log("Registrando listeners de WebSocket en chat");
    console.log("Estado conexión:", isConnected);

    // Configurar los listeners y obtener funciones de limpieza
    const removeNewMessageListener = onNewMessage(handleNewMessage);
    // const removeMessageReadListener = onMessageRead(handleMessageRead); // Comentado
    const removeConversationUpdatedListener = onConversationUpdated(
      handleConversationUpdated,
    );

    return () => {
      // Limpiar listeners cuando el componente se desmonte
      removeNewMessageListener();
      // removeMessageReadListener(); // Comentado
      removeConversationUpdatedListener();
    };
  }, [
    currentUserId,
    selectedConversation,
    // markAsReadWebSocket, // Comentado
    onNewMessage,
    // onMessageRead, // Comentado
    onConversationUpdated,
    isConnected,
  ]);

  // Función para ordenar conversaciones por último mensaje (más reciente primero)
  const sortConversationsByLastMessage = (conversations: Conversation[]) => {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a.lastMessage.sent_at).getTime();
      const dateB = new Date(b.lastMessage.sent_at).getTime();
      return dateB - dateA; // Más reciente primero
    });
  };

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      console.log("🔍 Cargando conversaciones para usuario:", currentUserId);
      const response = await MessageService.getConversations(currentUserId);
      console.log("🔍 Conversaciones recibidas:", response.data);
      const sortedConversations = sortConversationsByLastMessage(response.data);
      console.log("🔍 Conversaciones ordenadas:", sortedConversations);
      setConversations(sortedConversations);
    } catch (err) {
      console.error("❌ Error al cargar conversaciones:", err);
      toast.error("Error al cargar las conversaciones");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  const loadMessages = useCallback(
    async (conversation: Conversation) => {
      console.log(
        "📥 loadMessages llamado para conversación:",
        conversation.user.id,
      );
      if (!currentUserId) return;

      try {
        setLoadingMessages(true);

        // Si es conversación con Suarec, verificar ticket activo y cargar todos los mensajes del ticket
        if (conversation.user.id === 0) {
          console.log("🎫 Cargando conversación con Suarec...");

          // Obtener ticket activo
          const ticketResponse =
            await MessageService.getActiveTicket(currentUserId);
          const activeTicket = ticketResponse.data;
          setActiveTicket(activeTicket);
          console.log("🎫 Ticket activo al cargar conversación:", activeTicket);

          if (activeTicket) {
            // Cargar todos los mensajes del ticket
            console.log("🎫 Cargando mensajes del ticket:", activeTicket.id);
            const ticketMessagesResponse =
              await MessageService.getTicketMessages(activeTicket.id!);
            const ticketMessages = ticketMessagesResponse.data.sort(
              (a, b) =>
                new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
            );
            console.log(
              "🎫 Mensajes del ticket cargados:",
              ticketMessages.length,
            );
            setMessages(ticketMessages);
          } else {
            // No hay ticket activo, cargar mensajes normales
            console.log("🎫 No hay ticket activo, cargando mensajes normales");
            const response = await MessageService.getMessagesBetweenUsers(
              currentUserId,
              conversation.user.id,
              { page: 1, limit: 50 },
            );
            const sortedMessages = response.data.data.sort(
              (a, b) =>
                new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
            );
            setMessages(sortedMessages);
          }
        } else {
          // Conversación normal con otro usuario
          console.log(
            "📥 Cargando conversación normal con usuario:",
            conversation.user.id,
          );
          const response = await MessageService.getMessagesBetweenUsers(
            currentUserId,
            conversation.user.id,
            { page: 1, limit: 50 },
          );
          console.log("📥 Respuesta de mensajes:", response.data);
          // Ordenar mensajes por fecha de enví (más antiguos primero)
          const sortedMessages = response.data.data.sort(
            (a, b) =>
              new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
          );
          console.log(
            "📥 Cargando mensajes desde API. Count:",
            sortedMessages.length,
          );
          console.log("📥 Mensajes ordenados:", sortedMessages);
          setMessages(sortedMessages);
        }

        setSelectedConversation(conversation);

        // En móvil, ocultar la lista de conversaciones cuando se selecciona una
        if (isMobileView) {
          setShowMobileConversations(false);
        }

        // Unirse a la conversación en WebSocket
        const conversationId = `${Math.min(currentUserId, conversation.user.id)}_${Math.max(currentUserId, conversation.user.id)}`;
        // joinConversation(conversationId); // Comentado temporalmente

        // Comentado: Funcionalidad de marcado como leído
        // const unreadMessages = response.data.data.filter(
        //   (msg) => !msg.read && msg.recipientId === currentUserId,
        // );

        // Actualizar el conteo de no leídos en la conversación (mantener en 0 por ahora)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.user.id === conversation.user.id
              ? { ...conv, unreadCount: 0 }
              : conv,
          ),
        );
      } catch (err) {
        console.error("❌ Error al cargar mensajes:", err);
        toast.error("Error al cargar los mensajes");
      } finally {
        setLoadingMessages(false);
      }
    },
    [currentUserId, isMobileView], // markAsReadWebSocket removido
  );

  // Abrir conversación específica si se recibe parámetro sender
  useEffect(() => {
    console.log("🔄 useEffect ejecutándose - Dependencias cambiaron");
    console.log("🔄 conversations.length:", conversations.length);
    console.log("🔄 currentUserId:", currentUserId);
    console.log("🔄 selectedConversation:", selectedConversation?.user?.id);

    const senderId = searchParams.get("sender");
    if (
      senderId &&
      conversations.length > 0 &&
      currentUserId &&
      !selectedConversation
    ) {
      const senderIdNum = parseInt(senderId);
      const conversation = conversations.find(
        (conv) => conv.user.id === senderIdNum,
      );

      if (conversation) {
        console.log(
          "🔄 Cargando mensajes para conversación:",
          conversation.user.id,
        );
        loadMessages(conversation);
      } else {
        console.log(
          "🔄 No se encontró conversación para senderId:",
          senderIdNum,
        );
      }
    } else {
      console.log("🔄 No se cumplen las condiciones para cargar mensajes");
    }
  }, [
    // conversations, // DESHABILITADO TEMPORALMENTE
    currentUserId,
    searchParams,
    selectedConversation,
  ]);

  const sendMessage = async () => {
    if (
      !newMessage.trim() ||
      !selectedConversation ||
      !currentUserId ||
      sendingMessage
    )
      return;

    // Detener indicador de typing al enviar
    if (selectedConversation?.user?.id) {
      sendTypingStatus(selectedConversation.user.id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    try {
      setSendingMessage(true);
      const messageData = {
        content: newMessage,
        senderId: currentUserId,
        recipientId: selectedConversation.user.id,
      };
      console.log("🔌 WebSocket conectado:", isConnected);

      // Si es un mensaje a Suarec, verificar si ya existe un ticket activo
      if (selectedConversation.user.id === 0) {
        console.log(
          "🎫 Enviando mensaje a Suarec, verificando ticket activo...",
        );

        // Verificar si ya existe un ticket activo
        if (activeTicket) {
          console.log("🎫 Ticket activo encontrado:", activeTicket.id);
          console.log("🎫 Agregando mensaje al ticket existente");

          // Crear mensaje temporal solo para mensajes a tickets existentes
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
              profile_image: undefined,
            },
          };

          setMessages((prev) => [...prev, tempMessage]);
          setNewMessage("");

          // Usar el endpoint específico para agregar mensaje a ticket existente
          if (socket) {
            console.log(
              "🔌 Enviando evento add_message_to_ticket al WebSocket",
            );
            socket.emit("add_message_to_ticket", {
              ticketId: activeTicket.id,
              content: newMessage,
            });
            console.log("✅ Evento enviado al WebSocket");
          } else {
            console.log("🔌 WebSocket no disponible, usando método HTTP");
            // Fallback al método HTTP
            await MessageService.addMessageToTicket(
              activeTicket.id,
              currentUserId,
              newMessage,
            );
          }
        } else {
          console.log("🎫 No hay ticket activo, enviando mensaje normal");
          // Crear mensaje temporal para nuevos tickets
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
              profile_image: undefined,
            },
          };

          setMessages((prev) => [...prev, tempMessage]);
          setNewMessage("");

          // Enviar mensaje normal (creará nuevo ticket)
          sendWebSocketMessage(messageData);
        }
      } else {
        // Mensaje normal a otro usuario
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
            profile_image: undefined,
          },
        };

        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage("");

        // Mensaje normal a otro usuario
        sendWebSocketMessage(messageData);
      }

      // Hacer scroll automático solo dentro del contenedor de mensajes
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);

      // Actualizar la conversación con el nuevo mensaje
      setConversations((prev) => {
        const updatedConversations = prev.map((conv) =>
          conv.user.id === selectedConversation.user.id
            ? {
                ...conv,
                lastMessage: {
                  id: `temp_${Date.now()}`,
                  content: newMessage,
                  senderId: currentUserId,
                  recipientId: selectedConversation.user.id,
                  read: false,
                  sent_at: new Date(),
                  status: "message",
                } as Message,
              }
            : conv,
        );
        // Reordenar conversaciones por último mensaje
        return sortConversationsByLastMessage(updatedConversations);
      });

      // Resetear el estado de envío después de un breve delay
      setTimeout(() => {
        setSendingMessage(false);
      }, 1000);
    } catch (err) {
      toast.error("Error al enviar el mensaje");
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    // Auto resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";

    // Enviar estado de typing
    const recipientId = selectedConversation?.user?.id;
    if (recipientId) {
      if (value.length > 0) {
        sendTypingStatus(recipientId, true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingStatus(recipientId, false);
        }, 2000);
      } else {
        sendTypingStatus(recipientId, false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
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
        id: "",
        content: "",
        senderId: 0,
        recipientId: 0,
        sent_at: new Date(),
        read: false,
      },
      unreadCount: 0,
    };

    // Agregar la conversación a la lista si no existe
    const existingConversation = conversations.find(
      (conv) => conv.user.id === user.id,
    );
    if (!existingConversation) {
      setConversations((prev) => {
        const updatedConversations = [newConversation, ...prev];
        return sortConversationsByLastMessage(updatedConversations);
      });
    }

    // Cargar los mensajes (puede estar vacío si es nueva)
    loadMessages(existingConversation || newConversation);
  };

  const handleContactSuarec = async () => {
    try {
      if (!currentUserId) return;

      setLoadingTicket(true);

      // Verificar ticket activo
      const response = await MessageService.getActiveTicket(currentUserId);
      const ticket = response.data;
      setActiveTicket(ticket);

      console.log("🎫 Ticket activo encontrado:", ticket);

      // Crear conversación con Suarec
      const suarecUser = {
        id: 0,
        name: "Suarec - Soporte",
        email: "soporte@suarec.com",
        profile_image: undefined,
      };

      const suarecConversation: Conversation = {
        user: suarecUser,
        lastMessage: {
          id: "",
          content: "",
          senderId: 0,
          recipientId: 0,
          sent_at: new Date(),
          read: false,
        },
        unreadCount: 0,
      };

      // Buscar si ya existe una conversación con Suarec
      const existingSuarecConversation = conversations.find(
        (conv) => conv.user.id === 0,
      );

      if (!existingSuarecConversation) {
        setConversations((prev) => {
          const updatedConversations = [suarecConversation, ...prev];
          return sortConversationsByLastMessage(updatedConversations);
        });
      }

      // Cargar los mensajes
      loadMessages(existingSuarecConversation || suarecConversation);
    } catch (error) {
      console.error("Error al verificar ticket activo:", error);
      toast.error("Error al verificar tickets activos");
    } finally {
      setLoadingTicket(false);
    }
  };

  const handleTicketCreated = (ticket: any) => {
    setActiveTicket(ticket);
    toast.success("Ticket creado exitosamente");
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <p className="mt-2 text-blue-100">
                  Comunícate con otros usuarios de la plataforma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden chat-container h-[calc(100vh-200px)]">
            <div className="flex h-full relative">
              {/* Sidebar - Lista de conversaciones */}
              <div
                className={`${
                  isMobileView
                    ? `absolute inset-0 z-10 ${showMobileConversations ? "block" : "hidden"}`
                    : "w-1/3"
                } border-r border-gray-200 flex flex-col bg-white`}
              >
                {/* Search and Actions */}
                <div className="p-4 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-white">
                  <div className="space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar conversaciones..."
                        className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] transition-all outline-none bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUserSearch(true)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-md transition-all flex items-center justify-center gap-2 font-medium text-sm"
                        title="Nuevo mensaje"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Chat</span>
                      </button>
                      <button
                        onClick={() => handleContactSuarec()}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 hover:shadow-md transition-all flex items-center justify-center gap-2 font-medium text-sm"
                        title="Contactar a Suarec"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Soporte</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {loading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-8 w-8 text-[#097EEC] animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">
                        Cargando conversaciones...
                      </p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.user.id}
                        className={`group p-4 border-b border-gray-200/60 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-gray-50/30 transition-all duration-200 relative ${
                          selectedConversation?.user.id === conversation.user.id
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50/30 shadow-sm mx-2 rounded-xl border border-blue-200/60"
                            : ""
                        }`}
                        onClick={() => {
                          console.log(
                            "🖱️ Clic en conversación:",
                            conversation.user.name,
                            conversation.user.id,
                          );
                          loadMessages(conversation);
                        }}
                      >
                        {/* Línea indicadora con border-radius */}
                        {selectedConversation?.user.id ===
                          conversation.user.id && (
                          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-[#097EEC] rounded-full"></div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {conversation.user.profile_image ? (
                              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                                <Image
                                  src={conversation.user.profile_image}
                                  alt={conversation.user.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden",
                                    );
                                  }}
                                />
                              </div>
                            ) : null}
                            <div
                              className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-md ${conversation.user.profile_image ? "hidden" : ""}`}
                            >
                              <UserIcon className="h-6 w-6 text-white" />
                            </div>
                            {/* Removed unread count badge */}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-200">
                                {conversation.user.name}
                              </p>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-all duration-200">
                                {formatTime(conversation.lastMessage.sent_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No tienes conversaciones aún
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div
                className={`${
                  isMobileView
                    ? `absolute inset-0 z-20 ${showMobileConversations ? "hidden" : "block"}`
                    : "flex-1"
                } flex flex-col bg-white`}
              >
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="chat-header p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
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
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.user.email}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {isConnected ? (
                            <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full border border-green-200">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                              <span className="text-xs font-medium text-green-700">
                                En línea
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-red-100 px-3 py-1.5 rounded-full border border-red-200">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span className="text-xs font-medium text-red-700">
                                Desconectado
                              </span>
                            </div>
                          )}
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
                        messages.map((message, index) => {
                          const isFirstMessage = index === 0;
                          const currentDate = new Date(
                            message.sent_at,
                          ).toDateString();
                          const prevDate = !isFirstMessage
                            ? new Date(
                                messages[index - 1].sent_at,
                              ).toDateString()
                            : null;
                          const showDateSeparator =
                            isFirstMessage || currentDate !== prevDate;

                          return (
                            <div key={message.id} className="w-full">
                              {showDateSeparator && (
                                <div className="flex justify-center my-6">
                                  <span className="bg-gray-100 text-gray-500 text-xs font-medium py-1.5 px-4 rounded-full shadow-sm border border-gray-200/50">
                                    {formatDate(message.sent_at)}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`flex items-end gap-3 mb-4 ${message.sender?.id === currentUserId ? "justify-end" : "justify-start"}`}
                              >
                                {/* Removed profile images for sender */}
                                <div
                                  className={`chat-message max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-2xl break-words shadow-sm ${
                                    message.sender?.id === currentUserId
                                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md"
                                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-bl-md border border-gray-200/60"
                                  }`}
                                >
                                  <div className="message-content">
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                      {message.content}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-end gap-1 mt-2">
                                    <span
                                      className={`text-xs font-medium ${
                                        message.sender?.id === currentUserId
                                          ? "text-blue-100"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {formatTime(message.sent_at)}
                                    </span>
                                  </div>
                                </div>
                                {/* Removed profile images for receiver */}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No hay mensajes en esta conversación
                          </p>
                        </div>
                      )}
                      {isTypingRecipient && (
                        <div className="flex items-end gap-3 mb-4 justify-start">
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 rounded-2xl rounded-bl-md border border-gray-200/60 px-4 py-3 shadow-sm max-w-[120px]">
                            <div className="flex items-center gap-1">
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="chat-input p-4 border-t border-gray-200">
                      {/* Mostrar botón de crear ticket solo si es conversación con Suarec y no hay ticket activo */}
                      {selectedConversation?.user.id === 0 &&
                        !activeTicket &&
                        !loadingTicket && (
                          <div className="mb-4">
                            <CreateTicketButton
                              onTicketCreated={handleTicketCreated}
                            />
                          </div>
                        )}

                      {/* Mostrar mensaje si hay ticket activo */}
                      {selectedConversation?.user.id === 0 && activeTicket && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-blue-700">
                              Ticket activo: #{activeTicket.id}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-200/60 shadow-sm">
                        <textarea
                          value={newMessage}
                          onChange={handleTypingChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Escribe un mensaje..."
                          className="auto-resize-textarea flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] transition-all outline-none resize-none min-h-[44px] max-h-32 bg-white shadow-sm"
                          rows={1}
                          disabled={sendingMessage}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px] shadow-sm hover:scale-105"
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
                        {isMobileView
                          ? "Selecciona una conversación"
                          : "Selecciona una conversación"}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {isMobileView
                          ? "Elige una conversación de la lista para comenzar a chatear"
                          : "Elige una conversación para comenzar a chatear"}
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
    <RoleGuard allowedRoles={["ADMIN", "PERSON", "BUSINESS"]}>
      <ChatPageContent />
    </RoleGuard>
  );
};

export default ChatPage;
