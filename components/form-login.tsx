"use client"
import AuthService from "@/services/AuthService"
import type React from "react"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Cookies from "js-cookie"
import Link from "next/link"
import { AlertCircle, CheckCircle, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"

const FormLogin = () => {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si viene de la verificación de email o token expirado
  useEffect(() => {
    const verified = searchParams.get("verified")
    const expired = searchParams.get("expired")
    
    if (verified === "true") {
      setSuccess("¡Correo electrónico verificado exitosamente! Ya puedes iniciar sesión.")
    }
    
    if (expired === "true") {
      setError("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
    }
  }, [searchParams])

  const handleGoogleSubmit = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/suarec/auth/google/callback`
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    const values = {
      email: event.currentTarget.email.value.toLowerCase(),
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
          router.push("/feed")
        }, 1000)
      } catch (err: any) {
        // Verificar si es un error de email no verificado
        const errorMessage = err.response?.data?.message || "";
        
        if (errorMessage.toLowerCase().includes("verify your email") || 
            errorMessage.toLowerCase().includes("verificar") ||
            errorMessage.toLowerCase().includes("verification")) {

          setError("Tu correo electrónico no ha sido verificado. Por favor, verifica tu correo electrónico antes de iniciar sesión.")

          // Redirigir a la página de verificación después de 3 segundos
          setTimeout(() => {
            router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`)
          }, 3000)
        } else {
          // Error genérico de credenciales
          setError("Email o contraseña incorrectos. Por favor, verifica tus credenciales.")
        }
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
          <Link href="/auth/forgot" className="text-sm text-[#097EEC] hover:text-[#082D50] transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
            disabled={isPending}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isPending}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className={`px-4 py-3 rounded-lg flex items-center gap-2 text-sm ${
          error.includes("no ha sido verificado") 
            ? "bg-blue-50 text-blue-700 border border-blue-200" 
            : "bg-red-50 text-red-700"
        }`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <span className="block">{error}</span>
            {error.includes("no ha sido verificado") && (
              <span className="block text-xs mt-1 opacity-80">
                Serás redirigido a la página de verificación en unos segundos...
              </span>
            )}
          </div>
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

