'use client';

import { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, DollarSign, Calendar, Clock } from 'lucide-react';
import { Contract } from '@/interfaces/contract.interface';
import { ContractService } from '@/services/ContractService';

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
  onResponseSubmitted 
}: ProviderResponseModalProps) {
  const [action, setAction] = useState<'accept' | 'reject' | 'negotiate'>('accept');
  const [message, setMessage] = useState('');
  const [counterOffer, setCounterOffer] = useState(contract.initialPrice);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const responseData = {
        contractId: contract.id,
        action,
        providerMessage: message || undefined,
        counterOffer: action === 'negotiate' ? counterOffer : undefined,
        proposedDate: proposedDate ? new Date(proposedDate) : undefined,
        proposedTime: proposedTime || undefined
      };

      await ContractService.providerResponse(responseData);
      
      onResponseSubmitted();
      onClose();
      
      // Reset form
      setAction('accept');
      setMessage('');
      setCounterOffer(contract.initialPrice);
      setProposedDate('');
      setProposedTime('');
    } catch (error: any) {
      console.error('Error responding to contract:', error);
      alert('Error al responder: ' + (error?.response?.data?.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto modal-scrollbar">
        {/* Header */}
        <div className="bg-[#097EEC] text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">Responder Solicitud</h2>
              <p className="text-blue-100 text-sm">Responde a la solicitud de contratación</p>
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
            <h3 className="font-semibold text-gray-800 mb-2">{contract.publication?.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{contract.publication?.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cliente:</span>
                <p className="font-medium">{contract.client?.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Precio solicitado:</span>
                <p className="font-medium text-green-600">${contract.initialPrice?.toLocaleString()} {contract.priceUnit}</p>
              </div>
              {contract.requestedDate && (
                <div>
                  <span className="text-gray-500">Fecha solicitada:</span>
                  <p className="font-medium">{new Date(contract.requestedDate).toLocaleDateString()}</p>
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
                <p className="text-sm font-medium text-blue-800 mb-1">Mensaje del cliente:</p>
                <p className="text-sm text-blue-700">{contract.clientMessage}</p>
              </div>
            )}
          </div>

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
                    value="accept"
                    checked={action === 'accept'}
                    onChange={(e) => setAction(e.target.value as 'accept')}
                    className="mt-1 mr-3 text-green-600 focus:ring-green-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-800">Aceptar la solicitud</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Aceptas el precio y condiciones propuestas
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value as 'reject')}
                    className="mt-1 mr-3 text-red-600 focus:ring-red-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-gray-800">Rechazar la solicitud</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      No puedes o no quieres realizar este servicio
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value="negotiate"
                    checked={action === 'negotiate'}
                    onChange={(e) => setAction(e.target.value as 'negotiate')}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-800">Negociar condiciones</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Proponer un precio diferente o condiciones alternativas
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Counter Offer (only for negotiate) */}
            {action === 'negotiate' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tu contraoferta (${contract.priceUnit}):
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
                    action === 'accept' ? "Mensaje de confirmación..." :
                    action === 'reject' ? "Explica por qué no puedes realizar el servicio..." :
                    "Explica tu contraoferta y condiciones..."
                  }
                />
              </div>
            </div>

            {/* Proposed Date and Time (only for accept/negotiate) */}
            {(action === 'accept' || action === 'negotiate') && (
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
                    min={new Date().toISOString().split('T')[0]}
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
                  action === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                  action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {action === 'accept' ? <CheckCircle className="h-4 w-4" /> :
                     action === 'reject' ? <XCircle className="h-4 w-4" /> :
                     <MessageSquare className="h-4 w-4" />}
                    {action === 'accept' ? 'Aceptar' :
                     action === 'reject' ? 'Rechazar' :
                     'Negociar'}
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