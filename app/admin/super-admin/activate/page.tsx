"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthService from "@/services/AuthService";
import Cookies from "js-cookie";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "loading" | "success" | "error" | "missing";

function SuperAdminActivateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("missing");
      return;
    }

    AuthService.activateSuperAdmin(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMsg(
          err?.response?.data?.message || "El enlace es inválido o ya expiró.",
        );
        setStatus("error");
      });
  }, []);

  const handleContinue = async () => {
    // Limpiar sesión para forzar re-login con el nuevo JWT que incluye isSuperAdmin: true
    try {
      await AuthService.logout();
    } catch {
      // ignorar error de logout
    }
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full flex flex-col items-center gap-6 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-[#097EEC] animate-spin" />
            <p className="text-gray-600 font-jakarta">
              Activando super admin...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-purple-100 p-4 rounded-full">
              <Shield className="h-12 w-12 text-purple-600" />
            </div>
            <CheckCircle className="h-6 w-6 text-green-500 -mt-4" />
            <h1 className="text-xl font-eras-bold text-gray-800">
              ¡Eres Super Admin!
            </h1>
            <p className="text-sm text-gray-500 font-jakarta">
              Tu cuenta ha sido activada como super administrador. Vuelve a
              iniciar sesión para que los cambios surtan efecto.
            </p>
            <button
              onClick={handleContinue}
              className="w-full bg-[#097EEC] hover:bg-[#0A6BC7] text-white font-jakarta font-semibold py-3 rounded-xl transition-colors"
            >
              Iniciar sesión e ir al panel de admin
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-100 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-xl font-eras-bold text-gray-800">
              Enlace inválido
            </h1>
            <p className="text-sm text-gray-500 font-jakarta">{errorMsg}</p>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-gray-300 text-gray-700 font-jakarta font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}

        {status === "missing" && (
          <>
            <div className="bg-amber-100 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-amber-500" />
            </div>
            <h1 className="text-xl font-eras-bold text-gray-800">
              Token no encontrado
            </h1>
            <p className="text-sm text-gray-500 font-jakarta">
              Usa el enlace que recibiste en tu correo.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-gray-300 text-gray-700 font-jakarta font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-12 w-12 text-[#097EEC] animate-spin" />
        </div>
      }
    >
      <SuperAdminActivateContent />
    </Suspense>
  );
}
