'use client';

import { useState } from 'react';
import { Publication } from '../interfaces/publication.interface';
import { ContractService } from '../services/ContractService';
import { useRouter } from 'next/navigation';
import { X, DollarSign, Clock, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface ContractModalProps {
  publication: Publication;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractModal({ publication, isOpen, onClose }: ContractModalProps) {
  const [contractType, setContractType] = useState<'accept' | 'custom'>('accept');
  const [customPrice, setCustomPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const price = contractType === 'accept' 
        ? publication.price! 
        : (customPrice);

      if (isNaN(price) || price <= 0) {
        alert('Debes ingresar un precio válido');
        setIsLoading(false);
        return;
      }

      const contractData = {
        publicationId: publication.id!,
        initialPrice: Number(price),
        priceUnit: publication.priceUnit || 'project',
        clientMessage: message || undefined
      };

      console.log('Enviando datos de contratación:', contractData);
      console.log('Tipo de initialPrice:', typeof contractData.initialPrice);

      await ContractService.createContract(contractData);

      onClose();
      router.push('/contracts');
    } catch (error: any) {
      console.error('Error creating contract:', error?.response?.data || error);
      alert('Error al crear la contratación: ' + (error?.response?.data?.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="bg-[#097EEC] text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">Contratar Servicio</h2>
              <p className="text-blue-100 text-sm">Inicia el proceso de contratación</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Publication Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">{publication.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{publication.description}</p>
            {publication.price && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span className="text-lg">${publication.price.toLocaleString()}</span>
                <span className="text-sm text-gray-600">por {publication.priceUnit}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contract Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipo de contratación:
              </label>
              <div className="space-y-3">
                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-[#097EEC] transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value="accept"
                    checked={contractType === 'accept'}
                    onChange={(e) => setContractType(e.target.value as 'accept')}
                    className="mt-1 mr-3 text-[#097EEC] focus:ring-[#097EEC]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-[#097EEC]" />
                      <span className="font-medium text-gray-800">Aceptar tarifa original</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      ${publication.price?.toLocaleString()} {publication.priceUnit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Proceso más rápido y directo
                    </p>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border-2 border-gray-200 rounded-lg hover:border-[#097EEC] transition-colors cursor-pointer">
                  <input
                    type="radio"
                    value="custom"
                    checked={contractType === 'custom'}
                    onChange={(e) => setContractType(e.target.value as 'custom')}
                    className="mt-1 mr-3 text-[#097EEC] focus:ring-[#097EEC]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-[#097EEC]" />
                      <span className="font-medium text-gray-800">Ofrecer tarifa personalizada</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Negocia el precio que mejor se ajuste
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Puede tomar más tiempo en ser aceptada
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Price Input */}
            {contractType === 'custom' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tu oferta (${publication.priceUnit}):
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    placeholder={`Ej: ${publication.price}`}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <div className="flex items-start gap-2 mt-3 p-3 bg-blue-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Una oferta personalizada puede dificultar la contratación y tomar más tiempo en ser revisada.
                  </p>
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
                  placeholder="Describe lo que necesitas, especificaciones, fechas importantes..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Proporciona detalles específicos para obtener mejores resultados
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
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
                className="flex-1 px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Contratar
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