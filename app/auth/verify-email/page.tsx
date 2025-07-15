// app/auth/verify-email/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmailVerificationService from "@/services/EmailVerificationService";
import {
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Check,
} from "lucide-react";
import Link from "next/link";

// Configuración para evitar prerenderización estática
export const dynamic = 'force-dynamic';

const EmailVerificationContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'registered' | null>(null);
  const [message, setMessage] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>(email || "");

  const verifyEmailToken = useCallback(async (verificationToken: string) => {
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
      setMessage(error.response?.data?.message || "Error al verificar el correo electrónico. Inténtalo de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else if (email) {
      // Si hay email pero no token, significa que viene del registro
      setVerificationStatus('registered');
      setUserEmail(email);
    }
  }, [token, email, verifyEmailToken]);

  const handleResendEmail = async () => {
    if (!userEmail.trim()) {
      setMessage("Por favor ingresa tu correo electrónico para reenviar la verificación.");
      return;
    }

    setIsResending(true);
    try {
      await EmailVerificationService.resendVerificationEmail(userEmail.toLowerCase());
      setMessage("Correo de verificación reenviado. Revisa tu bandeja de entrada.");
      setVerificationStatus('registered');
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error al reenviar el correo electrónico.");
      setVerificationStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  const renderVerificationContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center py-8 lg:py-12">
          <div className="bg-blue-50 inline-flex rounded-full p-6 mb-6 lg:mb-8">
            <Loader2 className="h-12 w-12 lg:h-16 lg:w-16 text-[#097EEC] animate-spin" />
          </div>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Verificando tu correo electrónico...</h2>
          <p className="text-gray-600 text-lg">Por favor espera mientras verificamos tu dirección de correo electrónico.</p>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center py-8 lg:py-12">
          <div className="bg-green-50 inline-flex rounded-full p-6 mb-6 lg:mb-8">
            <CheckCircle className="h-12 w-12 lg:h-16 lg:w-16 text-green-500" />
          </div>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">¡Correo electrónico verificado exitosamente!</h2>
          <p className="text-gray-600 mb-6 lg:mb-8 text-lg">{message}</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8 max-w-2xl mx-auto">
            <p className="text-green-800 text-base lg:text-lg">
              Tu cuenta ha sido verificada. Serás redirigido al login en unos segundos...
            </p>
          </div>
          <Link href="/auth/login">
            <button className="bg-[#097EEC] text-white px-6 py-3 lg:px-8 lg:py-4 rounded-lg hover:bg-[#0A6BC7] transition-colors text-base lg:text-lg font-medium">
              Ir al inicio de sesión
            </button>
          </Link>
        </div>
      );
    }

    if (verificationStatus === 'registered') {
      return (
        <div className="text-center py-8 lg:py-12">
          <div className="bg-blue-50 inline-flex rounded-full p-6 mb-6 lg:mb-8">
            <Mail className="h-12 w-12 lg:h-16 lg:w-16 text-[#097EEC]" />
          </div>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">¡Cuenta creada exitosamente!</h2>
          <p className="text-gray-600 mb-6 lg:mb-8 text-lg">
            Hemos enviado un email de verificación a <strong>{userEmail}</strong>
          </p>
          
          <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto space-y-6 lg:space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 lg:p-8">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">¿Qué hacer ahora?</h3>
              <div className="space-y-4 lg:space-y-5 text-left">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#097EEC] text-white rounded-full p-1 mt-0.5 lg:p-1.5">
                    <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-700">Revisa tu bandeja de entrada</p>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#097EEC] text-white rounded-full p-1 mt-0.5 lg:p-1.5">
                    <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-700">Busca un email de &quot;Suarec&quot;</p>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="bg-[#097EEC] text-white rounded-full p-1 mt-0.5 lg:p-1.5">
                    <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                  </div>
                  <p className="text-sm lg:text-base text-gray-700">Haz clic en el enlace de verificación</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <p className="text-sm lg:text-base text-gray-500">
                ¿No recibiste el email? Revisa tu carpeta de correo no deseado o solicita un nuevo enlace.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 lg:p-8 max-w-2xl lg:max-w-3xl mx-auto">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">¿Necesitas un nuevo enlace?</h3>
                <div className="space-y-4 lg:space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                      Tu correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="ingresa@tuemail.com"
                      className="w-full px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-base"
                    />
                  </div>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-[#097EEC] text-white px-4 py-3 lg:px-6 lg:py-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-base lg:text-lg font-medium"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5" />
                        Reenviar verificación
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 lg:pt-6">
                <Link href="/auth/login">
                  <button className="text-[#097EEC] hover:underline text-base lg:text-lg">
                    ¿Ya verificaste tu correo electrónico? Ir al inicio
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center py-8 lg:py-12">
          <div className="bg-red-50 inline-flex rounded-full p-6 mb-6 lg:mb-8">
            <XCircle className="h-12 w-12 lg:h-16 lg:w-16 text-red-500" />
          </div>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Error en la verificación</h2>
          <p className="text-red-600 mb-6 lg:mb-8 text-lg">{message}</p>
          
          {/* Formulario para reenviar email */}
          <div className="bg-gray-50 rounded-lg p-6 lg:p-8 max-w-2xl lg:max-w-3xl mx-auto">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">¿Necesitas un nuevo enlace?</h3>
            <div className="space-y-4 lg:space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                  Tu correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="ingresa@tuemail.com"
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-base"
                />
              </div>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-[#097EEC] text-white px-4 py-3 lg:px-6 lg:py-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-base lg:text-lg font-medium"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5" />
                    Reenviar verificación
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Estado por defecto (sin token ni email)
    return (
      <div className="text-center py-8 lg:py-12">
        <div className="bg-yellow-50 inline-flex rounded-full p-6 mb-6 lg:mb-8">
          <Mail className="h-12 w-12 lg:h-16 lg:w-16 text-yellow-500" />
        </div>
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Verificación de correo electrónico</h2>
        <p className="text-gray-600 mb-6 lg:mb-8 text-lg">
          Para verificar tu correo electrónico, necesitas hacer clic en el enlace que enviamos a tu bandeja de entrada.
        </p>
        
        {/* Formulario para reenviar correo electrónico */}
        <div className="bg-gray-50 rounded-lg p-6 lg:p-8 max-w-2xl lg:max-w-3xl mx-auto">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">¿No recibiste el correo electrónico?</h3>
          <div className="space-y-4 lg:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm lg:text-base font-medium text-gray-700 mb-2 lg:mb-3">
                Tu correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="ingresa@tuemail.com"
                className="w-full px-4 py-3 lg:px-5 lg:py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-base"
              />
            </div>
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full bg-[#097EEC] text-white px-4 py-3 lg:px-6 lg:py-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-base lg:text-lg font-medium"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 lg:h-5 lg:w-5" />
                  Reenviar verificación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderVerificationContent()}
      
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-[#097EEC] transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

const EmailVerificationPage = () => {
  return (
    <Suspense fallback={
      <div className="text-center py-8 lg:py-12">
        <div className="bg-blue-50 inline-flex rounded-full p-6 mb-6 lg:mb-8">
          <Loader2 className="h-12 w-12 lg:h-16 lg:w-16 text-[#097EEC] animate-spin" />
        </div>
        <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">Cargando...</h2>
        <p className="text-gray-600 text-lg">Por favor espera mientras cargamos la página.</p>
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  );
};

export default EmailVerificationPage;