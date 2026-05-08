"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import MessageService from "@/services/MessageService";
import { Message } from "@/interfaces/message.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import RoleGuard from "@/components/role-guard";
import Image from "next/image";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  Calendar,
  User,
  Mail,
  X,
  Send,
  ChevronLeft,
  Inbox,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

interface Ticket {
  id: string;
  content: string;
  senderId: number;
  recipientId: number;
  sent_at: Date;
  read: boolean;
  status?: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  recipient: {
    id: number;
    name: string;
    email: string;
  };
}

const STATUS_CONFIG = {
  resolved: {
    label: "Resuelto",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  closed: {
    label: "Cerrado",
    icon: <X className="h-3.5 w-3.5" />,
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  },
  open: {
    label: "Pendiente",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  default: {
    label: "Pendiente",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

const getStatusConfig = (status?: string) =>
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.default;

const formatDate = (dateString: Date | string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (dateString: Date | string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = diffMs / (1000 * 60 * 60);

  if (diffH < 24)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diffH < 48) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [ticketMessages, setTicketMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { sendMessage, socket } = useWebSocketContext();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (!decoded.roles.some((r) => r.name === "ADMIN")) {
        router.push("/access-denied");
        return;
      }
    } catch {
      router.push("/auth/login");
      return;
    }
    fetchTickets();
  }, [router]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [ticketMessages]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await MessageService.getSupportTickets({
        page: 1,
        limit: 100,
      });
      setTickets(response.data.data as Ticket[]);
    } catch {
      toast.error("Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const response = await MessageService.getTicketMessages(ticketId);
      const sorted = response.data.sort(
        (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
      );
      setTicketMessages(sorted);
    } catch {
      toast.error("Error al cargar los mensajes del ticket");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleTicketSelect = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setReplyMessage("");
    await loadTicketMessages(ticket.id);
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      setSendingReply(true);
      if (socket) {
        socket.emit("admin_reply", {
          ticketId: selectedTicket.id,
          content: replyMessage,
        });
        socket.once("admin_reply_sent", () => {
          toast.success("Respuesta enviada");
          setReplyMessage("");
          loadTicketMessages(selectedTicket.id);
        });
        socket.once("error", () => toast.error("Error al enviar la respuesta"));
      } else {
        await MessageService.sendAdminReply({
          ticketId: selectedTicket.id,
          content: replyMessage,
        });
        toast.success("Respuesta enviada");
        setReplyMessage("");
        await loadTicketMessages(selectedTicket.id);
      }
    } catch {
      toast.error("Error al enviar la respuesta");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await MessageService.updateTicketStatus(ticketId, newStatus);
      toast.success(
        `Ticket marcado como ${newStatus === "resolved" ? "resuelto" : "cerrado"}`,
      );
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((t) => (t ? { ...t, status: newStatus } : t));
      }
    } catch {
      toast.error("Error al actualizar el estado del ticket");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.sender.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" &&
        (!ticket.status || ticket.status === "open")) ||
      (statusFilter === "resolved" && ticket.status === "resolved") ||
      (statusFilter === "closed" && ticket.status === "closed");

    return matchesSearch && matchesStatus;
  });

  const pendingCount = tickets.filter(
    (t) => !t.status || t.status === "open",
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#097EEC]/10 flex items-center justify-center">
                  <Image
                    src="/tickets.png"
                    alt="Tickets"
                    width={22}
                    height={22}
                    className="opacity-80"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 leading-none">
                    Tickets de Soporte
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tickets.length} total · {pendingCount} pendientes
                  </p>
                </div>
              </div>
            </div>

            {/* Stats chips */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                <Clock className="h-3.5 w-3.5" />
                {pendingCount} pendientes
              </span>
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                {resolvedCount} resueltos
              </span>
            </div>
          </div>
        </div>

        {/* Main layout — inbox split */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4 h-[calc(100vh-12rem)]">
            {/* Left — ticket list */}
            <div
              className={`flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${selectedTicket ? "hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0" : "flex-1"}`}
            >
              {/* Search + filter */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar tickets..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-1.5">
                  {[
                    { value: "all", label: "Todos" },
                    { value: "pending", label: "Pendientes" },
                    { value: "resolved", label: "Resueltos" },
                    { value: "closed", label: "Cerrados" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                        statusFilter === opt.value
                          ? "bg-[#097EEC] text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#097EEC] border-t-transparent" />
                    <p className="text-sm">Cargando tickets...</p>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 px-6">
                    <Inbox className="h-10 w-10 opacity-40" />
                    <p className="text-sm text-center">
                      {searchTerm || statusFilter !== "all"
                        ? "No hay tickets con ese filtro"
                        : "No hay tickets de soporte"}
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => {
                    const sc = getStatusConfig(ticket.status);
                    const isSelected = selectedTicket?.id === ticket.id;
                    return (
                      <button
                        key={ticket.id}
                        onClick={() => handleTicketSelect(ticket)}
                        className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-gray-50 ${
                          isSelected
                            ? "bg-[#097EEC]/5 border-l-2 border-[#097EEC]"
                            : "border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {ticket.sender.name}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatShortDate(ticket.sent_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2 leading-snug">
                          {ticket.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.className}`}
                          >
                            {sc.icon}
                            {sc.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            #{ticket.id.slice(0, 8)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right — conversation panel */}
            {selectedTicket ? (
              <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0">
                {/* Conversation header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#097EEC] to-[#082D50] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {selectedTicket.sender.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedTicket.sender.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {selectedTicket.sender.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(() => {
                      const sc = getStatusConfig(selectedTicket.status);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.className}`}
                        >
                          {sc.icon}
                          {sc.label}
                        </span>
                      );
                    })()}

                    {selectedTicket.status !== "resolved" &&
                      selectedTicket.status !== "closed" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(selectedTicket.id, "resolved")
                            }
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(selectedTicket.id, "closed")
                            }
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors font-medium"
                          >
                            Cerrar
                          </button>
                        </>
                      )}
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f5f7fb]"
                >
                  {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#097EEC] border-t-transparent" />
                      <p className="text-sm">Cargando mensajes...</p>
                    </div>
                  ) : ticketMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                      <MessageSquare className="h-10 w-10 opacity-40" />
                      <p className="text-sm">No hay mensajes en este ticket</p>
                    </div>
                  ) : (
                    ticketMessages.map((message, index) => {
                      const isAdmin = message.sender?.id === 0;
                      return (
                        <div
                          key={message.id || index}
                          className={`flex flex-col gap-0.5 ${isAdmin ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[11px] text-gray-400 px-2 font-medium">
                            {isAdmin
                              ? "Soporte SUAREC"
                              : selectedTicket.sender.name}
                          </span>
                          <div
                            className={`max-w-[72%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              isAdmin
                                ? "bg-[#097EEC] text-white rounded-2xl rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-md"
                            }`}
                          >
                            {message.content}
                          </div>
                          <span className="text-[11px] text-gray-400 px-2">
                            {formatDate(message.sent_at)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply input */}
                <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      placeholder="Escribe tu respuesta... (Enter para enviar)"
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-colors resize-none"
                      rows={2}
                      disabled={sendingReply}
                    />
                    <button
                      onClick={handleReply}
                      disabled={!replyMessage.trim() || sendingReply}
                      className="p-3 rounded-xl bg-gradient-to-r from-[#097EEC] to-[#082D50] text-white hover:opacity-90 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex flex-1 items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center text-gray-400">
                  <Image
                    src="/tickets.png"
                    alt="Tickets"
                    width={48}
                    height={48}
                    className="mx-auto mb-3 opacity-20"
                  />
                  <p className="text-sm font-medium">Selecciona un ticket</p>
                  <p className="text-xs mt-1 opacity-70">
                    para ver la conversación
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const AdminTicketsPageWithGuard = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <AdminTicketsPage />
  </RoleGuard>
);

export default AdminTicketsPageWithGuard;
