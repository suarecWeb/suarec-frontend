"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthService from "@/services/AuthService";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }

    startTransition(async () => {
      try {
        await AuthService.forgotPassword(email);
        toast.success("Se ha enviado un enlace de recuperación a tu email");
        router.push("/auth/check-email");
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast.error("No se encontró una cuenta con este email");
        } else {
          toast.error("Error al enviar el email de recuperación");
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          Recuperar contraseña
        </h1>
        <p className="text-gray-500">
          Ingresa tu email y te enviaremos un enlace para restablecer tu
          contraseña
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors"
            placeholder="tu@email.com"
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#097EEC] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-[#097EEC] hover:text-[#0A6BC7] text-sm"
          >
            Volver al login
          </Link>
        </div>
      </form>
    </div>
  );
}
