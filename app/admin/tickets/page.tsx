"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import MessageService from "@/services/MessageService";
import { Message } from "@/interfaces/message.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import RoleGuard from "@/components/role-guard";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  X,
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
      const isAdmin = decoded.roles.some((role) => role.name === "ADMIN");
      if (!isAdmin) {
        router.push("/access-denied");
        return;
      }
    } catch (error) {
      router.push("/auth/login");
      return;
    }

    fetchTickets();
  }, [router]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Obtener tickets de soporte usando el endpoint específico
      const response = await MessageService.getSupportTickets({
        page: 1,
        limit: 100,
      });

      console.log("📋 Tickets recibidos:", response.data.data);
      console.log("📋 Total tickets:", response.data.meta.total);
      console.log("📋 Estado del filtro:", statusFilter);
      setTickets(response.data.data as Ticket[]);
    } catch (error) {
      console.error("Error al cargar tickets:", error);
      toast.error("Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSendingReply(true);

      // Enviar respuesta usando WebSocket
      console.log("🎫 Ticket seleccionado:", selectedTicket);

      const messageData = {
        ticketId: selectedTicket.id,
        content: replyMessage,
      };

      console.log("📤 Enviando datos por WebSocket:", messageData);

      // Usar WebSocket para enviar la respuesta
      if (socket) {
        socket.emit("admin_reply", messageData);

        // Escuchar confirmación
        socket.once("admin_reply_sent", (data: any) => {
          console.log("✅ Respuesta de admin enviada:", data);
          toast.success("Respuesta enviada exitosamente");
          setReplyMessage("");
          loadTicketMessages(selectedTicket.id);
        });

        socket.once("error", (error: any) => {
          console.error("❌ Error al enviar respuesta:", error);
          toast.error("Error al enviar la respuesta");
        });
      } else {
        // Fallback al método HTTP si no hay WebSocket
        const response = await MessageService.sendAdminReply(messageData);
        toast.success("Respuesta enviada exitosamente");
        setReplyMessage("");
        await loadTicketMessages(selectedTicket.id);
      }

      console.log("📤 Respuesta enviada a usuario:", selectedTicket.senderId);
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      toast.error("Error al enviar la respuesta");
    } finally {
      setSendingReply(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const response = await MessageService.getTicketMessages(ticketId);

      console.log(
        "📋 Mensajes recibidos del backend:",
        response.data.map((m) => `${m.id}: ${m.content} (${m.sent_at})`),
      );

      // Verificar el orden de los mensajes
      const sortedByDate = response.data.sort(
        (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
      );
      console.log(
        "📋 Mensajes ordenados por fecha:",
        sortedByDate.map((m) => `${m.id}: ${m.content} (${m.sent_at})`),
      );

      // Usar los mensajes ordenados por fecha
      setTicketMessages(sortedByDate);
    } catch (error) {
      console.error("Error al cargar mensajes del ticket:", error);
      toast.error("Error al cargar los mensajes del ticket");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleTicketSelect = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    await loadTicketMessages(ticket.id);
  };

  const getStatusText = (ticket: Ticket) => {
    if (ticket.status === "resolved") return "Resuelto";
    if (ticket.status === "closed") return "Cerrado";
    return "Pendiente";
  };

  const getStatusColor = (ticket: Ticket) => {
    if (ticket.status === "resolved") return "text-green-600";
    if (ticket.status === "closed") return "text-gray-600";
    return "text-amber-600";
  };

  const getStatusIcon = (ticket: Ticket) => {
    if (ticket.status === "resolved")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (ticket.status === "closed")
      return <X className="h-4 w-4 text-gray-600" />;
    return <Clock className="h-4 w-4 text-amber-600" />;
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await MessageService.updateTicketStatus(ticketId, newStatus);
      toast.success(
        `Ticket marcado como ${newStatus === "resolved" ? "resuelto" : "cerrado"}`,
      );
      fetchTickets(); // Recargar tickets
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      toast.error("Error al actualizar el estado del ticket");
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.sender.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && ticket.status === "open") ||
      (statusFilter === "responded" && ticket.status === "resolved") ||
      (statusFilter === "closed" && ticket.status === "closed");

    console.log("🎫 Filtrando ticket:", {
      id: ticket.id,
      status: ticket.status,
      statusFilter,
      matchesStatus,
    });

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-6 sm:py-8 mt-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Tickets de Soporte
                </h1>
                <p className="mt-2 text-blue-100">
                  Gestiona las consultas y solicitudes de soporte de los
                  usuarios
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 rounded-lg px-3 sm:px-4 py-2">
                  <span className="text-sm">Total: {tickets.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Filters */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar tickets..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none min-w-0"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="responded">Resueltos</option>
                  <option value="closed">Cerrados</option>
                </select>
              </div>
            </div>

            {/* Tickets List */}
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#097EEC] mx-auto"></div>
                  <p className="text-gray-500 mt-2">Cargando tickets...</p>
                </div>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 sm:p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleTicketSelect(ticket)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {getStatusIcon(ticket)}
                          <span
                            className={`text-sm font-medium ${getStatusColor(ticket)}`}
                          >
                            {getStatusText(ticket)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Ticket #{ticket.id}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1 break-words">
                          {ticket.content.substring(0, 100)}
                          {ticket.content.length > 100 && "..."}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {ticket.sender.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {ticket.sender.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{formatDate(ticket.sent_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción - Responsive */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4 min-w-0 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketSelect(ticket);
                          }}
                          className="px-2 sm:px-3 py-1 text-xs font-medium text-[#097EEC] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                        >
                          Responder
                        </button>

                        {ticket.status !== "resolved" &&
                          ticket.status !== "closed" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(ticket.id, "resolved");
                                }}
                                className="px-2 sm:px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap"
                              >
                                Resolver
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(ticket.id, "closed");
                                }}
                                className="px-2 sm:px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                              >
                                Cerrar
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== "all"
                      ? "No se encontraron tickets con los filtros aplicados"
                      : "No hay tickets de soporte"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reply Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Responder Ticket #{selectedTicket.id}
                    </h3>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Usuario: {selectedTicket.sender.name} (
                    {selectedTicket.sender.email})
                  </p>
                </div>

                {/* Content - Flex container */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Historial de mensajes */}
                  <div className="flex-1 p-6 overflow-hidden">
                    <h4 className="font-medium text-gray-900 mb-4">
                      Historial de mensajes:
                    </h4>
                    <div className="h-full overflow-y-auto space-y-4 pr-2 pb-4">
                      {loadingMessages ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#097EEC] mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">
                            Cargando mensajes...
                          </p>
                        </div>
                      ) : ticketMessages.length > 0 ? (
                        ticketMessages.map((message, index) => (
                          <div
                            key={message.id || index}
                            className={`p-3 rounded-lg ${
                              message.sender?.id === 0
                                ? "bg-blue-50 border border-blue-200 ml-8"
                                : "bg-gray-50 border border-gray-200 mr-8"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                {message.sender?.id === 0
                                  ? "Suarec"
                                  : selectedTicket.sender.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(message.sent_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            No hay mensajes en este ticket
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Área de respuesta - Compact */}
                  <div className="p-4 border-t border-gray-200 flex-shrink-0">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tu respuesta:
                      </label>
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                        rows={3}
                        disabled={sendingReply}
                      />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedTicket(null)}
                        disabled={sendingReply}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleReply}
                        disabled={!replyMessage.trim() || sendingReply}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] border border-transparent rounded-lg hover:bg-[#0A6BC7] focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingReply ? "Enviando..." : "Enviar Respuesta"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const AdminTicketsPageWithGuard = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <AdminTicketsPage />
    </RoleGuard>
  );
};

export default AdminTicketsPageWithGuard;
