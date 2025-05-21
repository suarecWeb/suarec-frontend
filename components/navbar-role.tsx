"use client"

import type React from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { logOut } from "@/actions/log-out"
import Cookies from "js-cookie"
import { LogIn, LogOut, User } from "lucide-react"

interface NavbarRoleProps {
  isMobile: boolean
  section: string
}

const handleNoLogin = () => {
  toast.error("Necesitas estar logueado para realizar esta acción.")
}

export const NavbarRole: React.FC<NavbarRoleProps> = ({ isMobile, section }: NavbarRoleProps) => {
  const token = Cookies.get("token")

  const handleLogOutClick = () => {
    logOut()
  }

  if (section !== "logIn") {
    return null
  }

  if (token) {
    return (
      <div className={`flex ${isMobile ? "flex-col space-y-3" : "items-center space-x-3"}`}>
        <Link
          href="/profile"
          className={`
            flex items-center gap-1.5 
            ${
              isMobile
                ? "py-2.5 px-4 text-lg justify-center rounded-md bg-white/10 hover:bg-white/20"
                : "text-sm font-medium hover:text-white/90"
            } 
            transition-colors
          `}
        >
          <User className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
          <span>Perfil</span>
        </Link>

        <Link
          href="/auth/login"
          onClick={handleLogOutClick}
          className={`
            flex items-center gap-1.5 
            ${
              isMobile
                ? "py-2.5 px-4 text-lg justify-center rounded-md bg-white/10 hover:bg-white/20"
                : "text-sm font-medium hover:text-white/90"
            } 
            transition-colors
          `}
        >
          <LogOut className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
          <span>Log Out</span>
        </Link>
      </div>
    )
  }

  return (
    <Link
      href="/auth/login"
      className={`
        flex items-center gap-1.5 
        ${
          isMobile
            ? "py-2.5 px-4 text-lg justify-center rounded-md bg-white/10 hover:bg-white/20"
            : "px-3 py-1.5 text-sm font-medium rounded-md bg-white/10 hover:bg-white/20"
        } 
        transition-colors
      `}
    >
      <LogIn className={`${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
      <span>Iniciar Sesión</span>
    </Link>
  )
}

