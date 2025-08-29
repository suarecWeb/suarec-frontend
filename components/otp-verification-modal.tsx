"use client";

import { useState, useEffect } from "react";
import { CheckCircle, RefreshCw, Mail } from "lucide-react";
import { ContractService } from "../services/ContractService";
import toast from "react-hot-toast";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  serviceTitle: string;
  providerName: string;
  onOTPVerified: () => void;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  contractId,
  serviceTitle,
  providerName,
  onOTPVerified,
}: OTPVerificationModalProps) {
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setOtpGenerated(true);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const generateOTP = async () => {
    setIsGenerating(true);
    try {
      await ContractService.generateOTP(contractId);
      setOtpGenerated(true);
      toast.success("Código OTP generado y enviado a tu email");
    } catch (error) {
      toast.error("Error al generar el código OTP");
    } finally {
      setIsGenerating(false);
    }
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Por favor ingresa un código OTP válido de 6 dígitos");
      return;
    }

    setIsVerifying(true);
    try {
      const result = await ContractService.verifyOTP(contractId, otpCode);
      if (result.isValid) {
        toast.success("OTP verificado correctamente");
        onOTPVerified();
        onClose();
      } else {
        toast.error(result.message || "Código OTP inválido");
      }
    } catch (error) {
      toast.error("Error al verificar el código OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    try {
      await ContractService.resendOTP(contractId);
      toast.success("Nuevo código OTP generado y enviado a tu email");
    } catch (error) {
      toast.error("Error al reenviar el código OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(value);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8 text-center relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Verificación OTP
            </h3>
            <p className="text-sm text-gray-600">
              Confirma que el servicio se completó satisfactoriamente
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Servicio:</strong> {serviceTitle}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Proveedor:</strong> {providerName}
            </p>
          </div>

          <p className="text-gray-700 mb-4">
            El proveedor ha marcado este servicio como completado. Para
            confirmar que el servicio se realizó satisfactoriamente y proceder
            con el pago, primero genera un código OTP haciendo clic en
            &quot;Reenviar Código&quot; y luego ingresa el código que recibirás
            por email.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código OTP (6 dígitos)
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={handleInputChange}
              placeholder="000000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
              disabled={isVerifying}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Este código expira en 24 horas. Verifica tu email.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={verifyOTP}
            disabled={isVerifying || otpCode.length !== 6}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verificando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Verificar OTP
              </>
            )}
          </button>

          <button
            onClick={resendOTP}
            disabled={isResending}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                Reenviando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Generar Código OTP
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
