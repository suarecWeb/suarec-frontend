'use client';

import { useState } from 'react';
import { Contract } from '../interfaces/contract.interface';
import { ContractService } from '../services/ContractService';
import { X, DollarSign, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

interface BidModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  onBidSubmitted: () => void;
}

export default function BidModal({ contract, isOpen, onClose, onBidSubmitted }: BidModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ContractService.createBid({
        contractId: contract.id,
        amount: parseFloat(amount),
        message: message || undefined
      });

      onBidSubmitted();
      onClose();
    } catch (error) {
      console.error('Error creating bid:', error);
      alert('Error al crear la oferta');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Hacer Oferta</h2>
              <p className="text-blue-100">Negocia el precio del servicio</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contract Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{contract.publication?.title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>Precio actual: ${contract.currentPrice?.toLocaleString()} {contract.priceUnit}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                💡 Ofrece un precio competitivo para aumentar tus posibilidades de ser seleccionado.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tu oferta (${contract.priceUnit}):
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                  placeholder={`Ej: ${contract.currentPrice}`}
                  step="0.01"
                  min="1"
                  required
                />
              </div>
              <div className="flex items-start gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Una oferta más baja puede ser más atractiva, pero asegúrate de que sea rentable para ti.
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
                Un mensaje convincente puede marcar la diferencia en la selección.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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