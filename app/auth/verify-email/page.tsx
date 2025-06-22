// app/auth/verify-email/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import EmailVerificationService from "@/services/EmailVerificationService";
import {
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const EmailVerificationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await EmailVerificationService.verifyEmail(verificationToken);
      
      if (response.data.success) {
        setVerificationStatus('success');
        setMessage(response.data.message);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.message || "Error al verificar el email. Inténtalo de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setMessage("Por favor ingresa tu email para reenviar la verificación.");
      return;
    }

    setIsResending(true);
    try {
      await EmailVerificationService.resendVerificationEmail(email);
      setMessage("Email de verificación reenviado. Revisa tu bandeja de entrada.");
      setVerificationStatus('pending');
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error al reenviar el email.");
      setVerificationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const renderVerificationContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center py-12">
          <div className="bg-blue-50 inline-flex rounded-full p-6 mb-6">
            <Loader2 className="h-12 w-12 text-[#097EEC] animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verificando tu email...</h2>
          <p className="text-gray-600">Por favor espera mientras verificamos tu dirección de email.</p>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center py-12">
          <div className="bg-green-50 inline-flex rounded-full p-6 mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Email verificado exitosamente!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              Tu cuenta ha sido verificada. Serás redirigido al login en unos segundos...
            </p>
          </div>
          <Link href="/auth/login">
            <button className="bg-[#097EEC] text-white px-6 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors">
              Ir al Login
            </button>
          </Link>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center py-12">
          <div className="bg-red-50 inline-flex rounded-full p-6 mb-6">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error en la verificación</h2>
          <p className="text-red-600 mb-6">{message}</p>
          
          {/* Formulario para reenviar email */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas un nuevo enlace?</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Tu email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ingresa@tuemail.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                />
              </div>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Reenviar verificación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Estado por defecto (sin token)
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 inline-flex rounded-full p-6 mb-6">
          <Mail className="h-12 w-12 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verificación de Email</h2>
        <p className="text-gray-600 mb-6">
          Para verificar tu email, necesitas hacer clic en el enlace que enviamos a tu correo.
        </p>
        
        {/* Formulario para reenviar email */}
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿No recibiste el email?</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Tu email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ingresa@tuemail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
              />
            </div>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Reenviar verificación
                </>
              )}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-lg max-w-md mx-auto ${
            verificationStatus !== 'pending'  && verificationStatus!=='error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{message}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
        {/* Content */}
          <div className="bg-white rounded-lg shadow-lg">
            {/* Back button */}
            <div className="p-6 border-b border-gray-200">
              <Link href="/auth/login" className="inline-flex items-center text-gray-600 hover:text-[#097EEC] transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al login
              </Link>
            </div>

            {/* Main content */}
            <div className="p-6">
              {renderVerificationContent()}
            </div>

            {/* Help section */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Si continúas teniendo problemas con la verificación, puedes contactarnos.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/contact" className="text-[#097EEC] hover:text-[#0A6BC7] text-sm font-medium">
                    Contactar soporte
                  </Link>
                  <Link href="/auth/register" className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Crear nueva cuenta
                  </Link>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};

export default EmailVerificationPage;