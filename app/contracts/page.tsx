"use client";

import { useEffect, useState } from "react";
import { Contract, ContractStatus } from "../../interfaces/contract.interface";
import { ContractService } from "../../services/ContractService";
import { useRouter } from "next/navigation";
import BidModal from "../../components/bid-modal";
import Navbar from "../../components/navbar";
import {
  Briefcase,
  User,
  DollarSign,
  Clock,
  X,
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
  Receipt,
  Mail,
  Search,
} from "lucide-react";
import ProviderResponseModal from "@/components/provider-response-modal";
import EditProviderMessageModal from "@/components/edit-provider-message-modal";

import CancellationPenaltyModal from "@/components/cancellation-penalty-modal";
import OTPVerificationModal from "@/components/otp-verification-modal";
import {
  translatePriceUnit,
  calculatePriceWithTax,
  canCompleteContract,
  isUserCompany,
} from "@/lib/utils";
import { formatCurrency } from "@/lib/formatCurrency";
import { CancellationPenaltyService } from "../../services/CancellationPenaltyService";
import { useNotification } from "@/contexts/NotificationContext";
import {
  PaymentService,
  PaymentStatusByContractDto,
} from "../../services/PaymentService";
import StartChatButton from "@/components/start-chat-button";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { TokenPayload } from "@/interfaces/auth.interface";
import { AccountBalance } from "@/components/contracts/AccountBalance";
import { KPIs } from "@/components/contracts/kpis";
import { ContractDetailsModal } from "@/components/contracts/details.contracts";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<{
    asClient: Contract[];
    asProvider: Contract[];
  }>({
    asClient: [],
    asProvider: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isProviderResponseModalOpen, setIsProviderResponseModalOpen] =
    useState(false);
  const [isEditProviderMessageModalOpen, setIsEditProviderMessageModalOpen] =
    useState(false);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
    useState(false);
  const [contractToCancel, setContractToCancel] = useState<Contract | null>(
    null,
  );
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleteConfirmationOpen, setIsCompleteConfirmationOpen] =
    useState(false);
  const [contractToComplete, setContractToComplete] = useState<Contract | null>(
    null,
  );
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [contractForOTP, setContractForOTP] = useState<Contract | null>(null);
  const [penaltyInfo, setPenaltyInfo] = useState<{
    requiresPenalty: boolean;
    message?: string;
  } | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatRecipient, setSelectedChatRecipient] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  const [contractPaymentStatus, setContractPaymentStatus] = useState<{
    [contractId: string]: PaymentStatusByContractDto;
  }>({});
  const [contractPaymentLinks, setContractPaymentLinks] = useState<{
    [contractId: string]: string | null;
  }>({});
  const [activeTab, setActiveTab] = useState<"client" | "provider" | "all">(
    "provider",
  );
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [contractForDetails, setContractForDetails] = useState<Contract | null>(
    null,
  );
  const [detailsViewRole, setDetailsViewRole] = useState<
    "client" | "provider" | null
  >(null);

  useEffect(() => {
    loadContracts();
  }, []);

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

  useEffect(() => {
    if (isDetailsModalOpen && contractForDetails) {
      refreshPaymentData(contractForDetails.id);
    }
  }, [isDetailsModalOpen, contractForDetails?.id]);

  const loadContracts = async () => {
    try {
      const data = await ContractService.getMyContracts();

      // Ordenar contratos por fecha (más recientes primero)
      const sortContractsByDate = (contracts: Contract[]) => {
        return contracts.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
        });
      };

      const sortedData = {
        asClient: sortContractsByDate([...data.asClient]),
        asProvider: sortContractsByDate([...data.asProvider]),
      };

      setContracts(sortedData);

      // Cargar estado de pagos y links de pago para contratos como cliente
      const paymentStatusPromises = data.asClient.map(async (contract) => {
        try {
          const paymentStatus = await PaymentService.getPaymentStatusByContract(
            contract.id,
          );
          return { contractId: contract.id, status: paymentStatus };
        } catch (error) {
          toast.error(
            `Error al cargar el estado de pago para el contrato ${contract.id}: ${error instanceof Error ? error.message : "Error desconocido"}`,
          );
          return null;
        }
      });

      const paymentStatuses = await Promise.all(paymentStatusPromises);
      const paymentStatusMap: {
        [contractId: string]: PaymentStatusByContractDto;
      } = {};

      paymentStatuses.forEach((result) => {
        if (result) {
          paymentStatusMap[result.contractId] = result.status;
        }
      });

      setContractPaymentStatus(paymentStatusMap);

      const paymentLinkPromises = data.asClient.map(async (contract) => {
        try {
          const payment = await PaymentService.getPaymentByContract(
            contract.id,
          );
          return {
            contractId: contract.id,
            link: payment?.wompi_payment_link || null,
          };
        } catch (error) {
          return { contractId: contract.id, link: null };
        }
      });

      const paymentLinks = await Promise.all(paymentLinkPromises);
      const paymentLinkMap: {
        [contractId: string]: string | null;
      } = {};

      paymentLinks.forEach((result) => {
        if (result) {
          paymentLinkMap[result.contractId] = result.link;
        }
      });

      setContractPaymentLinks(paymentLinkMap);
    } catch (error) {
      toast.error("Error al cargar el estado de pago");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string, acceptorId: number) => {
    try {
      await ContractService.acceptBid({ bidId, acceptorId });
      loadContracts(); // Recargar para ver los cambios
    } catch (error) {
      toast.error("Error al aceptar la oferta");
    }
  };

  const handleGoToPayment = async (contract: Contract) => {
    try {
      let link = contractPaymentLinks[contract.id] || null;

      if (!link) {
        const payment = await PaymentService.createPaymentLink(contract.id);
        link = payment?.wompi_payment_link || null;

        if (!link) {
          const fallback = await PaymentService.getPaymentByContract(
            contract.id,
          );
          link = fallback?.wompi_payment_link || null;
        }
      }

      if (link) {
        setContractPaymentLinks((prev) => ({
          ...prev,
          [contract.id]: link,
        }));
        window.location.href = link;
      } else {
        toast.error("No se encontro un enlace de pago disponible.");
      }
    } catch (err) {
      toast.error("Error al obtener el enlace de pago.");
    }
  };

  const getPaymentStatusDisplay = (contract: Contract) => {
    const paymentStatus = contractPaymentStatus[contract.id];
    if (!paymentStatus) return null;

    if (paymentStatus.hasCompletedPayments) {
      return (
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-gray-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">✅ Pago completado</span>
          </div>
        </div>
      );
    }

    if (paymentStatus.hasPendingPayments) {
      return (
        <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">⏳ Pago en proceso</span>
          </div>
        </div>
      );
    }

    return null;
  };

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

  const shouldShowPaymentButton = (contract: Contract) => {
    const paymentLink = contractPaymentLinks[contract.id];
    return Boolean(paymentLink);
  };

  const isClientForContract = (contract: Contract) => {
    if (currentUserId === null) {
      return activeTab === "client";
    }
    const clientId = contract.client?.id ?? contract.clientId;
    return Number(clientId) === currentUserId;
  };

  const refreshPaymentData = async (contractId: string) => {
    try {
      const payment = await PaymentService.createPaymentLink(contractId);
      let link = payment?.wompi_payment_link || null;

      if (!link) {
        const fallback = await PaymentService.getPaymentByContract(contractId);
        link = fallback?.wompi_payment_link || null;
      }

      setContractPaymentLinks((prev) => ({
        ...prev,
        [contractId]: link,
      }));
    } catch (error) {
      // Silenciar errores; el botÃ³n depende de la disponibilidad del endpoint.
    }
  };

  const detailsIsClientView = contractForDetails
    ? detailsViewRole
      ? detailsViewRole === "client"
      : isClientForContract(contractForDetails)
    : activeTab === "client";
  const detailsShowPayButton =
    contractForDetails &&
    detailsIsClientView &&
    contractForDetails.status === ContractStatus.ACCEPTED;

  const handleCancelContract = async (contract: Contract) => {
    setContractToCancel(contract);

    try {
      const penaltyCheck = await ContractService.checkPenaltyRequired(
        contract.id,
      );
      setPenaltyInfo(penaltyCheck);

      if (penaltyCheck.requiresPenalty) {
        setIsCancelConfirmationOpen(true);
      } else {
        setIsCancelConfirmationOpen(true);
      }
    } catch (error) {
      console.error("Error checking penalty requirement:", error);
      setPenaltyInfo({
        requiresPenalty: true,
        message: "Error al verificar penalización",
      });
      setIsCancelConfirmationOpen(true);
    }
  };

  const handleCompleteContract = async (contract: Contract) => {
    if (!currentUserId) {
      toast.error("No se pudo identificar al usuario");
      return;
    }

    if (!canCompleteContract(contract, currentUserId)) {
      toast.error("No puedes marcar este contrato como completado");
      return;
    }

    setContractToComplete(contract);
    setIsCompleteConfirmationOpen(true);
  };

  const confirmCompleteContract = async () => {
    if (!contractToComplete) return;

    setIsCompleting(true);
    try {
      await ContractService.completeContract(contractToComplete.id);
      toast.success("Contrato marcado como completado exitosamente");
      loadContracts();
      setIsCompleteConfirmationOpen(false);
      setContractToComplete(null);
    } catch (error) {
      toast.error("Error al marcar el contrato como completado");
    } finally {
      setIsCompleting(false);
    }
  };

  const closeCompleteConfirmation = () => {
    setIsCompleteConfirmationOpen(false);
    setContractToComplete(null);
    setIsCompleting(false);
  };

  const handleOTPVerification = (contract: Contract) => {
    setContractForOTP(contract);
    setIsOTPModalOpen(true);
  };

  const handleOTPVerified = () => {
    if (contractForOTP) {
      setContracts((prevContracts) => ({
        ...prevContracts,
        asClient: prevContracts.asClient.map((contract) =>
          contract.id === contractForOTP.id
            ? { ...contract, otpVerified: true }
            : contract,
        ),
        asProvider: prevContracts.asProvider,
      }));

      toast.success("Servicio confirmado. Ahora puedes proceder con el pago.");
      loadContracts();
    }
  };

  const closeOTPModal = () => {
    setIsOTPModalOpen(false);
    setContractForOTP(null);
  };

  const confirmCancelContract = async () => {
    if (!contractToCancel) return;

    setIsCancelling(true);
    try {
      await ContractService.cancelContract(contractToCancel.id);
      toast.success("Contrato cancelado exitosamente");
      loadContracts();
      setIsCancelConfirmationOpen(false);
      setContractToCancel(null);
    } catch (error) {
      console.error("Error canceling contract:", error);
      toast.error("Error al cancelar el contrato");
    } finally {
      setIsCancelling(false);
    }
  };

  const closeCancelConfirmation = () => {
    setIsCancelConfirmationOpen(false);
    setContractToCancel(null);
    setIsCancelling(false);
    setPenaltyInfo(null);
  };

  const handleCancellationPenaltyPayment = async () => {
    if (!contractToCancel) return;

    setIsCancelling(true);
    try {
      // Crear el pago de penalización usando el servicio específico
      const penaltyData = {
        contractId: contractToCancel.id,
        amount: 10000,
        currency: "COP",
        paymentMethod: "WOMPI",
        description: `Penalización por cancelación de contrato: ${contractToCancel.publication?.title || "Contrato"}`,
        paymentType: "CANCELLATION_PENALTY",
      };

      const payment =
        await CancellationPenaltyService.createPenaltyPayment(penaltyData);
      console.log(payment.wompi_payment_link);
      if (payment && payment.wompi_payment_link) {
        window.location.href = payment.wompi_payment_link;
      } else {
        toast.error(
          "No se pudo generar el enlace de pago para la penalización",
        );
      }
    } catch (error) {
      console.error("Error creating penalty payment:", error);
      toast.error("Error al crear el pago de penalización");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case ContractStatus.NEGOTIATING:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case ContractStatus.ACCEPTED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case ContractStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case ContractStatus.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      case ContractStatus.COMPLETED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case ContractStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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
        <div className="bg-[#097EEC] text-white py-12 pt-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Mis Compras</h1>
            <p className="text-blue-100 text-lg">
              Gestiona tus servicios contratados y ofrecidos
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6 pb-12">
          {/* MOBILE: Billetera como barra compacta arriba */}
          <div className="lg:hidden mb-4 pt-4">
            <AccountBalance />
          </div>

          {/* Main content with Balance Card on the right */}
          <div className="relative">
            {/* DESKTOP: Balance Card positioned on the right */}
            <div className="hidden lg:block absolute top-0 right-0 w-96 z-10">
              <AccountBalance />
            </div>

            {/* Main content — margen derecho solo en desktop */}
            <div className="lg:mr-[28rem] pt-4">
              {/* Buscador de contratos arriba de las KPIs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar contratos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none text-sm"
                  />
                </div>
              </div>

              {/* Stats Cards as Tabs */}
              <KPIs
                contracts={contracts}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            {/* ── FIN del contenedor con margen para billetera ── */}

            {/* ── Cards de contratos: ancho completo ── */}
            <div className="mt-6">
              {/* Contrataciones Solicitadas */}
              {(activeTab === "client" || activeTab === "all") && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-gray-500 rounded-full"></span>
                    <Briefcase className="h-6 w-6 text-gray-600" />
                    Contrataciones Solicitadas
                  </h2>

                  {contracts.asClient.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No has solicitado contrataciones
                      </h3>
                      <p className="text-gray-500">
                        Cuando contrates servicios, aparecerán aquí para que
                        puedas gestionarlos.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                      {contracts.asClient.map((contract) => (
                        <div
                          key={contract.id}
                          onClick={() => {
                            setContractForDetails(contract);
                            setIsDetailsModalOpen(true);
                            setDetailsViewRole("client");
                            if (isClientForContract(contract)) {
                              refreshPaymentData(contract.id);
                            }
                          }}
                          className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#5a93fc]/20 transition-all duration-300 overflow-hidden cursor-pointer"
                        >
                          {/* Header */}
                          <div className="relative bg-gradient-to-r from-[#5a93fc]/10 via-[#097EEC]/5 to-[#5a93fc]/10 px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-[#5a93fc]/10 group-hover:shadow-md transition-all mt-0.5">
                                <Briefcase className="h-5 w-5 text-[#5a93fc]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 truncate">
                                  {contract.publication?.title}
                                </h3>
                                {contract.publication?.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {contract.publication.description}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(contract.status)}`}
                              >
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                          </div>

                          <div className="px-5 py-4 space-y-3">
                            {/* Precio */}
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(contract.totalPrice || 0)}
                                </span>
                                {contract.priceUnit && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    / {translatePriceUnit(contract.priceUnit)}
                                  </span>
                                )}
                              </div>
                              {contract.quantity && (
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
                                  Cant: {contract.quantity}
                                </span>
                              )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Proveedor */}
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <User className="h-3.5 w-3.5 text-[#5a93fc] shrink-0" />
                                <span className="truncate">
                                  {contract.provider?.name || "—"}
                                </span>
                              </div>
                              {/* Fecha */}
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3.5 w-3.5 text-[#5a93fc] shrink-0" />
                                <span>
                                  {new Date(
                                    contract.createdAt,
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              {/* Ubicación */}
                              {contract.serviceAddress && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <MapPin className="h-3.5 w-3.5 text-[#5a93fc] shrink-0" />
                                  <span className="truncate">
                                    {contract.neighborhood ||
                                      contract.serviceAddress}
                                  </span>
                                </div>
                              )}
                              {/* Método de pago */}
                              {(contract.originalPaymentMethod ||
                                contract.paymentMethod) && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <CreditCard className="h-3.5 w-3.5 text-[#5a93fc] shrink-0" />
                                  <span className="truncate capitalize">
                                    {contract.originalPaymentMethod ||
                                      contract.paymentMethod}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Fechas solicitada/acordada */}
                            {(contract.requestedDate ||
                              contract.agreedDate) && (
                              <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
                                {contract.requestedDate && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                      Fecha solicitada
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      {new Date(
                                        contract.requestedDate,
                                      ).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                      {contract.requestedTime &&
                                        ` · ${contract.requestedTime}`}
                                    </span>
                                  </div>
                                )}
                                {contract.agreedDate && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                      Fecha acordada
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      {new Date(
                                        contract.agreedDate,
                                      ).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                      {contract.agreedTime &&
                                        ` · ${contract.agreedTime}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Mensaje del cliente */}
                            {contract.clientMessage && (
                              <div className="flex items-start gap-2 bg-blue-50/50 rounded-xl px-3 py-2">
                                <MessageSquare className="h-3.5 w-3.5 text-[#5a93fc] shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {contract.clientMessage}
                                </p>
                              </div>
                            )}

                            {/* Divider + Botón */}
                            <div className="h-px bg-gray-100"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setContractForDetails(contract);
                                setIsDetailsModalOpen(true);
                                setDetailsViewRole("client");
                                if (isClientForContract(contract)) {
                                  refreshPaymentData(contract.id);
                                }
                              }}
                              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#097EEC] bg-[#097EEC]/8 hover:bg-[#097EEC]/15 border border-[#097EEC]/10 hover:border-[#097EEC]/25 transition-all duration-200 flex items-center justify-center gap-1.5"
                            >
                              Ver Detalles
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Servicios Ofrecidos */}
              {(activeTab === "provider" || activeTab === "all") && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-gray-500 rounded-full"></span>
                    <Users className="h-6 w-6 text-gray-600" />
                    Servicios Ofrecidos
                  </h2>

                  {contracts.asProvider.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No has recibido solicitudes
                      </h3>
                      <p className="text-gray-500">
                        Cuando alguien contrate tus servicios, aparecerán aquí
                        para que puedas gestionarlos.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                      {contracts.asProvider.map((contract) => (
                        <div
                          key={contract.id}
                          onClick={() => {
                            setContractForDetails(contract);
                            setIsDetailsModalOpen(true);
                            setDetailsViewRole("provider");
                            if (isClientForContract(contract)) {
                              refreshPaymentData(contract.id);
                            }
                          }}
                          className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#097EEC]/20 transition-all duration-300 overflow-hidden cursor-pointer"
                        >
                          {/* Header */}
                          <div className="relative bg-gradient-to-r from-[#097EEC]/10 via-[#5a93fc]/5 to-[#097EEC]/10 px-5 py-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-[#097EEC]/10 group-hover:shadow-md transition-all mt-0.5">
                                <Users className="h-5 w-5 text-[#097EEC]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 truncate">
                                  {contract.publication?.title}
                                </h3>
                                {contract.publication?.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                    {contract.publication.description}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusColor(contract.status)}`}
                              >
                                {getStatusText(contract.status)}
                              </span>
                            </div>
                          </div>

                          <div className="px-5 py-4 space-y-3">
                            {/* Precio */}
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatCurrency(contract.totalPrice || 0)}
                                </span>
                                {contract.priceUnit && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    / {translatePriceUnit(contract.priceUnit)}
                                  </span>
                                )}
                              </div>
                              {contract.quantity && (
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg">
                                  Cant: {contract.quantity}
                                </span>
                              )}
                            </div>

                            {/* Info grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Cliente */}
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <User className="h-3.5 w-3.5 text-[#097EEC] shrink-0" />
                                <span className="truncate">
                                  {contract.client?.name || "—"}
                                </span>
                              </div>
                              {/* Fecha */}
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3.5 w-3.5 text-[#097EEC] shrink-0" />
                                <span>
                                  {new Date(
                                    contract.createdAt,
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              {/* Ubicación */}
                              {contract.serviceAddress && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <MapPin className="h-3.5 w-3.5 text-[#097EEC] shrink-0" />
                                  <span className="truncate">
                                    {contract.neighborhood ||
                                      contract.serviceAddress}
                                  </span>
                                </div>
                              )}
                              {/* Método de pago */}
                              {(contract.originalPaymentMethod ||
                                contract.paymentMethod) && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <CreditCard className="h-3.5 w-3.5 text-[#097EEC] shrink-0" />
                                  <span className="truncate capitalize">
                                    {contract.originalPaymentMethod ||
                                      contract.paymentMethod}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Fechas solicitada/acordada */}
                            {(contract.requestedDate ||
                              contract.agreedDate) && (
                              <div className="bg-gray-50 rounded-xl px-3 py-2 space-y-1">
                                {contract.requestedDate && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                      Fecha solicitada
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      {new Date(
                                        contract.requestedDate,
                                      ).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                      {contract.requestedTime &&
                                        ` · ${contract.requestedTime}`}
                                    </span>
                                  </div>
                                )}
                                {contract.agreedDate && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">
                                      Fecha acordada
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                      {new Date(
                                        contract.agreedDate,
                                      ).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                      {contract.agreedTime &&
                                        ` · ${contract.agreedTime}`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Mensaje del proveedor */}
                            {contract.providerMessage && (
                              <div className="flex items-start gap-2 bg-blue-50/50 rounded-xl px-3 py-2">
                                <MessageSquare className="h-3.5 w-3.5 text-[#097EEC] shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {contract.providerMessage}
                                </p>
                              </div>
                            )}

                            {/* Divider + Botón */}
                            <div className="h-px bg-gray-100"></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setContractForDetails(contract);
                                setIsDetailsModalOpen(true);
                                setDetailsViewRole("provider");
                                if (isClientForContract(contract)) {
                                  refreshPaymentData(contract.id);
                                }
                              }}
                              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#097EEC] bg-[#097EEC]/8 hover:bg-[#097EEC]/15 border border-[#097EEC]/10 hover:border-[#097EEC]/25 transition-all duration-200 flex items-center justify-center gap-1.5"
                            >
                              Ver Detalles
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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

        {/* Chat Modal Centralizado */}
        {isChatModalOpen && selectedChatRecipient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <StartChatButton
              recipientId={selectedChatRecipient.id}
              recipientName={selectedChatRecipient.name}
              recipientType="person"
              context="job"
              className="px-6 py-3"
              variant="outline"
            />
            <button
              onClick={() => {
                setIsChatModalOpen(false);
                setSelectedChatRecipient(null);
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
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

        {/* Edit Provider Message Modal */}
        {selectedContract && (
          <EditProviderMessageModal
            contract={selectedContract}
            isOpen={isEditProviderMessageModalOpen}
            onClose={() => {
              setIsEditProviderMessageModalOpen(false);
              setSelectedContract(null);
            }}
            onMessageUpdated={() => {
              setIsEditProviderMessageModalOpen(false);
              setSelectedContract(null);
              loadContracts();
            }}
          />
        )}

        {/* OTP Verification Modal */}
        {isOTPModalOpen && contractForOTP && (
          <OTPVerificationModal
            isOpen={isOTPModalOpen}
            onClose={closeOTPModal}
            contractId={contractForOTP.id}
            serviceTitle={contractForOTP.publication?.title || "Servicio"}
            providerName={contractForOTP.provider?.name || "Proveedor"}
            onOTPVerified={handleOTPVerified}
          />
        )}

        {/* Complete Contract Confirmation Modal */}
        {isCompleteConfirmationOpen && contractToComplete && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeCompleteConfirmation}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeCompleteConfirmation}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>

              <div className="flex flex-col items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Completación
                  </h3>
                  <p className="text-sm text-gray-600">
                    Marcar contrato como completado
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  ¿Estás seguro que quieres marcar este contrato como
                  completado?
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ Esto significa que el trabajo ya fue realizado y el
                    servicio ha sido prestado completamente.
                  </p>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p>
                    <strong>Servicio:</strong>{" "}
                    {contractToComplete.publication?.title}
                  </p>
                  <p>
                    <strong>Cliente:</strong> {contractToComplete.client?.name}
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={closeCompleteConfirmation}
                  disabled={isCompleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmCompleteContract}
                  disabled={isCompleting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Completando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirmar Completación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Contract Penalty Modal */}
        {penaltyInfo && (
          <CancellationPenaltyModal
            isOpen={isCancelConfirmationOpen}
            onClose={closeCancelConfirmation}
            onConfirm={
              penaltyInfo.requiresPenalty
                ? handleCancellationPenaltyPayment
                : confirmCancelContract
            }
            contractTitle={
              contractToCancel?.publication?.title || "este contrato"
            }
            isLoading={isCancelling}
            requiresPenalty={penaltyInfo.requiresPenalty}
            penaltyMessage={penaltyInfo.message}
          />
        )}

        {/* Contract Details Modal */}
        {isDetailsModalOpen && contractForDetails && (
          <ContractDetailsModal
            contract={contractForDetails}
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setContractForDetails(null);
              setDetailsViewRole(null);
            }}
            isClientView={detailsIsClientView}
            onCancelContract={(contract) => {
              handleCancelContract(contract);
            }}
            onRespondContract={(contract) => {
              setSelectedContract(contract);
              setIsProviderResponseModalOpen(true);
            }}
            onPayContract={(contract) => {
              handleGoToPayment(contract);
            }}
            showPayButton={Boolean(detailsShowPayButton)}
          />
        )}
      </div>
    </>
  );
}
