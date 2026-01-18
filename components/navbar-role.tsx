"use client";

import type React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { logOut } from "@/actions/log-out";
import Cookies from "js-cookie";
import {
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Settings,
  CreditCard,
  BarChart3,
  Users,
  UserCheck,
  Handshake,
  FileText,
  Building2,
  Star,
  Ticket,
  Briefcase,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { UserService } from "@/services/UsersService";

interface NavbarRoleProps {
  isMobile: boolean;
  section: string;
  isScrolled?: boolean;
}

const handleNoLogin = () => {
  toast.error("Necesitas estar logueado para realizar esta acción.");
};

export const NavbarRole: React.FC<NavbarRoleProps> = ({
  isMobile,
  section,
  isScrolled = false,
}: NavbarRoleProps) => {
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Función para extraer el nombre del email (parte antes del @)
  const getDisplayName = (email: string | null) => {
    if (!email) return "Mi cuenta";
    const name = email.split("@")[0];
    // Capitalizar la primera letra
    return name;
  };

  // Función para obtener la primera letra del email
  const getInitial = (email: string | null) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const tokenValue = Cookies.get("token");
    setToken(tokenValue);

    if (tokenValue) {
      try {
        const decoded = jwtDecode<TokenPayload>(tokenValue);
        setUserRole(decoded.roles?.[0]?.name || null); // Tomar el nombre del primer rol
        setUserName(decoded.email || null); // Obtener el email del usuario

        // Fetch full user profile to get the image
        UserService.getUserById(decoded.id)
          .then((response) => {
            if (response.data && response.data.profile_image) {
              setUserImage(response.data.profile_image);
            }
          })
          .catch((error) => {
            console.error("Error fetching user profile for navbar:", error);
          });
      } catch (error) {
        console.error("Error al decodificar token:", error);
        setUserRole(null);
        setUserName(null);
        setUserImage(null);
      }
    }
  }, []);
  const { isAuthenticated, user, userRoles } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogOutClick = async () => {
    await logOut();
    router.push("/");
  };

  if (section !== "logIn") {
    return null;
  }

  if (isAuthenticated) {
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

          <button
            onClick={handleLogOutClick}
            className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-300 font-eras-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      );
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-eras ${
            isScrolled
              ? "text-gray-700 hover:text-[#097EEC]"
              : "text-white hover:text-white/90"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isScrolled ? "bg-[#097EEC] text-white" : "bg-white text-[#097EEC]"
            }`}
          >
            {userImage ? (
              <img
                src={userImage}
                alt={getDisplayName(userName)}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitial(userName)
            )}
          </div>
          <span className="text-sm font-eras-medium truncate max-w-32">
            {getDisplayName(userName)}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transition-all duration-300 ease-out transform ${
            isDropdownOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            onClick={() => setIsDropdownOpen(false)}
          >
            <User className="h-4 w-4" />
            <span className="text-sm">Mi Perfil</span>
          </Link>

          {(userRole === "PERSON" || userRole === "ADMIN") && (
            <Link
              href="/my-applications"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <UserCheck className="h-4 w-4" />
              <span className="text-sm">Mis aplicaciones</span>
            </Link>
          )}

          {(userRole === "BUSINESS" || userRole === "ADMIN") && (
            <Link
              href="/companies"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Compañías</span>
            </Link>
          )}

          {(userRole === "BUSINESS" || userRole === "ADMIN") && (
            <Link
              href="/contracts"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Handshake className="h-4 w-4" />
              <span className="text-sm">Contrataciones</span>
            </Link>
          )}

          {/* Aplicaciones - Para ADMIN */}
          {userRoles.includes("ADMIN") && (
            <Link
              href="/applications"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">Aplicaciones</span>
            </Link>
          )}

          <Link
            href="/stats"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            onClick={() => setIsDropdownOpen(false)}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm">Mis Estadísticas</span>
          </Link>

          {userRoles.includes("ADMIN") ? (
            <Link
              href="/payments"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Pagos</span>
            </Link>
          ) : (
            <Link
              href="/payments/history"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Historial de Pagos</span>
            </Link>
          )}

          {/* Calificaciones */}
          <Link
            href="/ratings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Star className="h-4 w-4" />
            <span className="text-sm">Calificaciones</span>
          </Link>

          {/* Tickets de soporte - Solo para ADMIN */}
          {userRoles.includes("ADMIN") && (
            <Link
              href="/admin/tickets"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Tickets de soporte</span>
            </Link>
          )}

          <Link
            href="/profile/edit"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Configuración</span>
          </Link>

          <div className="border-t border-gray-100 my-1"></div>

          <button
            onClick={() => {
              handleLogOutClick();
              setIsDropdownOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-300 w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </div>
    );
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
  );
};
