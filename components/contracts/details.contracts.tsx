"use client";

import {
  X,
  Briefcase,
  User,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Contract, ContractStatus } from "@/interfaces/contract.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import { translatePriceUnit } from "@/lib/utils";

interface ContractDetailsModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  isClientView?: boolean;
  onCancelContract?: (contract: Contract) => void;
  onRespondContract?: (contract: Contract) => void;
}

export function ContractDetailsModal({
  contract,
  isOpen,
  onClose,
  isClientView = true,
  onCancelContract,
  onRespondContract,
}: ContractDetailsModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case ContractStatus.NEGOTIATING:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ContractStatus.ACCEPTED:
        return "bg-green-100 text-green-800 border-green-200";
      case ContractStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case ContractStatus.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case ContractStatus.COMPLETED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return "Pendiente";
      case ContractStatus.NEGOTIATING:
        return "En Negociación";
      case ContractStatus.ACCEPTED:
        return "Aceptado";
      case ContractStatus.REJECTED:
        return "Rechazado";
      case ContractStatus.CANCELLED:
        return "Cancelado";
      case ContractStatus.COMPLETED:
        return "Completado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return <Clock className="h-5 w-5" />;
      case ContractStatus.NEGOTIATING:
        return <MessageSquare className="h-5 w-5" />;
      case ContractStatus.ACCEPTED:
        return <CheckCircle className="h-5 w-5" />;
      case ContractStatus.REJECTED:
        return <XCircle className="h-5 w-5" />;
      case ContractStatus.CANCELLED:
        return <XCircle className="h-5 w-5" />;
      case ContractStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalles del Contrato
              </h2>
              <p className="text-sm text-gray-500">
                {contract.publication?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Estado del contrato */}
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${getStatusColor(contract.status)}`}
          >
            {getStatusIcon(contract.status)}
            <div>
              <p className="font-semibold">Estado del Contrato</p>
              <p className="text-sm">{getStatusText(contract.status)}</p>
            </div>
          </div>

          {/* Información del servicio y precio - Estilo similar al modal de contratación */}
          <div className="mb-6 border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              {contract.publication?.category && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {contract.publication.category}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {contract.publication?.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {contract.publication?.description}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(
                  contract.publication?.price || contract.initialPrice || 0,
                )}{" "}
                COP
              </span>
              {contract.priceUnit && (
                <span className="text-gray-500">
                  por {translatePriceUnit(contract.priceUnit)}
                </span>
              )}
            </div>
          </div>

          {/* Detalles del contrato */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              Detalles del Contrato
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {/* Determinar si es tarifa original o personalizada */}
              {contract.initialPrice === (contract.publication?.price || 0) ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio Contratado:</span>
                  <span className="font-bold text-lg text-green-700">
                    {formatCurrency(contract.totalPrice || 0)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      Tarifa en Negociación:
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      Personalizada
                    </span>
                  </div>
                  <span className="font-bold text-lg text-yellow-600">
                    {formatCurrency(contract.totalPrice || 0)}
                  </span>
                </div>
              )}
              {contract.quantity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium text-gray-900">
                    {contract.quantity} {translatePriceUnit(contract.priceUnit)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información de las partes */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              Partes del Contrato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">
                  Cliente
                </p>
                <p className="font-semibold text-gray-900">
                  {contract.client?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {contract.client?.email}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-600 font-medium mb-1">
                  Proveedor
                </p>
                <p className="font-semibold text-gray-900">
                  {contract.provider?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {contract.provider?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-600" />
              Ubicación del Servicio
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Dirección:</span>
                <span className="font-medium text-gray-900">
                  {contract.serviceAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Barrio:</span>
                <span className="font-medium text-gray-900">
                  {contract.neighborhood}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de Propiedad:</span>
                <span className="font-medium text-gray-900">
                  {contract.propertyType}
                </span>
              </div>
              {contract.locationDescription && (
                <div>
                  <span className="text-gray-600">Descripción:</span>
                  <p className="font-medium text-gray-900 mt-1">
                    {contract.locationDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              Fechas
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de Creación:</span>
                <span className="font-medium text-gray-900">
                  {new Date(contract.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {contract.requestedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha Solicitada:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(contract.requestedDate).toLocaleDateString(
                      "es-ES",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                    {contract.requestedTime &&
                      ` a las ${contract.requestedTime}`}
                  </span>
                </div>
              )}
              {contract.agreedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha Acordada:</span>
                  <span className="font-medium text-green-700">
                    {new Date(contract.agreedDate).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {contract.agreedTime && ` a las ${contract.agreedTime}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mensajes */}
          {(contract.clientMessage || contract.providerMessage) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                Mensajes
              </h3>
              <div className="space-y-3">
                {contract.clientMessage && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">
                      Mensaje del Cliente
                    </p>
                    <p className="text-gray-900">{contract.clientMessage}</p>
                  </div>
                )}
                {contract.providerMessage && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-sm text-purple-600 font-medium mb-1">
                      Mensaje del Proveedor
                    </p>
                    <p className="text-gray-900">{contract.providerMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              Método de Pago
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <span className="font-medium text-gray-900">
                {contract.originalPaymentMethod || contract.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Footer con botones de acción */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          {/* Botón Responder Solicitud - Solo para proveedor y contratos pendientes */}
          {!isClientView &&
            contract.status === ContractStatus.PENDING &&
            onRespondContract && (
              <button
                onClick={() => {
                  onRespondContract(contract);
                  onClose();
                }}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Responder Solicitud
              </button>
            )}

          {/* Botón Cancelar Contrato - Para contratos que se pueden cancelar */}
          {(contract.status === ContractStatus.PENDING ||
            contract.status === ContractStatus.NEGOTIATING ||
            contract.status === ContractStatus.ACCEPTED) &&
            onCancelContract && (
              <button
                onClick={() => {
                  onCancelContract(contract);
                  onClose();
                }}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="h-5 w-5" />
                Cancelar Contrato
              </button>
            )}

          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
