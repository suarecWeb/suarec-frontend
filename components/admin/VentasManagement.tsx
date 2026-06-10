"use client";

import { useState, useEffect } from "react";
import EventsService from "@/services/EventsService";
import { Evento } from "@/interfaces/event.interface";
import {
  TransaccionBoleta,
  TransaccionEstado,
} from "@/interfaces/boleta.interface";
import {
  Search,
  CalendarDays,
  User,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  Inbox,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ESTADO_CONFIG: Record<
  TransaccionEstado,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [TransaccionEstado.APROBADO]: {
    label: "Aprobado",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  [TransaccionEstado.PENDIENTE]: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  [TransaccionEstado.RECHAZADO]: {
    label: "Rechazado",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const VentasManagement = () => {
  const [transacciones, setTransacciones] = useState<TransaccionBoleta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TransaccionEstado>(
    "all",
  );
  const [eventoFilter, setEventoFilter] = useState<"all" | number>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    Promise.all([
      EventsService.getAllTransacciones(),
      EventsService.getAllEventsAdmin(),
    ])
      .then(([txRes, evRes]) => {
        setTransacciones(txRes.data.transacciones);
        setEventos(evRes.data);
      })
      .catch(() => toast.error("Error al cargar las transacciones"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, eventoFilter]);

  const filtered = transacciones.filter((tx) => {
    const matchesSearch =
      !searchTerm ||
      tx.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.comprador?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.comprador?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.evento?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || tx.estadoPago === statusFilter;

    const matchesEvento =
      eventoFilter === "all" || tx.evento?.id === eventoFilter;

    return matchesSearch && matchesStatus && matchesEvento;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage,
  );

  const getPageButtons = () => {
    const pageItems: { type: "page" | "ellipsis"; value: number | string }[] =
      [];
    for (let p = 1; p <= totalPages; p++) {
      if (
        totalPages <= 5 ||
        p === 1 ||
        p === totalPages ||
        Math.abs(p - safePage) <= 1
      ) {
        if (
          pageItems.length > 0 &&
          pageItems[pageItems.length - 1].type === "page" &&
          p > (pageItems[pageItems.length - 1].value as number) + 1
        ) {
          pageItems.push({ type: "ellipsis", value: "..." });
        }
        pageItems.push({ type: "page", value: p });
      }
    }
    return pageItems.map((item, i) =>
      item.type === "ellipsis" ? (
        <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">
          {item.value}
        </span>
      ) : (
        <button
          key={item.value}
          onClick={() => setCurrentPage(item.value as number)}
          className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
            safePage === (item.value as number)
              ? "bg-[#097EEC] text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {item.value}
        </button>
      ),
    );
  };

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por referencia, comprador o evento..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {[
              { value: "all", label: "Todos" },
              { value: TransaccionEstado.APROBADO, label: "Aprobado" },
              { value: TransaccionEstado.PENDIENTE, label: "Pendiente" },
              { value: TransaccionEstado.RECHAZADO, label: "Rechazado" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value as any)}
                className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors ${
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

        {/* Filtro por evento */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 shrink-0" />
          <select
            value={eventoFilter}
            onChange={(e) =>
              setEventoFilter(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
            className="flex-1 sm:max-w-xs text-sm border border-gray-200 rounded-xl bg-gray-50 px-3 py-2 focus:bg-white focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-all text-gray-600"
          >
            <option value="all">Todos los eventos</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nombre}
                {ev.visible === false ? " (oculto)" : ""}
              </option>
            ))}
          </select>
          {eventoFilter !== "all" && (
            <button
              onClick={() => setEventoFilter("all")}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-400">Cargando transacciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
            <Inbox className="h-9 w-9 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">
            No hay transacciones
          </h3>
          <p className="mt-1.5 text-sm text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "Ninguna transacción coincide con los filtros."
              : "Aún no hay compras de boletas registradas."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Comprador
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Cant.
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {paginated.map((tx, i) => {
                  const sc = ESTADO_CONFIG[tx.estadoPago] ?? {
                    label: tx.estadoPago || "Desconocido",
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                    icon: <Clock className="h-3.5 w-3.5" />,
                  };
                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          #{tx.id}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate max-w-[180px]">
                            {tx.evento?.nombre || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#097EEC] to-[#0562C7] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {tx.comprador?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                              {tx.comprador?.name || "—"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                              {tx.comprador?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                          <Ticket className="h-3.5 w-3.5 text-gray-300" />
                          {tx.cantidad}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCurrency(tx.monto)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${sc.color}`}
                        >
                          {sc.icon}
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {formatDate(tx.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11px] text-gray-400 font-mono truncate max-w-[120px] block">
                          {tx.referencia}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                Mostrando{" "}
                <span className="font-medium text-gray-700">
                  {filtered.length > 0 ? (safePage - 1) * itemsPerPage + 1 : 0}
                </span>{" "}
                -{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(safePage * itemsPerPage, filtered.length)}
                </span>{" "}
                de{" "}
                <span className="font-medium text-gray-700">
                  {filtered.length}
                </span>{" "}
                resultados
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 text-xs border border-gray-200 rounded-lg bg-white px-2 py-1 focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none"
              >
                {[5, 10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / pág.
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageButtons()}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VentasManagement;
