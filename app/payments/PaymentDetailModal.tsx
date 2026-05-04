"use client";

import {
  X,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ArrowRight,
  Calendar,
  FileText,
  Hash,
  Mail,
  Briefcase,
  MapPin,
  DollarSign,
  TrendingDown,
  Tag,
  MessageSquare,
  Gavel,
  ChevronDown,
  ChevronUp,
  Link,
} from "lucide-react";
import { useState } from "react";
import {
  PaymentTransaction,
  ContractBid,
} from "@/interfaces/payment.interface";
import { PaymentStatus } from "@/services/PaymentService";
import { formatCurrency } from "@/lib/formatCurrency";

interface PaymentDetailModalProps {
  payment: PaymentTransaction;
  onClose: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; border: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: "Completado",
    bg: "bg-green-100 text-green-800",
    border: "border-green-200",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
  PENDING: {
    label: "Pendiente",
    bg: "bg-yellow-100 text-yellow-800",
    border: "border-yellow-200",
    icon: <Clock className="h-4 w-4 text-yellow-500" />,
  },
  FINISHED: {
    label: "Finalizado",
    bg: "bg-blue-100 text-blue-800",
    border: "border-blue-200",
    icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
  },
  FAILED: {
    label: "Fallido",
    bg: "bg-red-100 text-red-800",
    border: "border-red-200",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
  },
  PROCESSING: {
    label: "Procesando",
    bg: "bg-purple-100 text-purple-800",
    border: "border-purple-200",
    icon: <Clock className="h-4 w-4 text-purple-500" />,
  },
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  negotiating: "Negociando",
  accepted: "Aceptado",
  in_progress: "En curso",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  completed: "Completado",
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-gray-100 text-gray-800",
    border: "border-gray-200",
    icon: <Clock className="h-4 w-4 text-gray-500" />,
  };

const formatDate = (date: Date | string | undefined | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatShortDate = (date: Date | string | undefined | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

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

const BidItem = ({ bid, index }: { bid: ContractBid; index: number }) => (
  <div
    className={`p-3 rounded-lg border ${bid.isAccepted ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Oferta #{index + 1}</span>
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
        {formatCurrency(bid.amount, { showSymbol: true, showCurrency: true })}
      </span>
    </div>
    {bid.message && (
      <p className="text-xs text-gray-600 italic">&quot;{bid.message}&quot;</p>
    )}
    <p className="text-xs text-gray-400 mt-1">
      {formatShortDate(bid.createdAt)}
    </p>
  </div>
);

export const PaymentDetailModal = ({
  payment,
  onClose,
}: PaymentDetailModalProps) => {
  const [showBids, setShowBids] = useState(false);
  const statusConfig = getStatusConfig(payment.status);
  const contract = payment.contract;
  const bids = contract?.bids ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#097EEC] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="payment-modal-title"
                className="text-lg font-bold leading-tight"
              >
                Detalle del pago
              </h2>
              <p className="text-xs text-blue-100 font-mono truncate max-w-[220px]">
                #{payment.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Monto principal + estado */}
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold text-gray-900">
              {formatCurrency(payment.amount, {
                showSymbol: true,
                showCurrency: true,
              })}
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.border}`}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              {payment.payment_method && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  <Tag className="h-3 w-3" />
                  {payment.payment_method}
                </span>
              )}
            </div>
            {payment.reference && (
              <p className="text-xs text-gray-400 font-mono">
                Ref: {payment.reference}
              </p>
            )}
          </div>

          {/* Publicación */}
          {contract?.publication?.title && (
            <div className="bg-[#097EEC]/5 border border-[#097EEC]/20 rounded-xl p-4">
              <SectionTitle
                icon={<Briefcase className="h-3.5 w-3.5" />}
                title="Servicio contratado"
              />
              <p className="font-semibold text-gray-900">
                {contract.publication.title}
              </p>
              {contract.publication.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {contract.publication.description}
                </p>
              )}
            </div>
          )}

          {/* Pagador → Receptor */}
          <div className="bg-gray-50 rounded-xl p-4">
            <SectionTitle
              icon={<User className="h-3.5 w-3.5" />}
              title="Partes involucradas"
            />
            <div className="flex items-center gap-3">
              <UserCard user={payment.payer} role="Pagador" />
              <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <UserCard user={payment.payee} role="Receptor" />
            </div>
          </div>

          {/* Desglose de precios del contrato */}
          {contract && (
            <div className="bg-gray-50 rounded-xl p-4">
              <SectionTitle
                icon={<DollarSign className="h-3.5 w-3.5" />}
                title="Desglose económico"
              />
              <div className="space-y-2">
                {contract.initialPrice != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Precio inicial</span>
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
                      <span className="text-gray-500">Precio negociado</span>
                      <span className="font-semibold text-[#097EEC]">
                        {formatCurrency(contract.currentPrice, {
                          showSymbol: true,
                          showCurrency: true,
                        })}
                      </span>
                    </div>
                  )}
                {contract.priceWithoutCommission != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sin comisión SUAREC</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(contract.priceWithoutCommission, {
                        showSymbol: true,
                        showCurrency: true,
                      })}
                    </span>
                  </div>
                )}
                {contract.suarecCommission != null && (
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
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
                {contract.totalCommissionWithTax != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Comisión + IVA 19%</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(contract.totalCommissionWithTax, {
                        showSymbol: true,
                        showCurrency: true,
                      })}
                    </span>
                  </div>
                )}
                {contract.priceUnit && (
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                    <span className="text-gray-500">Unidad de precio</span>
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

          {/* Estado del contrato + fechas acordadas */}
          {contract && (
            <div className="bg-gray-50 rounded-xl p-4">
              <SectionTitle
                icon={<Calendar className="h-3.5 w-3.5" />}
                title="Contrato"
              />
              <div className="space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Estado del contrato</span>
                  <span className="font-medium text-gray-800">
                    {CONTRACT_STATUS_LABELS[contract.status] ?? contract.status}
                  </span>
                </div>
                {contract.requestedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha solicitada</span>
                    <span className="font-medium text-gray-800">
                      {formatShortDate(contract.requestedDate)}
                      {contract.requestedTime && ` · ${contract.requestedTime}`}
                    </span>
                  </div>
                )}
                {contract.agreedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fecha acordada</span>
                    <span className="font-semibold text-green-700">
                      {formatShortDate(contract.agreedDate)}
                      {contract.agreedTime && ` · ${contract.agreedTime}`}
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
                      {contract.neighborhood && `, ${contract.neighborhood}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-500">Creado</span>
                  <span className="font-medium text-gray-800">
                    {formatShortDate(contract.createdAt)}
                  </span>
                </div>
                {contract.completedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Completado</span>
                    <span className="font-medium text-green-700">
                      {formatShortDate(contract.completedAt)}
                    </span>
                  </div>
                )}
                {contract.cancelledAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cancelado</span>
                    <span className="font-medium text-red-600">
                      {formatShortDate(contract.cancelledAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensajes del contrato */}
          {(contract?.clientMessage || contract?.providerMessage) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <SectionTitle
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                title="Mensajes del contrato"
              />
              {contract?.clientMessage && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Cliente
                  </p>
                  <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 italic">
                    &quot;{contract.clientMessage}&quot;
                  </p>
                </div>
              )}
              {contract?.providerMessage && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Proveedor
                  </p>
                  <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200 italic">
                    &quot;{contract.providerMessage}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ofertas / Contraofertas */}
          {bids.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
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
                    <BidItem key={bid.id} bid={bid} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descripción del pago */}
          {payment.description && (
            <div className="bg-gray-50 rounded-xl p-4">
              <SectionTitle
                icon={<FileText className="h-3.5 w-3.5" />}
                title="Descripción del pago"
              />
              <p className="text-sm text-gray-700">{payment.description}</p>
            </div>
          )}

          {/* Fechas del pago */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <SectionTitle
              icon={<Calendar className="h-3.5 w-3.5" />}
              title="Cronología del pago"
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Creado</span>
              <span className="font-medium text-gray-800">
                {formatDate(payment.created_at)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Actualizado</span>
              <span className="font-medium text-gray-800">
                {formatDate(payment.updated_at)}
              </span>
            </div>
            {payment.paid_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pagado en</span>
                <span className="font-semibold text-green-700">
                  {formatDate(payment.paid_at)}
                </span>
              </div>
            )}
          </div>

          {/* Link de pago Wompi */}
          {payment.wompi_payment_link && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Link className="h-3.5 w-3.5" />
                Link de pago
              </span>
              <a
                href={payment.wompi_payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#097EEC] font-medium hover:underline truncate max-w-[200px]"
              >
                Abrir en Wompi
              </a>
            </div>
          )}

          {/* Razón de fallo */}
          {payment.failureReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <SectionTitle
                icon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                title="Razón del fallo"
              />
              <p className="text-sm text-red-700">{payment.failureReason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
