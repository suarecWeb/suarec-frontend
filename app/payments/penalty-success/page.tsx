"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import Navbar from "../../../components/navbar";
import { ContractService } from "../../../services/ContractService";
import toast from "react-hot-toast";

export default function PenaltySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [contractId, setContractId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const contractIdParam = searchParams.get("contract_id");
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");

    if (!contractIdParam) {
      setError("No se encontró el ID del contrato");
      setIsProcessing(false);
      return;
    }

    setContractId(contractIdParam);

    // Verificar el estado del pago
    if (status === "success" || status === "completed") {
      // Procesar la cancelación del contrato
      processContractCancellation(contractIdParam);
    } else {
      setError("El pago no se completó correctamente");
      setIsProcessing(false);
    }
  }, [searchParams]);

  const processContractCancellation = async (contractId: string) => {
    try {
      // Aquí se debería verificar que el pago esté confirmado en el backend
      // Por ahora, asumimos que el pago fue exitoso

      // Cancelar el contrato
      await ContractService.cancelContract(contractId);

      toast.success("Contrato cancelado exitosamente");
      setIsProcessing(false);
    } catch (error) {
      console.error("Error canceling contract:", error);
      setError("Error al cancelar el contrato. Por favor, contacta soporte.");
      setIsProcessing(false);
    }
  };

  const handleGoToContracts = () => {
    router.push("/contracts");
  };

  const handleGoToHome = () => {
    router.push("/");
  };

  if (error) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Error en el Proceso
                </h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleGoToContracts}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Ir a Contratos
                  </button>
                  <button
                    onClick={handleGoToHome}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Ir al Inicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isProcessing) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pt-24">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Procesando Cancelación
                </h1>
                <p className="text-gray-600 mb-6">
                  Estamos procesando tu pago de penalización y cancelando el
                  contrato...
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-blue-800 mb-2">
                    Proceso en curso:
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ Pago de penalización confirmado</li>
                    <li>⏳ Cancelando contrato...</li>
                    <li>⏳ Actualizando estado...</li>
                  </ul>
                </div>
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
      <div className="bg-gray-50 min-h-screen pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                Penalización Pagada Exitosamente
              </h1>
              <p className="text-gray-600 mb-6">
                Has pagado la penalización de $10,000 pesos colombianos y tu
                contrato ha sido cancelado.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-green-800 mb-2">
                  Resumen de la transacción:
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Pago de penalización: $10,000 COP</li>
                  <li>✅ Contrato cancelado exitosamente</li>
                  <li>✅ Proceso completado</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-medium text-amber-800 mb-1">
                      Importante:
                    </h4>
                    <p className="text-sm text-amber-700">
                      La cancelación del contrato es permanente y no se puede
                      deshacer. El proveedor ha sido notificado de la
                      cancelación.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleGoToContracts}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ver Mis Contratos
                </button>
                <button
                  onClick={handleGoToHome}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Ir al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
