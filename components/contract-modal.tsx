'use client';

import { useState } from 'react';
import { Publication } from '../interfaces/publication.interface';
import { ContractService } from '../services/ContractService';
import { useRouter } from 'next/navigation';
import { 
  X, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Banknote,
  Building,
  Smartphone,
  Calendar,
  Receipt
} from 'lucide-react';
import { translatePriceUnit } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';

interface ContractModalProps {
  publication: Publication;
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'WOMPI';

const paymentMethods = [
  { id: 'efectivo', name: 'Efectivo', icon: Banknote, description: 'Pago en efectivo al momento del servicio' },
  { id: 'transferencia', name: 'Transferencia bancaria', icon: Building, description: 'Transferencia a cuenta bancaria' },
  { id: 'tarjeta', name: 'Tarjeta de crédito/débito', icon: CreditCard, description: 'Visa, Mastercard, etc.' }
] as const;

export default function ContractModal({ publication, isOpen, onClose }: ContractModalProps) {
  const [contractType, setContractType] = useState<'accept' | 'custom'>('accept');
  const [customPrice, setCustomPrice] = useState(0);
  const [serviceAddress, setServiceAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [message, setMessage] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Calcular precios
  const basePrice = Number(contractType === 'accept' ? publication.price! : customPrice);
  const iva = Math.round(basePrice * 0.19);
  const totalPrice = basePrice + iva;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isNaN(basePrice) || basePrice <= 0) {
        alert('Debes ingresar un precio válido');
        setIsLoading(false);
        return;
      }

      if (!requestedDate) {
        alert('La fecha de servicio es obligatoria');
        setIsLoading(false);
        return;
      }

      if (!requestedTime) {
        alert('La hora de servicio es obligatoria');
        setIsLoading(false);
        return;
      }

      if (!serviceAddress.trim()) {
        alert('La dirección del servicio es obligatoria');
        setIsLoading(false);
        return;
      }

      if (!propertyType) {
        alert('Debes seleccionar el tipo de inmueble');
        setIsLoading(false);
        return;
      }

      if (!neighborhood.trim()) {
        alert('El barrio es obligatorio');
        setIsLoading(false);
        return;
      }

      let newPaymentMethod = paymentMethod;
      if (paymentMethod === 'tarjeta' || paymentMethod === 'transferencia' ) {
        newPaymentMethod = 'WOMPI';
      }

      const contractData = {
        publicationId: publication.id!,
        initialPrice: Number(basePrice),
        totalPrice: Number(totalPrice),
        priceUnit: publication.priceUnit || 'project',
        clientMessage: message || undefined,
        requestedDate: new Date(requestedDate),
        requestedTime: requestedTime,
        paymentMethod: newPaymentMethod,
        serviceAddress: serviceAddress.trim(),
        propertyType: propertyType,
        neighborhood: neighborhood.trim(),
        locationDescription: locationDescription.trim() || undefined
      };

      console.log('Enviando datos de contratación:', contractData);
      console.log('Desglose de precios:');
      console.log('- Precio base:', basePrice);
      console.log('- IVA (19%):', iva);
      console.log('- Total:', totalPrice);

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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-auto h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto modal-scrollbar">
        {/* Header */}
        <div className="bg-[#097EEC] text-white p-4 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-1">Contratar Servicio</h2>
              <p className="text-blue-100 text-sm">Completa los detalles de tu contratación</p>
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
        <div className="p-4 space-y-6">
          {/* Publication Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">{publication.title}</h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{publication.description}</p>
            {publication.price && (
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span className="text-lg">{formatCurrency(publication.price.toLocaleString(), {
                  showCurrency: true,
                })}</span>
                <span className="text-sm text-gray-600">por {translatePriceUnit(publication.priceUnit || '')}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                      {formatCurrency(publication.price?.toLocaleString())} {translatePriceUnit(publication.priceUnit || '')}
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
                  Tu oferta (${translatePriceUnit(publication.priceUnit || '')}):
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

            {/* Date and Time Input (Required) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="inline h-4 w-4 mr-1" />
                Fecha y hora del servicio <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Fecha:
                  </label>
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Hora:
                  </label>
                  <input
                    type="time"
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <CreditCard className="inline h-4 w-4 mr-1" />
                Método de pago <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start p-3 border-2 rounded-lg hover:border-[#097EEC] transition-colors cursor-pointer ${
                        paymentMethod === method.id ? 'border-[#097EEC] bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="mt-1 mr-3 text-[#097EEC] focus:ring-[#097EEC]"
                        required
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-[#097EEC]" />
                          <span className="font-medium text-gray-800 text-sm">{method.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Service Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Building className="inline h-4 w-4 mr-1" />
                Información del lugar <span className="text-red-500">*</span>
              </label>
              
              <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                {/* Dirección */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Dirección completa:
                  </label>
                  <input
                    type="text"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    placeholder="Ej: Calle 123 #45-67"
                    required
                  />
                </div>

                {/* Tipo de inmueble y Barrio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Tipo de inmueble:
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="local">Local comercial</option>
                      <option value="oficina">Oficina</option>
                      <option value="bodega">Bodega</option>
                      <option value="finca">Finca</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Barrio:
                    </label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      placeholder="Ej: Chapinero, Zona Rosa"
                      required
                    />
                  </div>
                </div>

                {/* Descripción del lugar */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Descripción del lugar:
                  </label>
                  <textarea
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                    rows={3}
                    placeholder="Describe características importantes del lugar: acceso, pisos, puntos de referencia, instrucciones especiales..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ayuda al proveedor a conocer mejor el lugar de trabajo
                  </p>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mensaje adicional (opcional):
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                  rows={3}
                  placeholder="Describe lo que necesitas, especificaciones, requisitos especiales..."
                />
              </div>
            </div>

            {/* Checkout Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Resumen del precio</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio base:</span>
                  <span className="font-medium">{formatCurrency(basePrice.toLocaleString())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">IVA (19%):</span>
                  <span className="font-medium">{formatCurrency(iva.toLocaleString())}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between items-center text-lg font-bold text-green-600">
                  <span>Total a pagar:</span>
                  <span>{formatCurrency(totalPrice.toLocaleString(), {
                    showCurrency: true,
                  })}</span>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-white rounded border border-green-300">
                <p className="text-xs text-gray-600">
                  <strong>Método de pago:</strong> {paymentMethods.find(m => m.id === paymentMethod)?.name}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Contratar por $ {totalPrice.toLocaleString()}
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
