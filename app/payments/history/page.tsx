"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { PaymentService, PaymentHistoryType, PaymentStatus } from "@/services/PaymentService";
import { PaymentTransaction } from "@/interfaces/payment.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Pagination } from "@/components/ui/pagination";
import {
    CreditCard,
    Filter,
    Calendar,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2,
    Download,
    Eye,
    RefreshCw,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { formatCurrency } from "@/lib/formatCurrency";

interface PaymentHistoryFilters {
    type: PaymentHistoryType;
    status?: PaymentStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
}

const PaymentHistoryPage = () => {
    const [payments, setPayments] = useState<PaymentTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Estados de filtros
    const [filters, setFilters] = useState<PaymentHistoryFilters>({
        type: PaymentHistoryType.ALL,
    });

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

    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            try {
                const decoded = jwtDecode<TokenPayload>(token);
                setCurrentUserId(decoded.id.toString());
            } catch (error) {
                console.error("Error al decodificar token:", error);
                router.push("/auth/login");
            }
        } else {
            router.push("/auth/login");
        }
    }, [router]);

    const fetchPayments = async (page: number = 1) => {
        try {
            setLoading(page === 1);
            setRefreshing(page !== 1);

            const params = {
                page,
                limit: pagination.limit,
                ...filters,
            };            const response: PaginationResponse<PaymentTransaction> = await PaymentService.getMyPaymentHistory(params);

            setPayments(response.data);
            setPagination(response.meta);
            setError(null);
        } catch (err) {
            console.error("Error al cargar historial de pagos:", err);
            setError("Error al cargar el historial de pagos");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (currentUserId) {
            fetchPayments();
        }
    }, [currentUserId, filters]);

    const handleFilterChange = (newFilters: Partial<PaymentHistoryFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        fetchPayments(page);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "PENDING":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case "FAILED":
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "Completado";
            case "PENDING":
                return "Pendiente";
            case "FAILED":
                return "Fallido";
            default:
                return "Desconocido";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
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

    const isPaymentSent = (payment: PaymentTransaction) => {
        return payment.payer.id.toString() === currentUserId?.toString();
    };

    if (loading && pagination.page === 1) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 pt-16">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-16">
                {/* Header */}
                <div className="bg-[#097EEC] text-white py-6 md:py-8">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">Historial de Pagos</h1>
                                    <p className="my-1 md:my-2 text-sm md:text-base text-blue-100">
                                        Gestiona y revisa todas tus transacciones
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => fetchPayments(pagination.page)}
                                disabled={refreshing}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors w-full sm:w-auto"
                            >
                                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                <span className="sm:inline">Actualizar</span>
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
                                            Filtros
                                        </button>

                                        {/* Filtros rápidos de tipo */}
                                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                                            {Object.values(PaymentHistoryType).map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => handleFilterChange({ type })}
                                                    className={`px-3 py-1 rounded-full text-sm transition-colors whitespace-nowrap ${filters.type === type
                                                            ? "bg-[#097EEC] text-white"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {type === PaymentHistoryType.ALL && "Todos"}
                                                    {type === PaymentHistoryType.SENT && "Enviados"}
                                                    {type === PaymentHistoryType.RECEIVED && "Recibidos"}
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
                                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha desde
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.startDate || ""}
                                            onChange={(e) => handleFilterChange({ startDate: e.target.value })}
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
                                            onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                                        />
                                    </div>

                                    <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                                        <button
                                            onClick={() =>
                                                setFilters({
                                                    type: PaymentHistoryType.ALL,
                                                })
                                            }
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
                                    {Object.keys(filters).length > 1
                                        ? "No se encontraron transacciones con los filtros aplicados."
                                        : "Aún no tienes transacciones registradas."}
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
                                            {/* Vista móvil */}
                                            <div className="sm:hidden">
                                                {/* Primera fila: Icono y monto */}
                                                <div className="flex items-center justify-between mb-3">
                                                    {/* Icono de dirección */}
                                                    <div className="flex-shrink-0">
                                                        {isPaymentSent(payment) ? (
                                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                                <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Monto */}
                                                    <div className="text-right">
                                                        <p
                                                            className={`text-lg font-semibold ${isPaymentSent(payment) ? "text-red-600" : "text-green-600"}`}
                                                        >
                                                            {isPaymentSent(payment) ? "-" : "+"}
                                                            {formatCurrency(payment.amount, {
                                                                showSymbol: true,
                                                                showCurrency: true,
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Segunda fila: Información completa */}
                                                <div className="space-y-2">
                                                    <div className="flex flex-col gap-2">
                                                        <h3 className="font-medium text-gray-900 text-sm">
                                                            {isPaymentSent(payment)
                                                                ? `Pago a ${payment.payee.name}`
                                                                : `Pago de ${payment.payer.name}`}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(
                                                                payment.status
                                                            )}`}
                                                        >
                                                            {getStatusIcon(payment.status)}
                                                            <span className="ml-1">{getStatusText(payment.status)}</span>
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-600">
                                                        {payment.description || "Sin descripción"}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(payment.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Vista desktop - Layout horizontal original */}
                                            <div className="hidden sm:flex sm:items-center gap-4">
                                                {/* Icono y contenido principal */}
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {/* Icono de dirección */}
                                                    <div className="flex-shrink-0">
                                                        {isPaymentSent(payment) ? (
                                                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                                <ArrowUpRight className="h-5 w-5 text-red-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                                <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Información principal */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-1">
                                                            <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                                                                {isPaymentSent(payment)
                                                                    ? `Pago a ${payment.payee.name}`
                                                                    : `Pago de ${payment.payer.name}`}
                                                            </h3>
                                                            <span
                                                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                    payment.status
                                                                )} sm:ml-2`}
                                                            >
                                                                {getStatusIcon(payment.status)}
                                                                <span className="ml-1">{getStatusText(payment.status)}</span>
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-600 truncate mb-1">
                                                            {payment.description || "Sin descripción"}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(payment.created_at)}
                                                        </p>
                                                    </div>

                                                    {/* Monto */}
                                                    <div className="text-right">
                                                        <p
                                                            className={`text-lg font-semibold ${isPaymentSent(payment) ? "text-red-600" : "text-green-600"}`}
                                                        >
                                                            {isPaymentSent(payment) ? "-" : "+"}
                                                            {formatCurrency(payment.amount, {
                                                                showSymbol: true,
                                                                showCurrency: true,
                                                            })}
                                                        </p>
                                                    </div>
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
        </>
    );
};

export default PaymentHistoryPage;
