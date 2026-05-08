"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthService from "@/services/AuthService";
import Link from "next/link";
import {
  Mail,
  KeyRound,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Paso 1: Enviar código al correo
  const handleSendCode = async () => {
    if (!email) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);
    try {
      toast.loading("📧 Enviando código de verificación...", {
        id: "sendCode",
      });

      const response = await AuthService.sendPasswordResetCode(email);

      if (response.status === 200 || response.status === 201) {
        toast.success("✅ Código enviado a tu correo", { id: "sendCode" });
        setStep("code");
      } else {
        toast.error("❌ No se pudo enviar el código", { id: "sendCode" });
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast.error("❌ Este correo no está registrado", { id: "sendCode" });
      } else if (err.response?.data?.message) {
        toast.error(`❌ ${err.response.data.message}`, { id: "sendCode" });
      } else {
        toast.error("❌ Error al enviar el código. Intenta nuevamente", {
          id: "sendCode",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Ingresa el código de 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      toast.loading("🔍 Verificando código...", { id: "verifyCode" });

      const response = await AuthService.verifyPasswordResetCode(
        email,
        verificationCode,
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("✅ Código verificado correctamente", {
          id: "verifyCode",
        });
        setStep("password");
      } else {
        toast.error("❌ Código inválido", { id: "verifyCode" });
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error("❌ Código inválido o expirado", { id: "verifyCode" });
      } else if (err.response?.data?.message) {
        toast.error(`❌ ${err.response.data.message}`, { id: "verifyCode" });
      } else {
        toast.error("❌ Error al verificar el código", { id: "verifyCode" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Cambiar contraseña
  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      toast.loading("🔄 Cambiando contraseña...", { id: "changePassword" });

      const response = await AuthService.resetPasswordWithCode(
        email,
        verificationCode,
        passwordData.newPassword,
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("✅ Contraseña cambiada exitosamente", {
          id: "changePassword",
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        toast.error("❌ No se pudo cambiar la contraseña", {
          id: "changePassword",
        });
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        toast.error("❌ El código ha expirado. Solicita uno nuevo", {
          id: "changePassword",
        });
        setStep("email");
      } else if (err.response?.data?.message) {
        toast.error(`❌ ${err.response.data.message}`, {
          id: "changePassword",
        });
      } else {
        toast.error("❌ Error al cambiar la contraseña", {
          id: "changePassword",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "code") {
      setStep("email");
      setVerificationCode("");
    } else if (step === "password") {
      setStep("code");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Recuperar contraseña
        </h1>
        <p className="text-gray-500">
          {step === "email" &&
            "Ingresa tu correo electrónico para recibir un código de verificación"}
          {step === "code" &&
            "Ingresa el código de 6 dígitos que enviamos a tu correo"}
          {step === "password" && "Ingresa tu nueva contraseña"}
        </p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === "email"
              ? "bg-[#097EEC] text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {step === "email" ? "1" : <CheckCircle className="h-4 w-4" />}
        </div>
        <div
          className={`w-12 h-1 ${step !== "email" ? "bg-green-500" : "bg-gray-200"}`}
        />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === "code"
              ? "bg-[#097EEC] text-white"
              : step === "password"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-500"
          }`}
        >
          {step === "password" ? <CheckCircle className="h-4 w-4" /> : "2"}
        </div>
        <div
          className={`w-12 h-1 ${step === "password" ? "bg-green-500" : "bg-gray-200"}`}
        />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === "password"
              ? "bg-[#097EEC] text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          3
        </div>
      </div>

      <div className="space-y-4">
        {/* Paso 1: Email */}
        {step === "email" && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  placeholder="tucorreo@ejemplo.com"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              className="w-full bg-[#097EEC] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Enviar código</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="font-medium text-[#097EEC] hover:text-[#0A6BC7] text-sm"
              >
                Volver al login
              </Link>
            </div>
          </>
        )}

        {/* Paso 2: Código de verificación */}
        {step === "code" && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                Código de verificación
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-center text-lg tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Enviamos un código de 6 dígitos a{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Atrás</span>
              </button>
              <button
                type="button"
                onClick={handleVerifyCode}
                className="flex-1 bg-[#097EEC] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Verificar código</span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              className="w-full text-sm text-[#097EEC] hover:underline"
              disabled={loading}
            >
              ¿No recibiste el código? Reenviar
            </button>
          </>
        )}

        {/* Paso 3: Nueva contraseña */}
        {step === "password" && (
          <>
            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  placeholder="Repite la nueva contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Atrás</span>
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="flex-1 bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Cambiando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Cambiar contraseña</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
