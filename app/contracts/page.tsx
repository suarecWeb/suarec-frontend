'use client';

import { useEffect, useState } from 'react';
import { Contract, ContractStatus } from '../../interfaces/contract.interface';
import { ContractService } from '../../services/ContractService';
import { useRouter } from 'next/navigation';
import BidModal from '../../components/bid-modal';
import Navbar from '../../components/navbar';
import { 
  Briefcase, 
  User, 
  DollarSign, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  Receipt
} from 'lucide-react';
import ProviderResponseModal from '@/components/provider-response-modal';
import { translatePriceUnit } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import { PaymentService } from '../../services/PaymentService';
import { WompiService } from '../../services/WompiService';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<{ asClient: Contract[], asProvider: Contract[] }>({
    asClient: [],
    asProvider: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isProviderResponseModalOpen, setIsProviderResponseModalOpen] = useState(false);
  const router = useRouter();
  const [acceptanceTokens, setAcceptanceTokens] = useState<any>(null);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [acceptPersonal, setAcceptPersonal] = useState(false);

  useEffect(() => {
    loadContracts();
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '';
    if (publicKey) {
      WompiService.getAcceptanceTokens(publicKey).then(setAcceptanceTokens);
    }
  }, []);

  const loadContracts = async () => {
    try {
      const data = await ContractService.getMyContracts();
      setContracts(data);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      await ContractService.acceptBid({ bidId });
      loadContracts(); // Recargar para ver los cambios
    } catch (error) {
      console.error('Error accepting bid:', error);
      alert('Error al aceptar la oferta');
    }
  };

  const handleGoToPayment = async (contract: Contract) => {
    try {
      if (!contract.provider || !contract.provider.id) {
        alert('No se encontró el proveedor para este contrato.');
        return;
      }
      if (!acceptanceTokens) {
        alert('No se pudieron obtener los contratos de Wompi.');
        return;
      }
      const paymentData = {
        amount: Math.round(Number(contract.totalPrice)),
        currency: 'COP',
        payment_method: 'WOMPI',
        contract_id: contract.id,
        payee_id: contract.provider.id,
        description: contract.publication?.title,
        acceptance_token: acceptanceTokens.presigned_acceptance.acceptance_token,
        accept_personal_auth: acceptanceTokens.presigned_personal_data_auth.acceptance_token,
      };
      const payment = await PaymentService.createPayment(paymentData);
      if (payment && payment.wompi_payment_link) {
        window.location.href = payment.wompi_payment_link;
      } else {
        alert('No se pudo obtener la URL de pago.');
      }
    } catch (err) {
      alert('Error al iniciar el pago.');
    }
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia bancaria',
      'pse': 'PSE',
      'tarjeta': 'Tarjeta de crédito/débito',
      'nequi': 'Nequi',
      'daviplata': 'DaviPlata'
    };
    return methods[method] || method;
  };

  const shouldShowPaymentButton = (contract: Contract) => {
    return contract.status === ContractStatus.ACCEPTED && 
           contract.paymentMethod && 
           contract.paymentMethod !== 'efectivo' &&
           contract.totalPrice;
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ContractStatus.NEGOTIATING:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ContractStatus.ACCEPTED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ContractStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ContractStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case ContractStatus.NEGOTIATING:
        return <TrendingUp className="h-4 w-4" />;
      case ContractStatus.ACCEPTED:
        return <CheckCircle className="h-4 w-4" />;
      case ContractStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case ContractStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return 'Pendiente';
      case ContractStatus.NEGOTIATING:
        return 'En Negociación';
      case ContractStatus.ACCEPTED:
        return 'Aceptado';
      case ContractStatus.REJECTED:
        return 'Rechazado';
      case ContractStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] text-white py-12 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Mis Contrataciones</h1>
            <p className="text-blue-100 text-lg">
              Gestiona tus servicios contratados y ofrecidos
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6 pb-12">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contrataciones Solicitadas</p>
                  <p className="text-2xl font-bold text-gray-800">{contracts.asClient.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicios Ofrecidos</p>
                  <p className="text-2xl font-bold text-gray-800">{contracts.asProvider.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Contratos</p>
                  <p className="text-2xl font-bold text-gray-800">{contracts.asClient.length + contracts.asProvider.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contrataciones como Cliente */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
              <Briefcase className="h-6 w-6 text-blue-600" />
              Contrataciones Solicitadas
            </h2>
            
            {contracts.asClient.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No has solicitado contrataciones</h3>
                <p className="text-gray-500">Cuando contrates servicios, aparecerán aquí para que puedas gestionarlos.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {contracts.asClient.map((contract) => (
                  <div key={contract.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{contract.publication?.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Proveedor: {contract.provider?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contract.status)} flex items-center gap-1`}>
                        {getStatusIcon(contract.status)}
                        {getStatusText(contract.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Precio Inicial</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatCurrency(contract.initialPrice?.toLocaleString())} {translatePriceUnit(contract.priceUnit)}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Precio Actual</span>
                        </div>
                        <p className="text-lg font-semibold text-blue-800">
                          {formatCurrency(contract.currentPrice?.toLocaleString())} {translatePriceUnit(contract.priceUnit)}
                        </p>
                      </div>
                    </div>

                    {/* Total Price Display (when contract is accepted) */}
                    {contract.status === ContractStatus.ACCEPTED && contract.totalPrice && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-800">Total a pagar (incluye IVA)</p>
                              <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(contract.totalPrice.toLocaleString(), {
                                  showCurrency: true,
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-green-600 mb-1">Método de pago:</p>
                            <p className="text-sm font-medium text-green-700">
                              {getPaymentMethodText(contract.paymentMethod || '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {contract.clientMessage && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800 mb-1">Tu mensaje:</p>
                            <p className="text-sm text-yellow-700">{contract.clientMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fecha y hora solicitadas */}
                    {(contract.requestedDate || contract.requestedTime) && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-purple-800 mb-1">Fecha y hora solicitadas:</p>
                            <div className="text-sm text-purple-700">
                              {contract.requestedDate && (
                                <p>📅 {new Date(contract.requestedDate).toLocaleDateString()}</p>
                              )}
                              {contract.requestedTime && (
                                <p>🕐 {contract.requestedTime}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fecha y hora acordadas */}
                    {(contract.agreedDate || contract.agreedTime) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-1">Fecha y hora acordadas:</p>
                            <div className="text-sm text-green-700">
                              {contract.agreedDate && (
                                <p>📅 {new Date(contract.agreedDate).toLocaleDateString()}</p>
                              )}
                              {contract.agreedTime && (
                                <p>🕐 {contract.agreedTime}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensaje del proveedor */}
                    {contract.providerMessage && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Respuesta del proveedor:</p>
                            <p className="text-sm text-blue-700">{contract.providerMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Acceptance Tokens */}
                    {acceptanceTokens && (
                      <div className="mb-4">
                        <div>
                          <input
                            type="checkbox"
                            checked={acceptPolicy}
                            onChange={e => setAcceptPolicy(e.target.checked)}
                          />
                          <label>
                            He leído y acepto los <a href={acceptanceTokens.presigned_acceptance.permalink} target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
                          </label>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            checked={acceptPersonal}
                            onChange={e => setAcceptPersonal(e.target.checked)}
                          />
                          <label>
                            Autorizo el tratamiento de mis datos personales según la <a href={acceptanceTokens.presigned_personal_data_auth.permalink} target="_blank" rel="noopener noreferrer">Política de Datos Personales</a>
                          </label>
                        </div>
                      </div>
                    )}

                    {contract.bids.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          Ofertas Recibidas ({contract.bids.length})
                        </h4>
                        <div className="space-y-3">
                          {contract.bids.map((bid) => (
                            <div key={bid.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-semibold text-green-700">
                                      ${bid.amount?.toLocaleString()} {translatePriceUnit(contract.priceUnit)}
                                    </span>
                                  </div>
                                  {bid.message && (
                                    <p className="text-sm text-gray-600">{bid.message}</p>
                                  )}
                                </div>
                                {!bid.isAccepted && contract.status === ContractStatus.NEGOTIATING && (
                                  <button
                                    onClick={() => handleAcceptBid(bid.id)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    Aceptar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {contract.status === ContractStatus.NEGOTIATING && (
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsBidModalOpen(true);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Hacer Nueva Oferta
                        </button>
                      )}

                      {/* Payment Button */}
                      {shouldShowPaymentButton(contract) && (
                        <button
                          onClick={() => handleGoToPayment(contract)}
                          disabled={!acceptPolicy || !acceptPersonal}
                          className="px-6 py-3 ml-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Ir a Pagar ${contract.totalPrice?.toLocaleString()}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}

                      {/* Cash Payment Info */}
                      {contract.status === ContractStatus.ACCEPTED && contract.paymentMethod === 'efectivo' && (
                        <div className="px-4 ml-auto py-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center gap-2 text-amber-800">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Pago en efectivo: {formatCurrency(contract.totalPrice?.toLocaleString())} al momento del servicio
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contrataciones como Proveedor */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-green-500 rounded-full"></span>
              <Users className="h-6 w-6 text-green-600" />
              Servicios Ofrecidos
            </h2>
            
            {contracts.asProvider.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No has recibido solicitudes</h3>
                <p className="text-gray-500">Cuando alguien contrate tus servicios, aparecerán aquí para que puedas gestionarlos.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {contracts.asProvider.map((contract) => (
                  <div key={contract.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{contract.publication?.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Cliente: {contract.client?.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contract.status)} flex items-center gap-1`}>
                        {getStatusIcon(contract.status)}
                        {getStatusText(contract.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Precio Inicial</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatCurrency(contract.initialPrice?.toLocaleString())} {translatePriceUnit(contract.priceUnit)}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Precio Actual</span>
                        </div>
                        <p className="text-lg font-semibold text-green-800">
                          {formatCurrency(contract.currentPrice?.toLocaleString())} {translatePriceUnit(contract.priceUnit)}
                        </p>
                      </div>
                    </div>

                    {contract.clientMessage && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800 mb-1">Mensaje del cliente:</p>
                            <p className="text-sm text-yellow-700">{contract.clientMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fecha y hora solicitadas */}
                    {(contract.requestedDate || contract.requestedTime) && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-purple-800 mb-1">Fecha y hora solicitadas:</p>
                            <div className="text-sm text-purple-700">
                              {contract.requestedDate && (
                                <p>📅 {new Date(contract.requestedDate).toLocaleDateString()}</p>
                              )}
                              {contract.requestedTime && (
                                <p>🕐 {contract.requestedTime}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fecha y hora acordadas */}
                    {(contract.agreedDate || contract.agreedTime) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-1">Fecha y hora acordadas:</p>
                            <div className="text-sm text-green-700">
                              {contract.agreedDate && (
                                <p>📅 {new Date(contract.agreedDate).toLocaleDateString()}</p>
                              )}
                              {contract.agreedTime && (
                                <p>🕐 {contract.agreedTime}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensaje del proveedor */}
                    {contract.providerMessage && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Tu respuesta:</p>
                            <p className="text-sm text-blue-700">{contract.providerMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botones de acción para el proveedor */}
                    {contract.status === ContractStatus.PENDING && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsProviderResponseModalOpen(true);
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Responder Solicitud
                        </button>
                      </div>
                    )}

                    {contract.status === ContractStatus.NEGOTIATING && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsBidModalOpen(true);
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Hacer Nueva Oferta
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bid Modal */}
        {isBidModalOpen && selectedContract && (
          <BidModal
            contract={selectedContract}
            isOpen={isBidModalOpen}
            onClose={() => {
              setIsBidModalOpen(false);
              setSelectedContract(null);
            }}
            onBidSubmitted={loadContracts}
          />
        )}

        {/* Provider Response Modal */}
        {isProviderResponseModalOpen && selectedContract && (
          <ProviderResponseModal
            contract={selectedContract}
            isOpen={isProviderResponseModalOpen}
            onClose={() => {
              setIsProviderResponseModalOpen(false);
              setSelectedContract(null);
            }}
            onResponseSubmitted={loadContracts}
          />
        )}
      </div>
    </>
  );
}
