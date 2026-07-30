"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import MessageService from "@/services/MessageService";
import {
  Message,
  SupportTicket,
  TicketStatus,
} from "@/interfaces/message.interface";
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
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

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

const isTicketOpen = (ticket: SupportTicket | null) =>
  Boolean(ticket && (!ticket.status || ticket.status === "open"));

const getTicketSubject = (ticket: SupportTicket) => {
  const subject = ticket.metadata?.subject;
  if (typeof subject === "string" && subject.trim()) return subject.trim();

  const firstLine = ticket.content.split(/\r?\n/).find((line) => line.trim());
  const legacySubject = firstLine?.match(/^asunto:\s*(.+)$/i)?.[1]?.trim();
  return legacySubject || ticket.content;
};

const sortTickets = (tickets: SupportTicket[]) =>
  [...tickets].sort(
    (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime(),
  );

const mergeTicket = (
  current: SupportTicket,
  incoming: SupportTicket,
): SupportTicket => ({
  ...current,
  ...incoming,
  sender: { ...current.sender, ...incoming.sender },
  recipient: { ...current.recipient, ...incoming.recipient },
});

const upsertTicket = (tickets: SupportTicket[], incoming: SupportTicket) => {
  const existing = tickets.find((ticket) => ticket.id === incoming.id);
  const nextTicket = existing ? mergeTicket(existing, incoming) : incoming;
  return sortTickets([
    nextTicket,
    ...tickets.filter((ticket) => ticket.id !== incoming.id),
  ]);
};

const appendMessage = (messages: Message[], incoming: Message) => {
  if (incoming.id && messages.some((message) => message.id === incoming.id)) {
    return messages;
  }

  return [...messages, incoming].sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSupportTicket = (value: unknown): value is SupportTicket =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.content === "string" &&
  isRecord(value.sender);

const isMessage = (value: unknown): value is Message =>
  isRecord(value) &&
  typeof value.content === "string" &&
  ("sent_at" in value || "id" in value);

const getTicketFromEvent = (payload: unknown): SupportTicket | null => {
  if (isSupportTicket(payload)) return payload;
  if (isRecord(payload) && isSupportTicket(payload.ticket)) {
    return payload.ticket;
  }
  return null;
};

const getMessageEvent = (
  payload: unknown,
): { message: Message; ticketId?: string; ticket?: SupportTicket } | null => {
  if (isMessage(payload)) {
    return {
      message: payload,
      ticketId:
        payload.ticket_id ||
        (payload.type === "support_ticket" ? payload.id : undefined),
    };
  }

  if (!isRecord(payload) || !isMessage(payload.message)) return null;

  return {
    message: payload.message,
    ticketId:
      (typeof payload.ticketId === "string" ? payload.ticketId : undefined) ||
      payload.message.ticket_id ||
      (payload.message.type === "support_ticket"
        ? payload.message.id
        : undefined),
    ticket: isSupportTicket(payload.ticket) ? payload.ticket : undefined,
  };
};

const getStatusEvent = (
  payload: unknown,
): {
  ticketId: string;
  status: TicketStatus;
  ticket?: SupportTicket;
} | null => {
  const isTicketStatus = (value: unknown): value is TicketStatus =>
    value === "open" || value === "resolved" || value === "closed";

  if (isSupportTicket(payload) && isTicketStatus(payload.status)) {
    return { ticketId: payload.id, status: payload.status, ticket: payload };
  }

  if (
    !isRecord(payload) ||
    typeof payload.ticketId !== "string" ||
    !isTicketStatus(payload.status)
  ) {
    return null;
  }

  return {
    ticketId: payload.ticketId,
    status: payload.status,
    ticket: isSupportTicket(payload.ticket) ? payload.ticket : undefined,
  };
};

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (!isRecord(error) || !isRecord(error.response)) return fallback;
  const data = error.response.data;
  if (!isRecord(data)) return fallback;
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.message)) return data.message.join(". ");
  return fallback;
};

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
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ticketPage, setTicketPage] = useState(1);
  const [hasMoreTickets, setHasMoreTickets] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null,
  );
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const selectedTicketIdRef = useRef<string | null>(null);
  const router = useRouter();
  const { socket } = useWebSocketContext();

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

  useEffect(() => {
    if (!socket) return;

    const handleTicketCreated = (payload: unknown) => {
      const ticket = getTicketFromEvent(payload);
      if (!ticket) return;

      setTickets((current) => upsertTicket(current, ticket));
      if (selectedTicketIdRef.current === ticket.id) {
        setSelectedTicket((current) => {
          const next = current ? mergeTicket(current, ticket) : ticket;
          selectedTicketIdRef.current = next.id;
          return next;
        });
      }
    };

    const handleSupportMessage = (payload: unknown) => {
      const event = getMessageEvent(payload);
      if (!event) return;

      const ticketFromPayload = event.ticket;
      const createdTicket =
        event.message.type === "support_ticket" &&
        isSupportTicket(event.message)
          ? event.message
          : null;

      if (ticketFromPayload) {
        setTickets((current) => upsertTicket(current, ticketFromPayload));
      } else if (createdTicket) {
        setTickets((current) => upsertTicket(current, createdTicket));
      } else if (event.ticketId) {
        // Mantener el ticket con actividad reciente visible al inicio.
        setTickets((current) => {
          const ticket = current.find((item) => item.id === event.ticketId);
          if (!ticket) return current;
          return [
            ticket,
            ...current.filter((item) => item.id !== event.ticketId),
          ];
        });
      }

      if (event.ticketId && selectedTicketIdRef.current === event.ticketId) {
        setTicketMessages((current) => appendMessage(current, event.message));
      }
    };

    const handleStatusChanged = (payload: unknown) => {
      const event = getStatusEvent(payload);
      if (!event) return;

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === event.ticketId
            ? {
                ...(event.ticket ? mergeTicket(ticket, event.ticket) : ticket),
                status: event.status,
              }
            : ticket,
        ),
      );

      if (selectedTicketIdRef.current === event.ticketId) {
        setSelectedTicket((current) => {
          if (!current) return current;
          const next = {
            ...(event.ticket ? mergeTicket(current, event.ticket) : current),
            status: event.status,
          };
          selectedTicketIdRef.current = next.id;
          return next;
        });
      }
    };

    socket.on("support:ticket_created", handleTicketCreated);
    socket.on("support:message_created", handleSupportMessage);
    socket.on("support:status_changed", handleStatusChanged);

    return () => {
      socket.off("support:ticket_created", handleTicketCreated);
      socket.off("support:message_created", handleSupportMessage);
      socket.off("support:status_changed", handleStatusChanged);
    };
  }, [socket]);

  const fetchTickets = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await MessageService.getSupportTickets({
        page,
        limit: 100,
      });
      setTickets((current) => {
        // Preservar tickets recibidos por WebSocket mientras la carga HTTP
        // inicial estaba en vuelo; `upsertTicket` deduplica por ID.
        let merged = current;
        response.data.data.forEach((ticket) => {
          merged = upsertTicket(merged, ticket);
        });
        return sortTickets(merged);
      });
      setTicketPage(response.data.meta.page);
      setHasMoreTickets(response.data.meta.hasNextPage);
    } catch {
      toast.error("Error al cargar los tickets");
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      const response = await MessageService.getTicketMessages(ticketId);
      const sorted = response.data.sort(
        (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime(),
      );
      if (selectedTicketIdRef.current === ticketId) {
        // Conservar eventos WebSocket que pudieron llegar mientras el HTTP
        // estaba en vuelo, deduplicando siempre por ID.
        setTicketMessages((current) =>
          current.reduce(
            (merged, message) => appendMessage(merged, message),
            sorted,
          ),
        );
      }
    } catch {
      if (selectedTicketIdRef.current === ticketId) {
        toast.error("Error al cargar los mensajes del ticket");
      }
    } finally {
      if (selectedTicketIdRef.current === ticketId) {
        setLoadingMessages(false);
      }
    }
  };

  const handleTicketSelect = async (ticket: SupportTicket) => {
    selectedTicketIdRef.current = ticket.id;
    setSelectedTicket(ticket);
    setTicketMessages([]);
    setReplyMessage("");
    await loadTicketMessages(ticket.id);
  };

  const handleCloseTicket = () => {
    selectedTicketIdRef.current = null;
    setSelectedTicket(null);
    setTicketMessages([]);
    setReplyMessage("");
  };

  const handleReply = async () => {
    if (
      !selectedTicket ||
      !isTicketOpen(selectedTicket) ||
      !replyMessage.trim() ||
      sendingReply
    ) {
      return;
    }

    const ticketId = selectedTicket.id;
    const content = replyMessage.trim();

    try {
      setSendingReply(true);
      const response = await MessageService.sendAdminReply({
        ticketId,
        content,
      });

      if (selectedTicketIdRef.current === ticketId) {
        setTicketMessages((current) => appendMessage(current, response.data));
        setReplyMessage((current) =>
          current.trim() === content ? "" : current,
        );
      }

      toast.success("Respuesta enviada");
    } catch (error) {
      toast.error(
        getRequestErrorMessage(error, "Error al enviar la respuesta"),
      );
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (
    ticketId: string,
    newStatus: TicketStatus,
  ) => {
    if (updatingStatusId) return;

    try {
      setUpdatingStatusId(ticketId);
      const response = await MessageService.updateTicketStatus(
        ticketId,
        newStatus,
      );
      const updatedTicket = response.data;

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...mergeTicket(ticket, updatedTicket),
                status: newStatus,
              }
            : ticket,
        ),
      );

      if (selectedTicketIdRef.current === ticketId) {
        setSelectedTicket((current) => {
          if (!current) return current;
          const next = {
            ...mergeTicket(current, updatedTicket),
            status: newStatus,
          };
          selectedTicketIdRef.current = next.id;
          return next;
        });
      }

      const statusLabels: Record<TicketStatus, string> = {
        open: "reabierto",
        resolved: "resuelto",
        closed: "cerrado",
      };
      toast.success(`Ticket ${statusLabels[newStatus]}`);
    } catch (error) {
      toast.error(
        getRequestErrorMessage(
          error,
          "Error al actualizar el estado del ticket",
        ),
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch =
      getTicketSubject(ticket).toLowerCase().includes(normalizedSearch) ||
      ticket.content.toLowerCase().includes(normalizedSearch) ||
      ticket.sender.name.toLowerCase().includes(normalizedSearch) ||
      (ticket.sender.email || "").toLowerCase().includes(normalizedSearch);

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
                    {hasMoreTickets && (
                      <button
                        onClick={() => fetchTickets(ticketPage + 1, true)}
                        disabled={loadingMore}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loadingMore
                          ? "Buscando..."
                          : "Buscar también en tickets anteriores"}
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {filteredTickets.map((ticket) => {
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
                            {getTicketSubject(ticket)}
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
                    })}
                    {hasMoreTickets && (
                      <div className="p-3">
                        <button
                          onClick={() => fetchTickets(ticketPage + 1, true)}
                          disabled={loadingMore}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loadingMore ? "Cargando..." : "Cargar más tickets"}
                        </button>
                      </div>
                    )}
                  </>
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
                      onClick={handleCloseTicket}
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
                        {selectedTicket.sender.email || "Correo no disponible"}
                      </p>
                      <p
                        className="text-xs text-gray-600 font-medium truncate mt-0.5"
                        title={getTicketSubject(selectedTicket)}
                      >
                        {getTicketSubject(selectedTicket)}
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
                            disabled={updatingStatusId === selectedTicket.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Resolver
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(selectedTicket.id, "closed")
                            }
                            disabled={updatingStatusId === selectedTicket.id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cerrar
                          </button>
                        </>
                      )}

                    {(selectedTicket.status === "resolved" ||
                      selectedTicket.status === "closed") && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(selectedTicket.id, "open")
                        }
                        disabled={updatingStatusId === selectedTicket.id}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-[#097EEC] border border-blue-200 hover:bg-blue-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingStatusId === selectedTicket.id ? (
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#097EEC] border-t-transparent" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Reabrir
                      </button>
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
                  {!isTicketOpen(selectedTicket) && (
                    <p className="mb-2 text-xs text-gray-500">
                      Este ticket es de solo lectura. Reábrelo para responder.
                    </p>
                  )}
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
                      placeholder={
                        isTicketOpen(selectedTicket)
                          ? "Escribe tu respuesta... (Enter para enviar)"
                          : "Reabre el ticket para responder"
                      }
                      className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-colors resize-none"
                      rows={2}
                      maxLength={2000}
                      disabled={sendingReply || !isTicketOpen(selectedTicket)}
                    />
                    <button
                      onClick={handleReply}
                      disabled={
                        !replyMessage.trim() ||
                        sendingReply ||
                        !isTicketOpen(selectedTicket)
                      }
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
