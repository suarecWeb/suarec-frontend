"use client"

import type React from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { logOut } from "@/actions/log-out"
import Cookies from "js-cookie"
import { LogIn, LogOut, User, ChevronDown, Settings, CreditCard } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"



interface NavbarRoleProps {
  isMobile: boolean
  section: string
  isScrolled?: boolean
}

const handleNoLogin = () => {
  toast.error("Necesitas estar logueado para realizar esta acción.")
}

export const NavbarRole: React.FC<NavbarRoleProps> = ({ isMobile, section, isScrolled = false }: NavbarRoleProps) => {
  const [token, setToken] = useState<string | undefined>(undefined)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const router = useRouter()

  useEffect(() => {
    setToken(Cookies.get("token"))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogOutClick = async () => {
    await logOut()
    router.push('/')
  }

  if (section !== "logIn") {
    return null
  }

  if (token) {
    if (isMobile) {
      return (
        <div className="flex flex-col space-y-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 transition-all duration-300 font-eras-medium"
          >
            <User className="h-5 w-5" />
            <span>Mi Perfil</span>
          </Link>

          <Link
            href="/profile/edit"
            className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 transition-all duration-300 font-eras-medium"
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </Link>

          <Link
            href="/payments/history"
            className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 transition-all duration-300 font-eras-medium"
          >
            <CreditCard className="h-5 w-5" />
            <span>Historial de Pagos</span>
          </Link>

          <button
            onClick={handleLogOutClick}
            className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-300 font-eras-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-eras ${
            isScrolled 
              ? 'text-gray-700 hover:text-[#097EEC]' 
              : 'text-white hover:text-white/90'
          }`}
        >
          <User className="h-4 w-4" />
          <span className="text-sm font-eras-medium">Mi cuenta</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User className="h-4 w-4" />
              <span className="text-sm">Mi Perfil</span>
            </Link>
            
            <Link
              href="/profile/edit"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Configuración</span>
            </Link>
            
            <Link
              href="/payments/history"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Historial de Pagos</span>
            </Link>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                handleLogOutClick()
                setIsDropdownOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-300 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href="/auth/login"
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-eras-medium transition-all duration-300 ${
          isMobile
            ? "py-3 px-4 text-lg justify-center bg-[#097EEC] hover:bg-[#097EEC]/90 text-white shadow-lg"
            : isScrolled
              ? "bg-[#097EEC] text-white hover:bg-[#097EEC]/90 shadow-lg hover:shadow-xl"
              : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
        }
      `}
    >
      <LogIn className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
      <span>Iniciar Sesión</span>
    </Link>
  )
}

