"use client"
import AuthService from "@/services/AuthService"
import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import Link from "next/link"
import { AlertCircle, CheckCircle, ArrowLeft, Loader2 } from "lucide-react"

const FormLogin = () => {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleGoogleSubmit = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google/callback`
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const values = {
      email: event.currentTarget.email.value,
      password: event.currentTarget.password.value,
    }

    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const res = await AuthService.login({
          email: values.email,
          password: values.password,
        })

        if (res.data.token === undefined || res.data.token === null) {
          setError("Error iniciando sesión")
          return
        }

        Cookies.set("token", res.data.token)
        Cookies.set("email", res.data.email)
        Cookies.set("role", res.data.roles[0].name)

        setSuccess("Inicio de sesión exitoso")

        // Pequeña pausa para mostrar el mensaje de éxito
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } catch (err) {
        setError("Error al iniciar sesión. Verifica tus credenciales.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="ejemplo@correo.com"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
            disabled={isPending}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <Link href="/auth/checkEmail" className="text-sm text-[#097EEC] hover:text-[#082D50] transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
            disabled={isPending}
            required
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="pt-2 space-y-3">
        <button
          type="submit"
          className="w-full bg-[#097EEC] text-white font-medium py-3 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex justify-center items-center"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>

        <button
          type="button"
          className="w-full bg-transparent text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex justify-center items-center"
          disabled={isPending}
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al inicio
        </button>
      </div>

      {/* Código comentado para OAuth
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">O continúa con</span>
        </div>
      </div>

      <button
        type="button"
        className="w-full bg-white text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex justify-center items-center"
        onClick={handleGoogleSubmit}
        disabled={isPending}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Continuar con Google
      </button>
      */}
    </form>
  )
}

export default FormLogin

