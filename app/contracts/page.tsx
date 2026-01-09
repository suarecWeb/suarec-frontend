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
import { WompiService } from "../../services/WompiService";
import StartChatButton from "@/components/start-chat-button";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { TokenPayload } from "@/interfaces/auth.interface";
import { BalanceCard } from "@/components/BalanceCard";

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
  const [acceptanceTokens, setAcceptanceTokens] = useState<any>(null);
  const [acceptPolicy, setAcceptPolicy] = useState(false);
  const [acceptPersonal, setAcceptPersonal] = useState(false);
  const [contractPaymentStatus, setContractPaymentStatus] = useState<{
    [contractId: string]: PaymentStatusByContractDto;
  }>({});
  const [activeTab, setActiveTab] = useState<"client" | "provider" | "all">(
    "provider",
  );
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    loadContracts();
    const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
    if (publicKey) {
      WompiService.getAcceptanceTokens(publicKey).then(setAcceptanceTokens);
    }
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

  // Reiniciar checkboxes cuando se cargan los acceptance tokens
  useEffect(() => {
    if (acceptanceTokens) {
      setAcceptPolicy(false);
      setAcceptPersonal(false);
    }
  }, [acceptanceTokens]);

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

      // Cargar estado de pagos para contratos como cliente
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
      // Validar que los checkboxes estén marcados
      if (!acceptPolicy || !acceptPersonal) {
        toast.error(
          "Debes aceptar los términos y condiciones y autorizar el tratamiento de datos personales para continuar.",
        );
        return;
      }

      if (!contract.provider || !contract.provider.id) {
        toast.error("No se encontró el proveedor para este contrato.");
        return;
      }
      if (!acceptanceTokens) {
        toast.error("No se pudieron obtener los contratos de Wompi.");
        return;
      }
      const paymentData = {
        amount: Math.round(Number(contract.totalPrice)),
        currency: "COP",
        payment_method: "WOMPI",
        contract_id: contract.id,
        payee_id: contract.provider.id,
        description: contract.publication?.title,
        acceptance_token:
          acceptanceTokens.presigned_acceptance.acceptance_token,
        accept_personal_auth:
          acceptanceTokens.presigned_personal_data_auth.acceptance_token,
      };
      const payment = await PaymentService.createPayment(paymentData);
      if (payment && payment.wompi_payment_link) {
        window.location.href = payment.wompi_payment_link;
      } else {
        toast.error("No se pudo obtener la URL de pago.");
      }
    } catch (err) {
      toast.error("Error al iniciar el pago.");
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
    const paymentStatus = contractPaymentStatus[contract.id];

    // No mostrar si ya tiene pagos completados o finalizados
    if (paymentStatus?.hasCompletedPayments) {
      return false;
    }

    if (contract.status === ContractStatus.COMPLETED) {
      return (
        contract.otpVerified && contract.paymentMethod && contract.totalPrice
      );
    }

    return false;
  };

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
            <h1 className="text-4xl font-bold mb-2">Mis Contrataciones</h1>
            <p className="text-blue-100 text-lg">
              Gestiona tus servicios contratados y ofrecidos
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6 pb-12">
          {/* Balance Card */}
          <div className="mb-8">
            <BalanceCard />
          </div>

          {/* Stats Cards as Tabs */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => setActiveTab("client")}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 text-left hover:shadow-md hover:-translate-y-1 ${
                activeTab === "client"
                  ? "border-blue-200 bg-blue-50"
                  : "hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    activeTab === "client"
                      ? "bg-[#097EEC] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Contrataciones Solicitadas
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {contracts.asClient.length}
                  </p>
                </div>
              </div>
              {activeTab === "client" && (
                <div className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 font-semibold">
                    Sección activa
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("provider")}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 text-left hover:shadow-md hover:-translate-y-1 ${
                activeTab === "provider"
                  ? "border-blue-200 bg-blue-50"
                  : "hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    activeTab === "provider"
                      ? "bg-[#097EEC] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Servicios Ofrecidos
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {contracts.asProvider.length}
                  </p>
                </div>
              </div>
              {activeTab === "provider" && (
                <div className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 font-semibold">
                    Sección activa
                  </div>
                </div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 text-left hover:shadow-md hover:-translate-y-1 ${
                activeTab === "all"
                  ? "border-blue-200 bg-blue-50"
                  : "hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    activeTab === "all"
                      ? "bg-[#097EEC] text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Total de Contratos
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {contracts.asClient.length + contracts.asProvider.length}
                  </p>
                </div>
              </div>
              {activeTab === "all" && (
                <div className="bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                  <div className="text-xs text-blue-700 font-semibold">
                    Sección activa
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Contrataciones como Cliente */}
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
                    Cuando contrates servicios, aparecerán aquí para que puedas
                    gestionarlos.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {contracts.asClient.map((contract) => (
                    <div
                      key={contract.id}
                      className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1"
                    >
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full translate-y-12 -translate-x-12"></div>

                      <div className="relative z-10 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {contract.publication?.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                  Proveedor: {contract.provider?.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    contract.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contract.status)} flex items-center gap-1`}
                          >
                            {getStatusIcon(contract.status)}
                            {getStatusText(contract.status)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Precio Total
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                              {formatCurrency(contract.totalPrice || 0)}{" "}
                              {translatePriceUnit(contract.priceUnit)}
                            </p>
                          </div>

                          <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Precio Actual
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                              {formatCurrency(contract.currentPrice || 0)}{" "}
                              {translatePriceUnit(contract.priceUnit)}
                            </p>
                          </div>

                          <div className="bg-gray-100 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Unidades
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                              {contract.quantity ? contract.quantity : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Total Price Display (when contract is accepted) */}
                        {contract.status === ContractStatus.ACCEPTED &&
                          contract.totalPrice && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Receipt className="h-5 w-5 text-gray-600" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800">
                                      Total a pagar
                                      {isUserCompany(contract.provider)
                                        ? " (incluye IVA)"
                                        : ""}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-700">
                                      {contract.quantity &&
                                      contract.currentPrice
                                        ? `${contract.quantity} x ${formatCurrency(calculatePriceWithTax(contract.currentPrice, 0.19, isUserCompany(contract.provider)))} = ${formatCurrency(contract.quantity * calculatePriceWithTax(contract.currentPrice, 0.19, isUserCompany(contract.provider)), { showCurrency: true })}`
                                        : formatCurrency(contract.totalPrice, {
                                            showCurrency: true,
                                          })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 mb-1">
                                    Método de pago:
                                  </p>
                                  <p className="text-sm font-medium text-gray-700">
                                    {getPaymentMethodText(
                                      contract.paymentMethod || "",
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Layout optimizado: Tu mensaje y Fecha/hora lado a lado */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          {contract.clientMessage && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-500 rounded-lg">
                                  <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800 mb-2">
                                    Tu mensaje:
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {contract.clientMessage}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Fecha y hora solicitadas */}
                          {(contract.requestedDate ||
                            contract.requestedTime) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-gray-500 rounded-lg">
                                  <Clock className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                  Fecha y hora solicitadas:
                                </p>
                              </div>
                              <div className="space-y-2 ml-11">
                                {contract.requestedDate && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">
                                      Fecha:
                                    </span>
                                    <p className="text-sm font-medium text-gray-700">
                                      {new Date(
                                        contract.requestedDate,
                                      ).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                )}
                                {contract.requestedTime && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">
                                      Hora:
                                    </span>
                                    <p className="text-sm font-medium text-gray-700">
                                      {contract.requestedTime}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fecha y hora acordadas */}
                        {(contract.agreedDate || contract.agreedTime) && (
                          <div className="bg-white border border-green-200 rounded-lg p-4 mb-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-green-800">
                                  Fecha y hora acordadas:
                                </p>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-700">
                                {contract.agreedDate && (
                                  <div className="text-right">
                                    <span className="font-medium text-gray-500">
                                      Fecha:
                                    </span>
                                    <p className="font-medium">
                                      {new Date(
                                        contract.agreedDate,
                                      ).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                )}
                                {contract.agreedTime && (
                                  <div className="text-right">
                                    <span className="font-medium text-gray-500">
                                      Hora:
                                    </span>
                                    <p className="font-medium">
                                      {contract.agreedTime}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mensaje del proveedor */}
                        {contract.providerMessage && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-500 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800 mb-2">
                                  Respuesta del proveedor:
                                </p>
                                {contract.propertyType === "virtual" &&
                                contract.providerMessage &&
                                contract.providerMessage.startsWith("http") ? (
                                  <a
                                    href={contract.providerMessage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 underline break-all font-medium transition-colors duration-200"
                                  >
                                    {contract.providerMessage}
                                  </a>
                                ) : (
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {contract.providerMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Acceptance Tokens - Only show when payment is needed */}
                        {shouldShowPaymentButton(contract) &&
                          acceptanceTokens && (
                            <div className="mb-4">
                              <div className="flex gap-3 flex-row items-start mb-3">
                                <input
                                  type="checkbox"
                                  id={`terms-${contract.id}`}
                                  checked={acceptPolicy}
                                  onChange={(e) =>
                                    setAcceptPolicy(e.target.checked)
                                  }
                                  className="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <label
                                  htmlFor={`terms-${contract.id}`}
                                  className="text-sm text-gray-700 cursor-pointer"
                                >
                                  He leído y acepto los{" "}
                                  <a
                                    href={
                                      acceptanceTokens.presigned_acceptance
                                        .permalink
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 underline"
                                  >
                                    Términos y Condiciones
                                  </a>
                                </label>
                              </div>
                              <div className="flex gap-3 flex-row items-start mb-3">
                                <input
                                  type="checkbox"
                                  id={`privacy-${contract.id}`}
                                  checked={acceptPersonal}
                                  onChange={(e) =>
                                    setAcceptPersonal(e.target.checked)
                                  }
                                  className="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <label
                                  htmlFor={`privacy-${contract.id}`}
                                  className="text-sm text-gray-700 cursor-pointer"
                                >
                                  Autorizo el tratamiento de mis datos
                                  personales según la{" "}
                                  <a
                                    href={
                                      acceptanceTokens
                                        .presigned_personal_data_auth.permalink
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-gray-800 underline"
                                  >
                                    Política de Datos Personales
                                  </a>
                                </label>
                              </div>
                              {(!acceptPolicy || !acceptPersonal) && (
                                <div className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                  </svg>
                                  Debes aceptar ambos términos para continuar
                                  con el pago
                                </div>
                              )}
                            </div>
                          )}

                        {contract.bids.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              Ofertas Recibidas (
                              {
                                contract.bids.filter(
                                  (bid) =>
                                    Number(bid.bidder?.id) !== currentUserId,
                                ).length
                              }
                              )
                            </h4>
                            <div className="space-y-3">
                              {contract.bids.map((bid) =>
                                Number(bid.bidder?.id) !== currentUserId ? (
                                  <div
                                    key={bid.id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <DollarSign className="h-4 w-4 text-green-600" />
                                          <span className="font-semibold text-green-700">
                                            ${bid.amount?.toLocaleString()}{" "}
                                            {translatePriceUnit(
                                              contract.priceUnit,
                                            )}
                                          </span>
                                        </div>
                                        {bid.message && (
                                          <p className="text-sm text-gray-600">
                                            {bid.message}
                                          </p>
                                        )}
                                      </div>
                                      {!bid.isAccepted &&
                                        contract.status ===
                                          ContractStatus.NEGOTIATING && (
                                          <button
                                            onClick={() => {
                                              if (
                                                contract.client &&
                                                typeof contract.client.id ===
                                                  "number"
                                              ) {
                                                handleAcceptBid(
                                                  bid.id,
                                                  contract.client.id,
                                                );
                                              } else {
                                                toast.error(
                                                  "No se encontró el cliente para este contrato.",
                                                );
                                              }
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                            Aceptar
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                ) : null,
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 items-center">
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

                          {/* Chat Button - Only for contracted services */}
                          {contract.provider && contract.provider.id && (
                            <button
                              onClick={() => {
                                setSelectedChatRecipient({
                                  id: Number(contract.provider!.id),
                                  name: contract.provider!.name,
                                });
                                setIsChatModalOpen(true);
                              }}
                              className="px-6 py-3 border border-gray-300 bg-white text-black hover:bg-gray-50 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Enviar mensaje
                            </button>
                          )}

                          {/* Cash Payment Advice */}
                          {shouldShowPaymentButton(contract) &&
                            contract.originalPaymentMethod === "efectivo" && (
                              <div className="ml-auto mb-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg max-w-lg">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                                      <span className="text-amber-600 text-sm">
                                        💡
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-amber-800 mb-1">
                                      💰 Consejo para pago en efectivo
                                    </h4>
                                    <p className="text-xs text-amber-700 leading-relaxed mb-2">
                                      Al hacer clic en &quot;Ir a Pagar&quot;,
                                      selecciona{" "}
                                      <strong>
                                        &quot;Paga en efectivo en Corresponsal
                                        Bancario&quot;
                                      </strong>{" "}
                                      en Wompi para completar tu pago de forma
                                      segura.
                                    </p>
                                    <p className="text-xs text-amber-600 font-medium">
                                      📍 Acércate a un Corresponsal Bancario
                                      Bancolombia en las próximas{" "}
                                      <strong>72 horas</strong> con las
                                      instrucciones que recibirás.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Payment Button or Payment Status */}
                          {contract.status === ContractStatus.COMPLETED ? (
                            <div className="flex flex-col gap-3 ml-auto">
                              {/* Solo mostrar el botón de verificación OTP si no ha sido verificado */}
                              {!contract.otpVerified && (
                                <button
                                  onClick={() =>
                                    handleOTPVerification(contract)
                                  }
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                >
                                  <Mail className="h-4 w-4" />
                                  Verificar Servicio (OTP)
                                </button>
                              )}

                              {/* Mostrar mensaje de confirmación si ya fue verificado */}
                              {contract.otpVerified && (
                                <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      ✅ Servicio verificado
                                    </span>
                                  </div>
                                </div>
                              )}

                              {shouldShowPaymentButton(contract) && (
                                <button
                                  onClick={() => handleGoToPayment(contract)}
                                  disabled={!acceptPolicy || !acceptPersonal}
                                  className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2 ${
                                    !acceptPolicy || !acceptPersonal
                                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                                  }`}
                                >
                                  <CreditCard className="h-4 w-4" />
                                  Ir a Pagar{" "}
                                  {formatCurrency(contract.totalPrice, {
                                    showCurrency: true,
                                  })}
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ) : shouldShowPaymentButton(contract) ? (
                            <button
                              onClick={() => handleGoToPayment(contract)}
                              disabled={!acceptPolicy || !acceptPersonal}
                              className={`px-3 py-2 h-fit ml-auto rounded-lg transition-all duration-200 font-medium shadow-sm flex items-center justify-center gap-2 ${
                                !acceptPolicy || !acceptPersonal
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                              }`}
                            >
                              <CreditCard className="h-4 w-4" />
                              Ir a Pagar{" "}
                              {formatCurrency(contract.totalPrice, {
                                showCurrency: true,
                              })}
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          ) : (
                            // Mostrar estado de pago donde estaría el botón
                            (() => {
                              const paymentStatus =
                                contractPaymentStatus[contract.id];

                              // Para contratos ACCEPTED, mostrar mensaje de espera
                              if (contract.status === ContractStatus.ACCEPTED) {
                                return (
                                  <div className="px-4 py-3 ml-auto bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-800">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        ⏳ Esperando que se complete el servicio
                                      </span>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">
                                      Una vez completado, podrás verificar y
                                      proceder con el pago
                                    </p>
                                  </div>
                                );
                              }

                              if (paymentStatus?.hasCompletedPayments) {
                                return (
                                  <div className="px-4 py-3 ml-auto bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-800">
                                      <CheckCircle className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        ✅ Pago completado
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              if (paymentStatus?.hasPendingPayments) {
                                return (
                                  <div className="px-4 py-3 ml-auto bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                      <Clock className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        ⏳ Pago en proceso
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()
                          )}

                          {/* Botón de Cancelación */}
                          {contract.status !== ContractStatus.CANCELLED &&
                            contract.status !== ContractStatus.COMPLETED && (
                              <button
                                onClick={() => handleCancelContract(contract)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 ml-auto"
                              >
                                <XCircle className="h-4 w-4" />
                                Cancelar Contrato
                              </button>
                            )}

                          {/* Cash Payment Info - Now handled through Wompi like other methods */}
                          {/* {contract.status === ContractStatus.ACCEPTED &&
                          contract.paymentMethod === "efectivo" && (
                            <div className="px-4 ml-auto py-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center gap-2 text-amber-800">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  Pago en efectivo:{" "}
                                  {formatCurrency(
                                    contract.totalPrice?.toLocaleString(),
                                  )}{" "}
                                  al momento del servicio
                                </span>
                              </div>
                            </div>
                          )} */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contrataciones como Proveedor */}
          {(activeTab === "provider" || activeTab === "all") && (
            <div>
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
                    Cuando alguien contrate tus servicios, aparecerán aquí para
                    que puedas gestionarlos.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {contracts.asProvider.map((contract) => (
                    <div
                      key={contract.id}
                      className="group relative overflow-hidden bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1"
                    >
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-green-500/10 rounded-full translate-y-12 -translate-x-12"></div>

                      <div className="relative z-10 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {contract.publication?.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>Cliente: {contract.client?.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    contract.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contract.status)} flex items-center gap-1`}
                          >
                            {getStatusIcon(contract.status)}
                            {getStatusText(contract.status)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Precio Total
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-gray-800">
                              {formatCurrency(contract.totalPrice || 0)}{" "}
                              {translatePriceUnit(contract.priceUnit)}
                            </p>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                Precio Actual
                              </span>
                            </div>
                            <p className="text-lg font-semibold text-green-800">
                              {formatCurrency(
                                calculatePriceWithTax(
                                  contract.currentPrice || 0,
                                  0.19,
                                  isUserCompany(contract.provider),
                                ),
                              )}{" "}
                              {translatePriceUnit(contract.priceUnit)}
                            </p>
                          </div>
                        </div>

                        {/* Layout optimizado: Mensaje del cliente y Fecha/hora lado a lado */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          {contract.clientMessage && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-500 rounded-lg">
                                  <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-800 mb-2">
                                    Mensaje del cliente:
                                  </p>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {contract.clientMessage}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Fecha y hora solicitadas */}
                          {(contract.requestedDate ||
                            contract.requestedTime) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-gray-500 rounded-lg">
                                  <Clock className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                  Fecha y hora solicitadas:
                                </p>
                              </div>
                              <div className="space-y-2 ml-11">
                                {contract.requestedDate && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">
                                      Fecha:
                                    </span>
                                    <p className="text-sm font-medium text-gray-700">
                                      {new Date(
                                        contract.requestedDate,
                                      ).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                )}
                                {contract.requestedTime && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500">
                                      Hora:
                                    </span>
                                    <p className="text-sm font-medium text-gray-700">
                                      {contract.requestedTime}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Fecha y hora acordadas */}
                        {(contract.agreedDate || contract.agreedTime) && (
                          <div className="bg-white border border-green-200 rounded-lg p-4 mb-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-lg">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-sm font-semibold text-green-800">
                                  Fecha y hora acordadas:
                                </p>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-gray-700">
                                {contract.agreedDate && (
                                  <div className="text-right">
                                    <span className="font-medium text-gray-500">
                                      Fecha:
                                    </span>
                                    <p className="font-medium">
                                      {new Date(
                                        contract.agreedDate,
                                      ).toLocaleDateString("es-ES", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                )}
                                {contract.agreedTime && (
                                  <div className="text-right">
                                    <span className="font-medium text-gray-500">
                                      Hora:
                                    </span>
                                    <p className="font-medium">
                                      {contract.agreedTime}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Mensaje del proveedor */}
                        {contract.providerMessage && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2 justify-between">
                              <div className="flex gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800 mb-1">
                                    Tu respuesta:
                                  </p>
                                  <p className="text-sm text-blue-700">
                                    {contract.providerMessage}
                                  </p>
                                </div>
                              </div>
                              <button
                                className="ml-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setIsEditProviderMessageModalOpen(true);
                                }}
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        )}

                        {contract.bids.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                              Ofertas Recibidas (
                              {
                                contract.bids.filter(
                                  (bid) =>
                                    Number(bid.bidder?.id) !== currentUserId,
                                ).length
                              }
                              )
                            </h4>
                            <div className="space-y-3">
                              {contract.bids.map((bid) =>
                                Number(bid.bidder?.id) !== currentUserId ? (
                                  <div
                                    key={bid.id}
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <DollarSign className="h-4 w-4 text-green-600" />
                                          <span className="font-semibold text-green-700">
                                            ${bid.amount?.toLocaleString()}{" "}
                                            {translatePriceUnit(
                                              contract.priceUnit,
                                            )}
                                          </span>
                                        </div>
                                        {bid.message && (
                                          <p className="text-sm text-gray-600">
                                            {bid.message}
                                          </p>
                                        )}
                                      </div>
                                      {!bid.isAccepted &&
                                        contract.status ===
                                          ContractStatus.NEGOTIATING && (
                                          <button
                                            onClick={() => {
                                              if (
                                                contract.client &&
                                                typeof contract.client.id ===
                                                  "number"
                                              ) {
                                                handleAcceptBid(
                                                  bid.id,
                                                  contract.client.id,
                                                );
                                              } else {
                                                toast.error(
                                                  "No se encontró el cliente para este contrato.",
                                                );
                                              }
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                            Aceptar
                                          </button>
                                        )}
                                    </div>
                                  </div>
                                ) : null,
                              )}
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

                        {/* Acciones del Proveedor */}
                        {currentUserId && (
                          <div className="mt-4 flex justify-end gap-3">
                            {contract.status === ContractStatus.COMPLETED ? (
                              <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Servicio Completado
                              </div>
                            ) : (
                              <>
                                {canCompleteContract(
                                  contract,
                                  currentUserId,
                                ) && (
                                  <button
                                    onClick={() =>
                                      handleCompleteContract(contract)
                                    }
                                    disabled={isCompleting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    {isCompleting
                                      ? "Completando..."
                                      : "Marcar como Completado"}
                                  </button>
                                )}

                                {contract.status !==
                                  ContractStatus.CANCELLED && (
                                  <button
                                    onClick={() =>
                                      handleCancelContract(contract)
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Cancelar Contrato
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
        {isEditProviderMessageModalOpen && selectedContract && (
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
      </div>
    </>
  );
}
