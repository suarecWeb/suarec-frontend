"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import {
  PaymentService,
  PaymentStatus,
  PaymentMethod,
  AdminPaymentFilterDto,
  UpdatePaymentStatusDto,
} from "@/services/PaymentService";
import { PaymentTransaction } from "@/interfaces/payment.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Pagination } from "@/components/ui/pagination";
import {
  CreditCard,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  UserCheck,
  UserX,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import toast from "react-hot-toast";

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState<AdminPaymentFilterDto>({
    page: 1,
    limit: 10,
  });

  // Estados temporales para los montos (con delay)
  const [tempMinAmount, setTempMinAmount] = useState<string>("");
  const [tempMaxAmount, setTempMaxAmount] = useState<string>("");

  // Estados de paginación
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const router = useRouter();

  const fetchPayments = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(page === 1);
        setRefreshing(page !== 1);

        const params = {
          ...filters,
          page,
        };

        console.log("Enviando parámetros:", params); // Debug

        const response: PaginationResponse<PaymentTransaction> =
          await PaymentService.getAllPaymentsForAdmin(params);

        setPayments(response.data);
        setPagination(response.meta);
        setError(null);
      } catch (err) {
        toast.error("Error al cargar los pagos");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (!loading) {
      fetchPayments();
    }
  }, [filters, fetchPayments, loading]);

  // Effect para delay en filtros de monto
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      const minAmount = tempMinAmount ? Number(tempMinAmount) : undefined;
      const maxAmount = tempMaxAmount ? Number(tempMaxAmount) : undefined;

      if (filters.minAmount !== minAmount || filters.maxAmount !== maxAmount) {
        setFilters((prev) => ({
          ...prev,
          minAmount,
          maxAmount,
          page: 1,
        }));
      }
    }, 1000);

    return () => clearTimeout(delayTimer);
  }, [tempMinAmount, tempMaxAmount, filters.minAmount, filters.maxAmount]);

  const handleFilterChange = (newFilters: Partial<AdminPaymentFilterDto>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    fetchPayments(page);
  };

  const handleUpdatePaymentStatus = async (
    paymentId: string,
    newStatus: PaymentStatus,
  ) => {
    try {
      await PaymentService.updatePaymentStatus(paymentId, {
        status: newStatus,
      });

      // Actualizar el pago en la lista local
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId
            ? { ...payment, status: newStatus }
            : payment,
        ),
      );
    } catch (error) {
      toast.error("Error al actualizar el estado del pago");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case PaymentStatus.PENDING:
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case PaymentStatus.FINISHED:
      case "FINISHED":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case PaymentStatus.FAILED:
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
      case "COMPLETED":
        return "Completado";
      case PaymentStatus.PENDING:
      case "PENDING":
        return "Pendiente";
      case PaymentStatus.FINISHED:
      case "FINISHED":
        return "Finalizado";
      case PaymentStatus.FAILED:
      case "FAILED":
        return "Fallido";
      default:
        return status; // Mostrar el valor original en lugar de "Desconocido"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case PaymentStatus.PENDING:
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case PaymentStatus.FINISHED:
      case "FINISHED":
        return "bg-blue-100 text-blue-800";
      case PaymentStatus.FAILED:
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: Date | string) => {
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading && pagination.page === 1) {
    return (
      <RoleGuard allowedRoles={["ADMIN"]}>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Gestión de Pagos
                  </h1>
                  <p className="mt-1 md:mt-2 text-sm md:text-base text-blue-100">
                    Panel de administración de todas las transacciones
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchPayments(pagination.page)}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors w-full sm:w-auto"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4 md:-mt-6">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            {/* Filtros */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                    >
                      <Filter className="h-4 w-4" />
                      Filtros Avanzados
                    </button>

                    {/* Filtros rápidos de estado */}
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                      <button
                        onClick={() =>
                          handleFilterChange({ status: undefined })
                        }
                        className={`px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap ${
                          !filters.status
                            ? "bg-[#097EEC] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Todos
                      </button>
                      {Object.values(PaymentStatus).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleFilterChange({ status })}
                          className={`px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap ${
                            filters.status === status
                              ? "bg-[#097EEC] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {getStatusText(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 text-center sm:text-right">
                    {pagination.total} transacciones encontradas
                  </div>
                </div>
              </div>

              {/* Panel de filtros expandido */}
              {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Usuario Pagador
                    </label>
                    <input
                      type="number"
                      value={filters.payerId || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          payerId: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                      placeholder="ID del pagador"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID Usuario Receptor
                    </label>
                    <input
                      type="number"
                      value={filters.payeeId || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          payeeId: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                      placeholder="ID del receptor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha desde
                    </label>
                    <input
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) =>
                        handleFilterChange({ startDate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha hasta
                    </label>
                    <input
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) =>
                        handleFilterChange({ endDate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto mínimo
                    </label>
                    <input
                      type="number"
                      value={tempMinAmount}
                      onChange={(e) => setTempMinAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                      placeholder="Monto mínimo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto máximo
                    </label>
                    <input
                      type="number"
                      value={tempMaxAmount}
                      onChange={(e) => setTempMaxAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                      placeholder="Monto máximo"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                    <button
                      onClick={() => {
                        setFilters({
                          page: 1,
                          limit: 10,
                        });
                        setTempMinAmount("");
                        setTempMaxAmount("");
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de transacciones */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {payments.length === 0 ? (
              <div className="text-center py-16">
                <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No hay transacciones
                </h3>
                <p className="text-gray-500">
                  {Object.keys(filters).length > 2
                    ? "No se encontraron transacciones con los filtros aplicados."
                    : "Aún no hay transacciones registradas en el sistema."}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Layout para móvil y desktop */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Información de usuarios */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Icono de transacción */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>

                          {/* Información principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-1">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                {payment.payer.name} → {payment.payee.name}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  payment.status,
                                )} sm:ml-2`}
                              >
                                {getStatusIcon(payment.status)}
                                <span className="ml-1">
                                  {getStatusText(payment.status)}
                                </span>
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                Pagador: ID {payment.payer.id}
                              </span>
                              <span className="flex items-center gap-1">
                                <UserX className="h-3 w-3" />
                                Receptor: ID {payment.payee.id}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 truncate mb-1">
                              {payment.description || "Sin descripción"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {formatDate(payment.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* Monto y acciones */}
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-4 sm:gap-2">
                          {/* Monto */}
                          <div className="text-left sm:text-right">
                            <p className="text-lg sm:text-xl font-semibold text-gray-900">
                              {formatCurrency(payment.amount, {
                                showSymbol: true,
                                showCurrency: true,
                              })}
                            </p>
                          </div>

                          {/* Checkbox para marcar como FINISHED (solo si es COMPLETED) */}
                          {payment.status === PaymentStatus.COMPLETED && (
                            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                              <input
                                type="checkbox"
                                id={`finished-${payment.id}`}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleUpdatePaymentStatus(
                                      payment.id,
                                      PaymentStatus.FINISHED,
                                    );
                                  }
                                }}
                                className="h-4 w-4 text-[#097EEC] focus:ring-[#097EEC] border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`finished-${payment.id}`}
                                className="text-sm font-medium text-green-700 cursor-pointer"
                              >
                                Marcar como pagado por SUAREC
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPaymentsPage;
