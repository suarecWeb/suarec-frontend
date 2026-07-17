"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SearchBar from "./utils/searchBar";
import { NavbarRole } from "./navbar-role";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
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
  ShoppingBag, //nuevo icono para la bolsita de compras
  CreditCard,
  Star,
  BarChart3,
  Ticket,
} from "lucide-react";
import NotificationBadge from "./notification-badge";
import SuarecLogo from "./logo";
import { Input } from "@/components/ui/input";
import StaggeredMenu from "@/components/mobile/StaggeredMenu";
import type { StaggeredMenuItem } from "@/components/mobile/StaggeredMenu";
import MobileMenuFooter from "@/components/mobile/MobileMenuFooter";

interface TokenPayload {
  roles?: { name: string }[];
}

interface NavbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  isHomePage?: boolean;
}

const Navbar = ({
  searchValue,
  onSearchChange,
  showSearch = false,
  isHomePage = false,
}: NavbarProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const isUsersPage = pathname?.startsWith("/users");
  const isAdminPanel =
    isUsersPage ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/payments");

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

  const menuItems: StaggeredMenuItem[] = [
    hasRole(["ADMIN"]) && {
      label: "Usuarios",
      ariaLabel: "Ir a usuarios",
      link: "/users",
    },
    hasRole(["ADMIN", "BUSINESS", "PERSON"]) && {
      label: "Inicio",
      ariaLabel: "Ir a inicio",
      link: "/feed",
    },
    hasRole(["ADMIN", "BUSINESS", "PERSON"]) && {
      label: "Compañías",
      ariaLabel: "Ir a compañías",
      link: "/companies",
    },
    hasRole(["BUSINESS", "ADMIN"]) && {
      label: "Aplicaciones",
      ariaLabel: "Ir a aplicaciones",
      link: "/applications",
    },
    hasRole(["PERSON", "ADMIN"]) && {
      label: "Mis postulaciones",
      ariaLabel: "Ir a mis postulaciones",
      link: "/my-applications",
    },
    hasRole(["BUSINESS", "ADMIN"]) && {
      label: "Mis empleados",
      ariaLabel: "Ir a mis empleados",
      link: "/my-employees",
    },
    hasRole(["PERSON", "BUSINESS", "ADMIN"]) && {
      label: "Mensajes",
      ariaLabel: "Ir a mensajes",
      link: "/chat",
    },
    hasRole(["PERSON", "BUSINESS", "ADMIN"]) && {
      label: "Mis compras",
      ariaLabel: "Ir a mis compras",
      link: "/contracts",
    },
    hasRole(["PERSON", "BUSINESS", "ADMIN"]) && {
      label: "Calificaciones",
      ariaLabel: "Ir a calificaciones",
      link: "/ratings",
    },
    hasRole(["ADMIN", "BUSINESS", "PERSON"]) && {
      label: "Estadísticas",
      ariaLabel: "Ir a estadísticas",
      link: "/stats",
    },
    hasRole(["ADMIN"]) && {
      label: "Transacciones",
      ariaLabel: "Ir a transacciones",
      link: "/payments",
    },
    hasRole(["ADMIN"]) && {
      label: "Tickets de soporte",
      ariaLabel: "Ir a tickets de soporte",
      link: "/admin/tickets",
    },
    hasRole(["BUSINESS", "PERSON"]) && {
      label: "Historial de pagos",
      ariaLabel: "Ir a historial de pagos",
      link: "/payments/history",
    },
  ].filter(Boolean) as StaggeredMenuItem[];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300  ${
          isScrolled
            ? "bg-white/20 backdrop-blur-xl backdrop-saturate-190 shadow-sm rounded-b-[3rem]"
            : isHomePage
              ? "bg-transparent"
              : "bg-[#097EEC]"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo + título de sección */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className={`transition-all duration-300 hover:scale-105 ${
                  isScrolled ? "text-[#097EEC]" : "text-white"
                }`}
              >
                <SuarecLogo
                  className={
                    isAdminPanel
                      ? "w-36 sm:w-44 md:w-52"
                      : "w-24 sm:w-28 md:w-32"
                  }
                  panel={!!isAdminPanel}
                />
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            {showSearch && onSearchChange && (
              <div className="hidden lg:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      isScrolled ? "text-gray-500" : "text-white"
                    }`}
                  />
                  <Input
                    placeholder="Buscar publicaciones..."
                    value={searchValue || ""}
                    onChange={(e) => onSearchChange(e.target.value || "")}
                    className={`pl-11 pr-4 h-10 text-sm rounded-full transition-all duration-300 ${
                      isScrolled
                        ? "bg-white/90 border-gray-200/50 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-[#097EEC] focus:ring-[#097EEC]/20"
                        : "bg-white/20 border-white/30 text-white placeholder:text-white/80 focus:bg-white/30 focus:border-white/50 focus:ring-white/20"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                {/* Admin Links - Siempre visibles para ADMIN */}
                {hasRole(["ADMIN"]) && (
                  <>
                    <NavLink
                      href="/feed"
                      icon={<TrendingUp className="h-4 w-4" />}
                      isScrolled={isScrolled}
                    >
                      Inicio
                    </NavLink>
                    <NavLink
                      href="/users"
                      icon={<Users className="h-4 w-4" />}
                      isScrolled={isScrolled}
                    >
                      Usuarios
                    </NavLink>
                    <NavLink
                      href="/contracts"
                      icon={<ShoppingBag className="h-4 w-4" />}
                      isScrolled={isScrolled}
                    >
                      Mis compras
                    </NavLink>
                    <NavLink
                      href="/chat"
                      icon={<MessageSquare className="h-4 w-4" />}
                      isScrolled={isScrolled}
                    >
                      Mensajes
                    </NavLink>
                  </>
                )}

                {/* Non-Admin Links */}
                {!hasRole(["ADMIN"]) && (
                  <>
                    {hasRole(["BUSINESS", "PERSON"]) && (
                      <NavLink
                        href="/feed"
                        icon={<TrendingUp className="h-4 w-4" />}
                        isScrolled={isScrolled}
                      >
                        Inicio
                      </NavLink>
                    )}

                    {hasRole(["PERSON"]) && (
                      <NavLink
                        href="/companies"
                        icon={<Building2 className="h-4 w-4" />}
                        isScrolled={isScrolled}
                      >
                        Compañías
                      </NavLink>
                    )}

                    {hasRole(["BUSINESS"]) && (
                      <NotificationBadge userRoles={userRoles}>
                        <NavLink
                          href="/applications"
                          icon={<Briefcase className="h-4 w-4" />}
                          isScrolled={isScrolled}
                        >
                          Mis Postulaciones
                        </NavLink>
                      </NotificationBadge>
                    )}

                    {hasRole(["BUSINESS"]) && (
                      <NavLink
                        href="/my-employees"
                        icon={<Users className="h-4 w-4" />}
                        isScrolled={isScrolled}
                      >
                        Mis empleados
                      </NavLink>
                    )}

                    {hasRole(["PERSON", "BUSINESS"]) && (
                      <NavLink
                        href="/chat"
                        icon={<MessageSquare className="h-4 w-4" />}
                        isScrolled={isScrolled}
                      >
                        Mensajes
                      </NavLink>
                    )}

                    {hasRole(["PERSON"]) && (
                      <NavLink
                        href="/contracts"
                        icon={<ShoppingBag className="h-4 w-4" />}
                        isScrolled={isScrolled}
                      >
                        Mis compras
                      </NavLink>
                    )}
                  </>
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

            {/* Mobile menu (animated) */}
            <div className="lg:hidden">
              <StaggeredMenu
                position="right"
                items={menuItems}
                socialItems={[]}
                displaySocials={false}
                displayItemNumbering={false}
                showLogo={false}
                isFixed={true}
                colors={["#097EEC", "#0A6BC7"]}
                menuButtonColor={isScrolled ? "#097EEC" : "#ffffff"}
                openMenuButtonColor="#ffffff"
                changeMenuColorOnOpen={false}
                accentColor="#097EEC"
                onMenuOpen={() => setIsMenuOpen(true)}
                onMenuClose={() => setIsMenuOpen(false)}
                footer={
                  <div className="px-1">
                    <MobileMenuFooter />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Backdrop click closes the menu via StaggeredMenu's click-away */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" />
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
