"use client";

import { useState, useEffect } from "react";
import EventsService from "@/services/EventsService";
import { Evento } from "@/interfaces/event.interface";
import {
  TransaccionBoleta,
  TransaccionEstado,
} from "@/interfaces/boleta.interface";
import {
  CalendarDays,
  Ticket,
  Clock,
  Users,
  MapPin,
  QrCode,
  ArrowRightLeft,
  Timer,
  TrendingUp,
  Search,
  Inbox,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const formatDateTime = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return { date: "—", time: "—", full: "—" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { date: "—", time: "—", full: "—" };
  return {
    date: d.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    full: d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const formatDateOnly = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return "—";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeOnly = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return "—";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeRemaining = (dateString: string) => {
  const now = new Date().getTime();
  const event = new Date(dateString).getTime();
  const diff = event - now;

  if (diff <= 0) return { text: "Evento finalizado", expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return { text: `${days}d ${hours}h restantes`, expired: false };
  if (hours > 0)
    return { text: `${hours}h ${minutes}m restantes`, expired: false };
  return { text: `${minutes}m restantes`, expired: false };
};

interface BoletaValidada {
  boleta: {
    id: number;
    qrToken: string;
    estado: string;
    escaneadaAt: string;
    precioPagado: number;
    evento: {
      id: number;
      nombre: string;
      fechaEvento: string;
    };
  };
  compradorNombre: string;
  compradorEmail: string;
  validadorNombre: string;
  validadorEmail: string;
}

const EstadisticasManagement = () => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [transacciones, setTransacciones] = useState<TransaccionBoleta[]>([]);
  const [validadas, setValidadas] = useState<BoletaValidada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValidadas, setSearchValidadas] = useState("");

  useEffect(() => {
    Promise.all([
      EventsService.getAllEvents().then((r) => setEvents(r.data)),
      EventsService.getAllTransacciones().then((r) =>
        setTransacciones(r.data.transacciones),
      ),
      EventsService.getBoletasValidadas()
        .then((r) => setValidadas(r.data.validadas || []))
        .catch(() => {}),
    ])
      .catch(() => toast.error("Error al cargar estadísticas"))
      .finally(() => setLoading(false));
  }, []);

  // KPIs
  const totalTx = transacciones.length;
  const aprobado = transacciones.filter(
    (t) => t.estadoPago === TransaccionEstado.APROBADO,
  ).length;
  const pendiente = transacciones.filter(
    (t) => t.estadoPago === TransaccionEstado.PENDIENTE,
  ).length;
  const rechazado = transacciones.filter(
    (t) => t.estadoPago === TransaccionEstado.RECHAZADO,
  ).length;
  const recaudado = transacciones
    .filter((t) => t.estadoPago === TransaccionEstado.APROBADO)
    .reduce((sum, t) => sum + (t.monto || 0), 0);
  const totalBoletasVendidas = transacciones
    .filter((t) => t.estadoPago === TransaccionEstado.APROBADO)
    .reduce((sum, t) => sum + (t.cantidad || 0), 0);

  // Próximo evento
  const upcomingEvents = [...events]
    .filter((e) => new Date(e.fechaEvento) > new Date())
    .sort(
      (a, b) =>
        new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime(),
    );
  const nextEvent = upcomingEvents[0];

  // Filtrar validaciones
  const filteredValidadas = validadas.filter((v) => {
    if (!searchValidadas) return true;
    const q = searchValidadas.toLowerCase();
    return (
      v.compradorNombre?.toLowerCase().includes(q) ||
      v.compradorEmail?.toLowerCase().includes(q) ||
      v.validadorNombre?.toLowerCase().includes(q) ||
      v.validadorEmail?.toLowerCase().includes(q) ||
      v.boleta.evento?.nombre?.toLowerCase().includes(q) ||
      String(v.boleta.id).includes(q)
    );
  });

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent mx-auto mb-3" />
        <p className="text-sm text-gray-400">Cargando estadísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <ArrowRightLeft className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Total transacciones
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalTx}</p>
          <div className="flex gap-2 mt-2 text-[11px]">
            <span className="text-emerald-600 font-medium">
              {aprobado} aprob.
            </span>
            <span className="text-amber-600 font-medium">
              {pendiente} pend.
            </span>
            <span className="text-red-500 font-medium">{rechazado} rech.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Recaudado
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(recaudado)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalBoletasVendidas} boletas vendidas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Ticket className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Tasa de éxito
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {totalTx > 0 ? Math.round((aprobado / totalTx) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {aprobado} de {totalTx} transacciones
          </p>
        </motion.div>
      </div>

      {/* Próximo evento */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-[#097EEC] to-[#082D50] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-2 right-2 opacity-30">
            <img
              src="/images/fecha-limite.png"
              alt=""
              className="h-20 w-20 object-contain brightness-0 invert"
            />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-medium uppercase tracking-wide mb-2">
              <Timer className="h-4 w-4" />
              Próximo evento
            </div>
            <h3 className="text-2xl font-bold mb-1">{nextEvent.nombre}</h3>
            <div className="flex flex-wrap gap-4 text-sm text-blue-100 mt-3">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(nextEvent.fechaEvento).full}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {nextEvent.ubicacion}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {nextEvent.aforoTotal} aforo
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              {getTimeRemaining(nextEvent.fechaEvento).text}
            </div>
          </div>
        </motion.div>
      )}

      {/* Eventos cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#097EEC]" />
          Eventos y disponibilidad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {events
            .sort(
              (a, b) =>
                new Date(a.fechaEvento).getTime() -
                new Date(b.fechaEvento).getTime(),
            )
            .map((event, i) => {
              const dt = formatDateTime(event.fechaEvento);
              const remaining = getTimeRemaining(event.fechaEvento);
              const disponible = event.aforoDisponible ?? 0;
              const total = event.aforoTotal ?? 0;
              const vendidas = total - disponible;
              const porcentaje =
                total > 0 ? Math.round((vendidas / total) * 100) : 0;
              const isNext = nextEvent?.id === event.id;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${
                    isNext
                      ? "border-[#097EEC] ring-1 ring-[#097EEC]/20"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 truncate pr-2">
                      {event.nombre}
                    </h4>
                    {isNext && (
                      <span className="text-[10px] font-bold bg-[#097EEC] text-white px-2 py-0.5 rounded-full shrink-0">
                        SIGUIENTE
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-300" />
                      <span className="font-medium text-gray-700">
                        {dt.time}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span>{dt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gray-300" />
                      <span className="truncate">{event.ubicacion}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">
                        {vendidas} / {total} vendidas
                      </span>
                      <span
                        className={`font-medium ${disponible === 0 ? "text-red-500" : "text-emerald-600"}`}
                      >
                        {disponible} disp.
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          porcentaje >= 100
                            ? "bg-red-400"
                            : porcentaje >= 75
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                    <p
                      className={`text-[11px] mt-1 ${remaining.expired ? "text-red-500" : "text-gray-400"}`}
                    >
                      {remaining.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Tabla de validaciones QR */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-[#097EEC]" />
            Validaciones QR ({filteredValidadas.length})
          </h3>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por comprador, validador o evento..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] outline-none transition-all"
              value={searchValidadas}
              onChange={(e) => setSearchValidadas(e.target.value)}
            />
          </div>
        </div>

        {validadas.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <QrCode className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Aún no se ha validado ninguna boleta
            </p>
          </div>
        ) : filteredValidadas.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              Ninguna validación coincide con la búsqueda
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Boleta
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Comprador
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Validado por
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha escaneo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredValidadas.map((v, i) => {
                  const escaneoDate = formatDateTime(v.boleta.escaneadaAt);
                  const escaneoRaw = v.boleta.escaneadaAt;
                  const hasValidador =
                    v.validadorNombre && v.validadorNombre !== "—";

                  return (
                    <motion.tr
                      key={v.boleta.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.03, 0.5) }}
                      className="hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          #{v.boleta.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 truncate max-w-[160px] block">
                          {v.boleta.evento?.nombre || "—"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {formatDateOnly(v.boleta.evento?.fechaEvento)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-[10px] font-bold">
                            {(v.compradorNombre || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">
                              {v.compradorNombre || "—"}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {v.compradorEmail || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {hasValidador ? (
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#097EEC] to-[#0562C7] flex items-center justify-center text-white text-[10px] font-bold">
                              {(v.validadorNombre || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">
                                {v.validadorNombre}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                {v.validadorEmail}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">
                              Sin registro
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {escaneoRaw ? (
                          <div className="text-xs">
                            <p className="text-gray-700 font-medium">
                              {escaneoDate.date}
                            </p>
                            <p className="text-gray-400">{escaneoDate.time}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasManagement;
