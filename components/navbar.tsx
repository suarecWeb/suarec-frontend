"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchBar from "./utils/searchBar";
import { NavbarRole } from "./navbar-role";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Menu,
  X,
  ChevronDown,
  Users,
  FileText,
  Building2,
  Briefcase,
  UserCheck,
  Clock,
  MessageSquare,
  Bell,
  Search,
  Home,
  TrendingUp,
  Handshake,
  CreditCard,
  Star,
  BarChart3,
} from "lucide-react";
import NotificationBadge from "./notification-badge";
import SuarecLogo from "./logo";

interface TokenPayload {
  roles?: { name: string }[];
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  const updateUserRoles = () => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<TokenPayload>(token);
        const roles = decodedToken.roles?.map((role) => role.name) || [];
        setUserRoles(roles);
      } catch (error) {
        console.error("Error al decodificar token:", error);
        setUserRoles([]);
      }
    } else {
      setUserRoles([]);
    }
  };

  useEffect(() => {
    updateUserRoles();

    // Escuchar cambios en el estado de autenticación
    const handleAuthChange = () => {
      updateUserRoles();
    };

    window.addEventListener("authStateChanged", handleAuthChange);

    // Detectar scroll para cambiar el estilo de la navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Efecto para controlar el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restaurar scroll del body
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup cuando el componente se desmonta
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isMenuOpen]);

  const hasRole = (roles: string[]): boolean => {
    return roles.some((role) => userRoles.includes(role));
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-[#097EEC]"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className={`transition-all duration-300 hover:scale-105 ${
                isScrolled ? "text-[#097EEC]" : "text-white"
              }`}
            >
              <SuarecLogo className="w-24 sm:w-28 md:w-32" />
            </Link>

            {/* Desktop Navigation - Oculto para ADMIN */}
            <div
              className={`lg:items-center lg:space-x-2 ${hasRole(["ADMIN"]) ? "hidden" : "hidden lg:flex"}`}
            >
              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                {hasRole(["ADMIN"]) && (
                  <NavLink
                    href="/users"
                    icon={<Users className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Usuarios
                  </NavLink>
                )}

                {hasRole(["ADMIN", "BUSINESS", "PERSON"]) && (
                  <NavLink
                    href="/feed"
                    icon={<TrendingUp className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Publicaciones
                  </NavLink>
                )}

                {hasRole(["ADMIN", "PERSON"]) && (
                  <NavLink
                    href="/companies"
                    icon={<Building2 className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Compañías
                  </NavLink>
                )}

                {hasRole(["BUSINESS", "ADMIN"]) && (
                  <NotificationBadge userRoles={userRoles}>
                    <NavLink
                      href="/applications"
                      icon={<Briefcase className="h-4 w-4" />}
                      isScrolled={isScrolled}
                    >
                      Aplicaciones
                    </NavLink>
                  </NotificationBadge>
                )}

                {hasRole(["BUSINESS", "ADMIN"]) && (
                  <NavLink
                    href="/my-employees"
                    icon={<Users className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Mis empleados
                  </NavLink>
                )}

                {hasRole(["PERSON", "BUSINESS", "ADMIN"]) && (
                  <NavLink
                    href="/chat"
                    icon={<MessageSquare className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Mensajes
                  </NavLink>
                )}

                {hasRole(["PERSON", "ADMIN"]) && (
                  <NavLink
                    href="/contracts"
                    icon={<Handshake className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Contrataciones
                  </NavLink>
                )}

                {/* Enlaces de pagos según el rol */}
                {hasRole(["ADMIN"]) && (
                  <NavLink
                    href="/payments"
                    icon={<CreditCard className="h-4 w-4" />}
                    isScrolled={isScrolled}
                  >
                    Pagos
                  </NavLink>
                )}

                {/* User Menu */}
                <div className="ml-4 pl-4 border-l border-white/20">
                  <NavbarRole
                    isMobile={false}
                    section="logIn"
                    isScrolled={isScrolled}
                  />
                </div>
              </div>
            </div>

            {/* Mobile menu button - Siempre visible para ADMIN */}
            <button
              className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 hover:bg-opacity-20 ${
                hasRole(["ADMIN"]) ? "" : "lg:hidden"
              } ${
                isScrolled
                  ? "text-[#097EEC] hover:bg-[#097EEC]/10"
                  : "text-white hover:bg-white/10"
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay - Siempre disponible para ADMIN */}
      {isMenuOpen && (
        <div
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${hasRole(["ADMIN"]) ? "" : "lg:hidden"}`}
        >
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <SuarecLogo className="w-24" theme="light" />
                <button
                  onClick={closeMenu}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col space-y-1 px-4">
                  {hasRole(["ADMIN"]) && (
                    <MobileNavLink
                      href="/users"
                      icon={<Users className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Usuarios
                    </MobileNavLink>
                  )}

                  {hasRole(["ADMIN", "BUSINESS", "PERSON"]) && (
                    <MobileNavLink
                      href="/feed"
                      icon={<TrendingUp className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Publicaciones
                    </MobileNavLink>
                  )}

                  {hasRole(["ADMIN", "BUSINESS", "PERSON"]) && (
                    <MobileNavLink
                      href="/companies"
                      icon={<Building2 className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Compañías
                    </MobileNavLink>
                  )}

                  {hasRole(["BUSINESS", "ADMIN"]) && (
                    <MobileNavLink
                      href="/applications"
                      icon={<Briefcase className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Aplicaciones
                    </MobileNavLink>
                  )}

                  {hasRole(["PERSON", "ADMIN"]) && (
                    <MobileNavLink
                      href="/my-applications"
                      icon={<UserCheck className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Mis aplicaciones
                    </MobileNavLink>
                  )}

                  {hasRole(["BUSINESS", "ADMIN"]) && (
                    <MobileNavLink
                      href="/my-employees"
                      icon={<Users className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Mis empleados
                    </MobileNavLink>
                  )}

                  {hasRole(["PERSON", "BUSINESS", "ADMIN"]) && (
                    <MobileNavLink
                      href="/chat"
                      icon={<MessageSquare className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Mensajes
                    </MobileNavLink>
                  )}

                  {hasRole(["PERSON", "BUSINESS", "ADMIN"]) && (
                    <MobileNavLink
                      href="/contracts"
                      icon={<Handshake className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Contrataciones
                    </MobileNavLink>
                  )}

                  {hasRole(["PERSON", "BUSINESS", "ADMIN"]) && (
                    <MobileNavLink
                      href="/ratings"
                      icon={<Star className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Calificaciones
                    </MobileNavLink>
                  )}

                  {hasRole(["ADMIN", "BUSINESS", "PERSON"]) && (
                    <MobileNavLink
                      href="/stats"
                      icon={<BarChart3 className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Estadísticas
                    </MobileNavLink>
                  )}

                  {hasRole(["ADMIN"]) && (
                    <MobileNavLink
                      href="/payments"
                      icon={<CreditCard className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Pagos
                    </MobileNavLink>
                  )}

                  {hasRole(["BUSINESS", "PERSON"]) && (
                    <MobileNavLink
                      href="/payments/history"
                      icon={<CreditCard className="h-5 w-5" />}
                      onClick={closeMenu}
                    >
                      Historial de Pagos
                    </MobileNavLink>
                  )}
                </div>
              </div>

              {/* User Profile Section */}
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <NavbarRole isMobile={true} section="logIn" />
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop - click to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeMenu}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
};

// Desktop Navigation Link component
const NavLink = ({
  href,
  children,
  icon,
  isScrolled,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  isScrolled: boolean;
}) => (
  <Link
    href={href}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 ${
      isScrolled
        ? "text-gray-700 hover:text-[#097EEC] hover:bg-[#097EEC]/5"
        : "text-white hover:text-white/90 hover:bg-white/10"
    }`}
  >
    {icon}
    <span>{children}</span>
  </Link>
);

// Mobile Navigation Link component
const MobileNavLink = ({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-[#097EEC]/10 hover:text-[#097EEC] transition-all duration-300 font-medium active:bg-[#097EEC]/20"
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;
