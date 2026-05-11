"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import {
  PaymentService,
  PaymentStatus,
  AdminPaymentFilterDto,
} from "@/services/PaymentService";
import { PaymentTransaction } from "@/interfaces/payment.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Pagination } from "@/components/ui/pagination";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  User,
  ArrowRight,
  Calendar,
  DollarSign,
  TrendingDown,
  Briefcase,
  MapPin,
  Tag,
  Link as LinkIcon,
  Mail,
  Hash,
  Filter,
  Inbox,
  Gavel,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import toast from "react-hot-toast";

// ─── Status config ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; className: string }
> = {
  COMPLETED: {
    label: "Completado",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  PENDING: {
    label: "Pendiente",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  FINISHED: {
    label: "Finalizado",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  FAILED: {
    label: "Fallido",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status,
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  negotiating: "Negociando",
  accepted: "Aceptado",
  in_progress: "En curso",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  completed: "Completado",
};

const formatDate = (d: Date | string | undefined | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (d: Date | string) => {
  const date = new Date(d);
  const diffH = (Date.now() - date.getTime()) / 3_600_000;
  if (diffH < 24)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diffH < 48) return "Ayer";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
    {icon}
    {title}
  </h3>
);

const UserCard = ({
  user,
  role,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    profile_image?: string;
    profession?: string;
  };
  role: string;
}) => (
  <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 space-y-1 min-w-0">
    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
      <User className="h-3 w-3" />
      {role}
    </div>
    <div className="flex items-center gap-2">
      {user.profile_image ? (
        <img
          src={user.profile_image}
          alt={user.name}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-[#097EEC]/10 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-[#097EEC]" />
        </div>
      )}
      <p className="font-semibold text-gray-900 text-sm truncate">
        {user.name}
      </p>
    </div>
    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
      <Mail className="h-3 w-3 flex-shrink-0" />
      {user.email}
    </p>
    {user.profession && (
      <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
        <Briefcase className="h-3 w-3 flex-shrink-0" />
        {user.profession}
      </p>
    )}
    <p className="text-xs text-gray-400 flex items-center gap-1">
      <Hash className="h-3 w-3 flex-shrink-0" />
      ID {user.id}
    </p>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBids, setShowBids] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);

  const [filters, setFilters] = useState<AdminPaymentFilterDto>({
    page: 1,
    limit: 10,
  });
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const router = useRouter();

  const fetchPayments = useCallback(async () => {
    try {
      setRefreshing(true);
      const response: PaginationResponse<PaymentTransaction> =
        await PaymentService.getAllPaymentsForAdmin(filters);
      setPayments(response.data);
      setPagination(response.meta);
    } catch {
      toast.error("Error al cargar los pagos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounce amount inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const minAmount = tempMin ? Number(tempMin) : undefined;
      const maxAmount = tempMax ? Number(tempMax) : undefined;
      if (filters.minAmount !== minAmount || filters.maxAmount !== maxAmount) {
        setFilters((prev) => ({ ...prev, minAmount, maxAmount, page: 1 }));
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [tempMin, tempMax]);

  const handleFilter = (patch: Partial<AdminPaymentFilterDto>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleMarkFinished = async (paymentId: string) => {
    try {
      await PaymentService.updatePaymentStatus(paymentId, {
        status: PaymentStatus.FINISHED,
      });
      const update = (p: PaymentTransaction) =>
        p.id === paymentId ? { ...p, status: PaymentStatus.FINISHED } : p;
      setPayments((prev) => prev.map(update));
      setSelectedPayment((prev) => (prev ? update(prev) : prev));
      toast.success("Marcado como pagado por SUAREC");
    } catch {
      toast.error("Error al actualizar el estado");
    }
  };

  // Client-side search on current page
  const visible = payments.filter((p) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      p.payer.name.toLowerCase().includes(t) ||
      p.payee.name.toLowerCase().includes(t) ||
      p.payer.email.toLowerCase().includes(t) ||
      p.payee.email.toLowerCase().includes(t) ||
      (p.description ?? "").toLowerCase().includes(t) ||
      (p.reference ?? "").toLowerCase().includes(t)
    );
  });

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const next = Math.max(
        220,
        Math.min(520, startWidth + ev.clientX - startX),
      );
      setSidebarWidth(next);
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent" />
        </div>
      </RoleGuard>
    );
  }

  const contract = selectedPayment?.contract;
  const bids = contract?.bids ?? [];

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
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
                    src="/transaccion.png"
                    alt="Transacciones"
                    width={22}
                    height={22}
                    className="opacity-80"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 leading-none">
                    Gestión de Pagos
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pagination.total} transacciones en total
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchPayments}
              disabled={refreshing}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40"
              title="Actualizar"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── Split layout ───────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex h-[calc(100vh-11rem)]">
            {/* Left panel — payment list */}
            <div
              className={`flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0 ${
                selectedPayment ? "hidden lg:flex" : "flex-1"
              }`}
              style={selectedPayment ? { width: sidebarWidth } : undefined}
            >
              {/* Search + filters */}
              <div className="p-3 border-b border-gray-100 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, ref..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-colors"
                  />
                </div>

                {/* Status chips */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleFilter({ status: undefined })}
                    className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      !filters.status
                        ? "bg-[#097EEC] text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    Todos
                  </button>
                  {Object.values(PaymentStatus).map((status) => {
                    const sc = getStatusConfig(status);
                    return (
                      <button
                        key={status}
                        onClick={() => handleFilter({ status })}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          filters.status === status
                            ? "bg-[#097EEC] text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {sc.label}
                      </button>
                    );
                  })}
                </div>

                {/* Advanced toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors w-full justify-center py-0.5"
                >
                  <Filter className="h-3 w-3" />
                  {showAdvanced ? "Ocultar filtros" : "Filtros avanzados"}
                  {showAdvanced ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>

                {showAdvanced && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={filters.startDate || ""}
                          onChange={(e) =>
                            handleFilter({
                              startDate: e.target.value || undefined,
                            })
                          }
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={filters.endDate || ""}
                          onChange={(e) =>
                            handleFilter({
                              endDate: e.target.value || undefined,
                            })
                          }
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Monto mín.
                        </label>
                        <input
                          type="number"
                          value={tempMin}
                          onChange={(e) => setTempMin(e.target.value)}
                          placeholder="0"
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                          Monto máx.
                        </label>
                        <input
                          type="number"
                          value={tempMax}
                          onChange={(e) => setTempMax(e.target.value)}
                          placeholder="∞"
                          className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFilters({ page: 1, limit: 10 });
                        setTempMin("");
                        setTempMax("");
                        setSearchTerm("");
                      }}
                      className="w-full text-xs py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {refreshing && payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#097EEC] border-t-transparent" />
                    <p className="text-sm">Cargando pagos...</p>
                  </div>
                ) : visible.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 px-6">
                    <Inbox className="h-10 w-10 opacity-40" />
                    <p className="text-sm text-center">
                      {searchTerm || filters.status
                        ? "No hay pagos con ese filtro"
                        : "No hay transacciones registradas"}
                    </p>
                  </div>
                ) : (
                  visible.map((payment) => {
                    const sc = getStatusConfig(payment.status);
                    const isSelected = selectedPayment?.id === payment.id;
                    return (
                      <button
                        key={payment.id}
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowBids(false);
                        }}
                        className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-gray-50 ${
                          isSelected
                            ? "bg-[#097EEC]/5 border-l-2 border-[#097EEC]"
                            : "border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {payment.payer.name}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatShortDate(payment.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <ArrowRight className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{payment.payee.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.className}`}
                          >
                            {sc.icon}
                            {sc.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {formatCurrency(payment.amount, {
                              showSymbol: true,
                              showCurrency: true,
                            })}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-3 border-t border-gray-100 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            {/* Resize handle — only visible when detail panel is open */}
            {selectedPayment && (
              <div
                onMouseDown={handleResizeStart}
                className="hidden lg:flex w-2 mx-1 cursor-col-resize items-center justify-center group flex-shrink-0"
              >
                <div className="w-0.5 h-12 rounded-full bg-gray-200 group-hover:bg-[#097EEC]/50 transition-colors" />
              </div>
            )}

            {/* Right panel — detail */}
            {selectedPayment ? (
              <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-w-0 ml-2 lg:ml-0">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setSelectedPayment(null)}
                      className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#097EEC] to-[#082D50] flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/transaccion.png"
                        alt="Pago"
                        width={18}
                        height={18}
                        className="brightness-0 invert"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedPayment.payer.name} →{" "}
                        {selectedPayment.payee.name}
                      </p>
                      <p className="text-xs text-gray-400 font-mono truncate">
                        #{selectedPayment.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(() => {
                      const sc = getStatusConfig(selectedPayment.status);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.className}`}
                        >
                          {sc.icon}
                          {sc.label}
                        </span>
                      );
                    })()}
                    {selectedPayment.status === PaymentStatus.COMPLETED && (
                      <button
                        onClick={() => handleMarkFinished(selectedPayment.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors font-medium"
                      >
                        SUAREC pagó
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-[#f5f7fb]">
                  {/* Amount */}
                  <div className="bg-white rounded-xl p-4 text-center space-y-2 shadow-sm border border-gray-100">
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(selectedPayment.amount, {
                        showSymbol: true,
                        showCurrency: true,
                      })}
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {selectedPayment.payment_method && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <Tag className="h-3 w-3" />
                          {selectedPayment.payment_method}
                        </span>
                      )}
                    </div>
                    {selectedPayment.reference && (
                      <p className="text-xs text-gray-400 font-mono">
                        Ref: {selectedPayment.reference}
                      </p>
                    )}
                  </div>

                  {/* Publication */}
                  {contract?.publication?.title && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <SectionTitle
                        icon={<Briefcase className="h-3.5 w-3.5" />}
                        title="Servicio contratado"
                      />
                      <p className="font-semibold text-gray-900 text-sm">
                        {contract.publication.title}
                      </p>
                      {contract.publication.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {contract.publication.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payer → Payee */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <SectionTitle
                      icon={<User className="h-3.5 w-3.5" />}
                      title="Partes involucradas"
                    />
                    <div className="flex items-center gap-3">
                      <UserCard user={selectedPayment.payer} role="Pagador" />
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <UserCard user={selectedPayment.payee} role="Receptor" />
                    </div>
                  </div>

                  {/* Price breakdown */}
                  {contract && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <SectionTitle
                        icon={<DollarSign className="h-3.5 w-3.5" />}
                        title="Desglose económico"
                      />
                      <div className="space-y-2">
                        {contract.initialPrice != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Precio inicial
                            </span>
                            <span className="font-medium text-gray-800">
                              {formatCurrency(contract.initialPrice, {
                                showSymbol: true,
                                showCurrency: true,
                              })}
                            </span>
                          </div>
                        )}
                        {contract.currentPrice != null &&
                          contract.currentPrice !== contract.initialPrice && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">
                                Precio negociado
                              </span>
                              <span className="font-semibold text-[#097EEC]">
                                {formatCurrency(contract.currentPrice, {
                                  showSymbol: true,
                                  showCurrency: true,
                                })}
                              </span>
                            </div>
                          )}
                        {contract.suarecCommission != null && (
                          <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                            <span className="text-gray-500 flex items-center gap-1">
                              <TrendingDown className="h-3 w-3" />
                              Comisión SUAREC (12%)
                            </span>
                            <span className="font-medium text-orange-600">
                              {formatCurrency(contract.suarecCommission, {
                                showSymbol: true,
                                showCurrency: true,
                              })}
                            </span>
                          </div>
                        )}
                        {contract.priceWithoutCommission != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Sin comisión SUAREC
                            </span>
                            <span className="font-medium text-gray-800">
                              {formatCurrency(contract.priceWithoutCommission, {
                                showSymbol: true,
                                showCurrency: true,
                              })}
                            </span>
                          </div>
                        )}
                        {contract.priceUnit && (
                          <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                            <span className="text-gray-500">
                              Unidad de precio
                            </span>
                            <span className="font-medium text-gray-700 capitalize">
                              {contract.priceUnit}
                            </span>
                          </div>
                        )}
                        {contract.quantity != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cantidad</span>
                            <span className="font-medium text-gray-700">
                              {contract.quantity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contract info */}
                  {contract && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <SectionTitle
                        icon={<Calendar className="h-3.5 w-3.5" />}
                        title="Contrato"
                      />
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-gray-500">Estado</span>
                          <span className="font-medium text-gray-800">
                            {CONTRACT_STATUS_LABELS[contract.status] ??
                              contract.status}
                          </span>
                        </div>
                        {contract.agreedDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Fecha acordada
                            </span>
                            <span className="font-semibold text-green-700">
                              {formatDate(contract.agreedDate)}
                              {contract.agreedTime &&
                                ` · ${contract.agreedTime}`}
                            </span>
                          </div>
                        )}
                        {contract.requestedDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              Fecha solicitada
                            </span>
                            <span className="font-medium text-gray-800">
                              {formatDate(contract.requestedDate)}
                              {contract.requestedTime &&
                                ` · ${contract.requestedTime}`}
                            </span>
                          </div>
                        )}
                        {contract.serviceAddress && (
                          <div className="flex justify-between text-sm gap-4">
                            <span className="text-gray-500 flex items-center gap-1 flex-shrink-0">
                              <MapPin className="h-3 w-3" />
                              Dirección
                            </span>
                            <span className="font-medium text-gray-800 text-right">
                              {contract.serviceAddress}
                              {contract.neighborhood &&
                                `, ${contract.neighborhood}`}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
                          <span className="text-gray-500">Creado</span>
                          <span className="font-medium text-gray-800">
                            {formatDate(contract.createdAt)}
                          </span>
                        </div>
                        {contract.completedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Completado</span>
                            <span className="font-medium text-green-700">
                              {formatDate(contract.completedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contract messages */}
                  {(contract?.clientMessage || contract?.providerMessage) && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                      <SectionTitle
                        icon={<Tag className="h-3.5 w-3.5" />}
                        title="Mensajes del contrato"
                      />
                      {contract.clientMessage && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Cliente
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200 italic">
                            &quot;{contract.clientMessage}&quot;
                          </p>
                        </div>
                      )}
                      {contract.providerMessage && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Proveedor
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200 italic">
                            &quot;{contract.providerMessage}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bids */}
                  {bids.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <button
                        onClick={() => setShowBids(!showBids)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <SectionTitle
                          icon={<Gavel className="h-3.5 w-3.5" />}
                          title={`Ofertas y contraofertas (${bids.length})`}
                        />
                        {showBids ? (
                          <ChevronUp className="h-4 w-4 text-gray-400 mb-3" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400 mb-3" />
                        )}
                      </button>
                      {showBids && (
                        <div className="space-y-2 mt-1">
                          {bids.map((bid, i) => (
                            <div
                              key={bid.id}
                              className={`p-3 rounded-lg border ${
                                bid.isAccepted
                                  ? "border-green-300 bg-green-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">
                                    #{i + 1}
                                  </span>
                                  <span className="text-xs font-medium text-gray-600">
                                    {bid.bidder?.name ?? "—"}
                                  </span>
                                  {bid.isAccepted && (
                                    <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                                      Aceptada
                                    </span>
                                  )}
                                </div>
                                <span className="font-semibold text-gray-900 text-sm">
                                  {formatCurrency(bid.amount, {
                                    showSymbol: true,
                                    showCurrency: true,
                                  })}
                                </span>
                              </div>
                              {bid.message && (
                                <p className="text-xs text-gray-600 italic">
                                  &quot;{bid.message}&quot;
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-2">
                    <SectionTitle
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      title="Cronología del pago"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Creado</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(selectedPayment.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Actualizado</span>
                      <span className="font-medium text-gray-800">
                        {formatDate(selectedPayment.updated_at)}
                      </span>
                    </div>
                    {selectedPayment.paid_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pagado</span>
                        <span className="font-semibold text-green-700">
                          {formatDate(selectedPayment.paid_at)}
                        </span>
                      </div>
                    )}
                    {selectedPayment.failureReason && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">
                          {selectedPayment.failureReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Wompi link */}
                  {selectedPayment.wompi_payment_link && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5" />
                          Link de pago
                        </span>
                        <a
                          href={selectedPayment.wompi_payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#097EEC] font-medium hover:underline text-xs"
                        >
                          Abrir en Wompi
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Empty right state */
              <div className="hidden lg:flex flex-1 items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center text-gray-400">
                  <div className="w-14 h-14 rounded-2xl bg-[#097EEC]/5 flex items-center justify-center mx-auto mb-3">
                    <Image
                      src="/transaccion.png"
                      alt="Transacciones"
                      width={32}
                      height={32}
                      className="opacity-20"
                    />
                  </div>
                  <p className="text-sm font-medium">Selecciona un pago</p>
                  <p className="text-xs mt-1 opacity-70">
                    para ver el detalle completo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPaymentsPage;
