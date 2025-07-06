"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import MessageService from "@/services/MessageService";
import { Conversation, Message } from "@/interfaces/message.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import RoleGuard from "@/components/role-guard";
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
  const router = useRouter();

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
      console.error("Error al decodificar token:", error);
      router.push("/auth/login");
    }

  }, [router]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  const fetchConversations = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await MessageService.getConversations(currentUserId);
      setConversations(response.data);
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
      conversation.unreadCount = 0;
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

      const response = await MessageService.createMessage(messageData);
      
      // Agregar el mensaje a la lista local
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");

      // Actualizar la conversación con el nuevo mensaje
      setConversations(prev =>
        prev.map(conv =>
          conv.user.id === selectedConversation.user.id
            ? { ...conv, lastMessage: response.data }
            : conv
        )
      );
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setError("Error al enviar el mensaje");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Mensajes</h1>
            <p className="mt-2 text-blue-100">Comunícate con otros usuarios de la plataforma</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-200px)]">
            <div className="flex h-full">
              {/* Sidebar - Lista de conversaciones */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
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
                            {conversation.unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </div>
                            )}
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
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3">
                        {selectedConversation.user.profile_image ? (
                          <img
                            src={selectedConversation.user.profile_image}
                            alt={selectedConversation.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 bg-[#097EEC]/10 rounded-full flex items-center justify-center ${selectedConversation.user.profile_image ? 'hidden' : ''}`}>
                          <UserIcon className="h-5 w-5 text-[#097EEC]" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedConversation.user.name}</h3>
                          <p className="text-sm text-gray-500">{selectedConversation.user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                            {message.sender?.id !== currentUserId && (
                              <div className="flex-shrink-0">
                                {message.sender?.profile_image ? (
                                  <img
                                    src={message.sender.profile_image}
                                    alt={message.sender.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-8 h-8 bg-[#097EEC]/10 rounded-full flex items-center justify-center ${message.sender?.profile_image ? 'hidden' : ''}`}>
                                  <UserIcon className="h-4 w-4 text-[#097EEC]" />
                                </div>
                              </div>
                            )}
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender?.id === currentUserId
                                  ? "bg-[#097EEC] text-white"
                                  : "bg-gray-200 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className={`text-xs ${
                                  message.sender?.id === currentUserId ? "text-blue-100" : "text-gray-500"
                                }`}>
                                  {formatTime(message.sent_at)}
                                </span>
                                {message.sender?.id === currentUserId && (
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    {message.read ? (
                                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    ) : (
                                      <Circle className="w-3 h-3 text-blue-100" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {message.sender?.id === currentUserId && (
                              <div className="flex-shrink-0">
                                {message.sender?.profile_image ? (
                                  <img
                                    src={message.sender.profile_image}
                                    alt={message.sender.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-8 h-8 bg-[#097EEC]/10 rounded-full flex items-center justify-center ${message.sender?.profile_image ? 'hidden' : ''}`}>
                                  <UserIcon className="h-4 w-4 text-[#097EEC]" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No hay mensajes en esta conversación</p>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Escribe un mensaje..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                          rows={1}
                          disabled={sendingMessage}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
                      <p className="text-gray-500">Elige una conversación para comenzar a chatear</p>
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
      </div>
    </>
  );
};

const ChatPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS", "PERSON"]}>
      <ChatPageContent />
    </RoleGuard>
  );
};

export default ChatPage;