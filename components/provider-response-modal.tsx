"use client";

import { useState } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Building,
  Home,
} from "lucide-react";
import { Contract, ContractStatus } from "@/interfaces/contract.interface";
import { ContractService } from "@/services/ContractService";
import { translatePriceUnit, calculatePriceWithTax } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { useNotification } from "@/contexts/NotificationContext";

interface ProviderResponseModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  onResponseSubmitted: () => void;
}

export default function ProviderResponseModal({
  contract,
  isOpen,
  onClose,
  onResponseSubmitted,
}: ProviderResponseModalProps) {
  const [action, setAction] = useState<
    | ContractStatus.ACCEPTED
    | ContractStatus.REJECTED
    | ContractStatus.NEGOTIATING
  >(ContractStatus.ACCEPTED);
  const [message, setMessage] = useState("");
  const [counterOffer, setCounterOffer] = useState(contract.initialPrice);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification, showContractNotification } = useNotification();

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      efectivo: "Efectivo",
      transferencia: "Transferencia bancaria",
      pse: "PSE",
      tarjeta: "Tarjeta de crédito/débito",
      nequi: "Nequi",
      daviplata: "DaviPlata",
    };
    return methods[method] || method;
  };

  const getPropertyTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      casa: "Casa",
      apartamento: "Apartamento",
      local: "Local comercial",
      oficina: "Oficina",
      bodega: "Bodega",
      finca: "Finca",
      otro: "Otro",
    };
    return types[type] || type;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const responseData = {
        contractId: contract.id,
        action: action as
          | ContractStatus.ACCEPTED
          | ContractStatus.REJECTED
          | ContractStatus.NEGOTIATING,
        providerMessage: message || undefined,
        counterOffer:
          action === ContractStatus.NEGOTIATING ? counterOffer : undefined,
        proposedDate: proposedDate ? new Date(proposedDate) : undefined,
        proposedTime: proposedTime || undefined,
      };

      await ContractService.providerResponse(responseData);

      // Mostrar mensaje de éxito según la acción con información específica
      const priceText = formatCurrency(
        calculatePriceWithTax(
          action === ContractStatus.NEGOTIATING ? counterOffer : contract.initialPrice
        ).toLocaleString()
      );

      switch (action) {
        case ContractStatus.ACCEPTED:
          showContractNotification(
            "Tarifa original aceptada - Cliente notificado",
            "accepted",
            priceText
          );
          break;
        case ContractStatus.REJECTED:
          showContractNotification(
            "Oferta rechazada - Cliente notificado",
            "rejected"
          );
          break;
        case ContractStatus.NEGOTIATING:
          showContractNotification(
            "Contraoferta enviada - Cliente notificado",
            "negotiating",
            priceText
          );
          break;
        default:
          showNotification("Respuesta enviada exitosamente", "success");
      }

      onResponseSubmitted();
      onClose();

      // Reset form
      setAction(ContractStatus.ACCEPTED);
      setMessage("");
      setCounterOffer(contract.initialPrice);
      setProposedDate("");
      setProposedTime("");
    } catch (error: any) {
      console.error("Error responding to contract:", error);
      showNotification(
        `Error al responder: ${error?.response?.data?.message || "Error desconocido"}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto modal-scrollbar">
        {/* Header */}
        <div className="bg-[#097EEC] text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">Responder Solicitud</h2>
              <p className="text-blue-100 text-sm">
                Responde a la solicitud de contratación
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-1"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contract Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">
              {contract.publication?.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {contract.publication?.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cliente:</span>
                <p className="font-medium">{contract.client?.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Precio solicitado:</span>
                <p className="font-medium text-gray-800">
                  {getPaymentMethodText(contract.paymentMethod)}
                </p>
                <p className="font-medium text-green-600">
                  {formatCurrency(
                    calculatePriceWithTax(
                      contract.initialPrice!,
                    ).toLocaleString(),
                  )}{" "}
                  {translatePriceUnit(contract.priceUnit)}
                </p>
              </div>
              {contract.requestedDate && (
                <div>
                  <span className="text-gray-500">Fecha solicitada:</span>
                  <p className="font-medium">
                    {new Date(contract.requestedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {contract.requestedTime && (
                <div>
                  <span className="text-gray-500">Hora solicitada:</span>
                  <p className="font-medium">{contract.requestedTime}</p>
                </div>
              )}
            </div>

            {contract.clientMessage && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-1">
                  Mensaje del cliente:
                </p>
                <p className="text-sm text-blue-700">
                  {contract.clientMessage}
                </p>
              </div>
            )}
          </div>

          {/* Service Location Info */}
          {(contract.serviceAddress ||
            contract.propertyType ||
            contract.neighborhood) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-800">
                  Ubicación del Servicio
                </h4>
              </div>

              <div className="space-y-3 text-sm">
                {contract.serviceAddress && (
                  <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-row gap-2 flex-1 items-center">
                      <span className="text-gray-600 font-medium">
                        Dirección:
                      </span>
                      <p className="text-gray-800">{contract.serviceAddress}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contract.propertyType && (
                    <div>
                      <span className="text-gray-600 font-medium">
                        Tipo de inmueble:
                      </span>
                      <p className="text-gray-800">
                        {getPropertyTypeText(contract.propertyType)}
                      </p>
                    </div>
                  )}

                  {contract.neighborhood && (
                    <div>
                      <span className="text-gray-600 font-medium">Barrio:</span>
                      <p className="text-gray-800">{contract.neighborhood}</p>
                    </div>
                  )}
                </div>

                {contract.locationDescription && (
                  <div className="mt-3 p-3 bg-gray-100 border border-gray-300 rounded">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      Descripción del lugar:
                    </p>
                    <p className="text-sm text-gray-700">
                      {contract.locationDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                ¿Qué deseas hacer?
              </label>
              <div className="space-y-3">
                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value={ContractStatus.ACCEPTED}
                    checked={action === ContractStatus.ACCEPTED}
                    onChange={(e) =>
                      setAction(e.target.value as ContractStatus.ACCEPTED)
                    }
                    className="mt-1 mr-3 text-green-600 focus:ring-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-800">
                        Aceptar la solicitud
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Aceptas el precio y condiciones propuestas
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value={ContractStatus.REJECTED}
                    checked={action === ContractStatus.REJECTED}
                    onChange={(e) =>
                      setAction(e.target.value as ContractStatus.REJECTED)
                    }
                    className="mt-1 mr-3 text-red-600 focus:ring-red-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-gray-800">
                        Rechazar la solicitud
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      No puedes o no quieres realizar este servicio
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value={ContractStatus.NEGOTIATING}
                    checked={action === ContractStatus.NEGOTIATING}
                    onChange={(e) =>
                      setAction(e.target.value as ContractStatus.NEGOTIATING)
                    }
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-800">
                        Negociar condiciones
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Proponer un precio diferente o condiciones alternativas
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Counter Offer (only for negotiate) */}
            {action === ContractStatus.NEGOTIATING && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tu contraoferta (${translatePriceUnit(contract.priceUnit)}):
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={counterOffer}
                    onChange={(e) => setCounterOffer(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    placeholder={`Ej: ${contract.initialPrice}`}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Se aplicará automáticamente el IVA del 19% al precio final
                </p>
              </div>
            )}

            {/* Message Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mensaje (opcional):
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                  rows={3}
                  placeholder={
                    action === ContractStatus.ACCEPTED
                      ? "Mensaje de confirmación..."
                      : action === ContractStatus.REJECTED
                        ? "Explica por qué no puedes realizar el servicio..."
                        : "Explica tu contraoferta y condiciones..."
                  }
                />
              </div>
            </div>

            {/* Proposed Date and Time (only for negotiate) */}
            {action === ContractStatus.NEGOTIATING && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha propuesta:
                  </label>
                  <input
                    type="date"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hora propuesta:
                  </label>
                  <input
                    type="time"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  action === ContractStatus.ACCEPTED
                    ? "bg-green-600 hover:bg-green-700"
                    : action === ContractStatus.REJECTED
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {action === ContractStatus.ACCEPTED ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : action === ContractStatus.REJECTED ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    {action === ContractStatus.ACCEPTED
                      ? "Aceptar"
                      : action === ContractStatus.REJECTED
                        ? "Rechazar"
                        : "Negociar"}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
