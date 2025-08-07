"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Contract } from "../interfaces/contract.interface";
import { ContractService } from "../services/ContractService";
import {
  X,
  DollarSign,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { translatePriceUnit, calculatePriceWithTax } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import toast from "react-hot-toast";

interface BidModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  onBidSubmitted: () => void;
}

export default function BidModal({
  contract,
  isOpen,
  onClose,
  onBidSubmitted,
}: BidModalProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        toast.error("Error al decodificar el token");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ContractService.createBid({
        contractId: contract.id,
        bidderId: Number(currentUserId),
        amount: parseFloat(amount),
        message: message || undefined,
      });

      onBidSubmitted();
      onClose();
    } catch (error) {
      console.error("Error creating bid:", error);
      alert("Error al crear la oferta");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 py-8 sm:py-12">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Hacer Oferta
              </h2>
              <p className="text-blue-100 text-sm">
                Negocia el precio del servicio
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="px-4 pt-4 sm:px-6 sm:pt-6 overflow-y-auto flex-1">
          {/* Contract Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              {contract.publication?.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>
                  Precio actual: $
                  {calculatePriceWithTax(
                    contract.currentPrice!,
                  ).toLocaleString()}{" "}
                  {translatePriceUnit(contract.priceUnit)}
                </span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                💡 Ofrece un precio competitivo para aumentar tus posibilidades
                de ser seleccionado.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tu oferta (${translatePriceUnit(contract.priceUnit)}):
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={amount === "0" ? "" : amount}
                  onChange={(e) => {
                    // Solo permite números enteros (sin puntos, comas, ni decimales)
                    const value = e.target.value.replace(/[^0-9]/g, "");

                    if (value === "") {
                      setAmount("");
                    } else {
                      // Elimina ceros al inicio (ej: "007" -> "7")
                      const numberValue = parseInt(value, 10);
                      setAmount(numberValue.toString());
                    }
                  }}
                  onKeyDown={(e) => {
                    // Previene la entrada de caracteres no numéricos
                    if (
                      !/[0-9]/.test(e.key) &&
                      ![
                        "Backspace",
                        "Delete",
                        "Tab",
                        "Escape",
                        "Enter",
                        "ArrowLeft",
                        "ArrowRight",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                  placeholder={`Ej: ${Math.floor(calculatePriceWithTax(contract.currentPrice!))}`}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Una oferta más baja puede ser más atractiva, pero asegúrate de
                  que sea rentable para ti.
                </p>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mensaje (opcional):
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none resize-none"
                  rows={4}
                  placeholder="Explica por qué tu oferta es la mejor opción, incluye detalles sobre tu experiencia, tiempo de entrega..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Un mensaje convincente puede marcar la diferencia en la
                selección.
              </p>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 bg-white sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Enviar Oferta
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
