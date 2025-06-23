"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchBar from "./utils/searchBar";
import { NavbarRole } from "./navbar-role";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
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
  Handshake
} from 'lucide-react';
import NotificationBadge from "./notification-badge";

interface TokenPayload {
  roles?: { name: string }[];
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<TokenPayload>(token);
        const roles = decodedToken.roles?.map(role => role.name) || [];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error al decodificar token:', error);
        setUserRoles([]);
      }
    } else {
      setUserRoles([]);
    }

    // Detectar scroll para cambiar el estilo de la navbar
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-[#097EEC]'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className={`text-2xl lg:text-3xl font-eras-bold-italic tracking-tight transition-all duration-300 hover:scale-105 ${
              isScrolled ? 'text-[#097EEC]' : 'text-white'
            }`}
          >
            SUAREC
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {/*<div className="mr-6">
              <SearchBar isScrolled={isScrolled} />
            </div>*/}
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {hasRole(['ADMIN']) && (
                <NavLink href="/users" icon={<Users className="h-4 w-4" />} isScrolled={isScrolled}>
                  Usuarios
                </NavLink>
              )}
              
              {/*{hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <NavLink href="/publications" icon={<FileText className="h-4 w-4" />} isScrolled={isScrolled}>
                  Publicaciones
                </NavLink>
              )}*/}
              
              {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <NavLink href="/feed" icon={<TrendingUp className="h-4 w-4" />} isScrolled={isScrolled}>
                  Feed
                </NavLink>
              )}
              
              {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <NavLink href="/companies" icon={<Building2 className="h-4 w-4" />} isScrolled={isScrolled}>
                  Compañías
                </NavLink>
              )}

              {hasRole(['BUSINESS', 'ADMIN']) && (
                <NotificationBadge userRoles={userRoles}>
                  <NavLink href="/applications" icon={<Briefcase className="h-4 w-4" />} isScrolled={isScrolled}>
                    Aplicaciones
                  </NavLink>
                </NotificationBadge>
              )}

              {hasRole(['PERSON', 'ADMIN']) && (
                <NavLink href="/my-applications" icon={<UserCheck className="h-4 w-4" />} isScrolled={isScrolled}>
                  Mis aplicaciones
                </NavLink>
              )}

              {hasRole(['BUSINESS', 'ADMIN']) && (
                <NavLink href="/my-employees" icon={<Users className="h-4 w-4" />} isScrolled={isScrolled}>
                  Mis empleados
                </NavLink>
              )}

              {hasRole(['BUSINESS', 'ADMIN']) && (
                <>
                  <NavLink href="/attendance" icon={<Clock className="h-4 w-4" />} isScrolled={isScrolled}>
                    Control de asistencia
                  </NavLink>
                  <NavLink href="/attendance/register" icon={<Clock className="h-4 w-4" />} isScrolled={isScrolled}>
                    Registrar asistencia
                  </NavLink>
                </>
              )}

              {hasRole(['PERSON','BUSINESS', 'ADMIN']) && (
                <NavLink href="/chat" icon={<MessageSquare className="h-4 w-4" />} isScrolled={isScrolled}>
                  Mensajes
                </NavLink>
              )}

              {hasRole(['PERSON','BUSINESS', 'ADMIN']) && (
                <NavLink href="/contracts" icon={<Handshake className="h-4 w-4" />} isScrolled={isScrolled}>
                  Contrataciones
                </NavLink>
              )}
              
              {/* User Menu */}
              <div className="ml-4 pl-4 border-l border-white/20">
                <NavbarRole isMobile={false} section="logIn" isScrolled={isScrolled} />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden flex items-center p-2 rounded-lg transition-all duration-300 hover:bg-opacity-20 ${
              isScrolled 
                ? 'text-[#097EEC] hover:bg-[#097EEC]/10' 
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto custom-scrollbar">
          <div className="flex min-h-screen flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#097EEC] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-eras-bold text-xl text-gray-900">Suarec</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex flex-col space-y-2 pb-4">
                {hasRole(['ADMIN']) && (
                  <MobileNavLink href="/users" icon={<Users className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Usuarios
                  </MobileNavLink>
                )}
                {/*
                {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                  <MobileNavLink href="/publications" icon={<FileText className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Publicaciones
                  </MobileNavLink>
                )}*/}
                
                {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                  <MobileNavLink href="/feed" icon={<TrendingUp className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Feed
                  </MobileNavLink>
                )}
                
                {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                  <MobileNavLink href="/companies" icon={<Building2 className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Compañías
                  </MobileNavLink>
                )}

                {hasRole(['BUSINESS', 'ADMIN']) && (
                  <MobileNavLink href="/applications" icon={<Briefcase className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Aplicaciones
                  </MobileNavLink>
                )}

                {hasRole(['PERSON', 'ADMIN']) && (
                  <MobileNavLink href="/my-applications" icon={<UserCheck className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Mis aplicaciones
                  </MobileNavLink>
                )}

                {hasRole(['BUSINESS', 'ADMIN']) && (
                  <MobileNavLink href="/my-employees" icon={<Users className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Mis empleados
                  </MobileNavLink>
                )}

                {hasRole(['BUSINESS', 'ADMIN']) && (
                  <>
                    <MobileNavLink href="/attendance" icon={<Clock className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                      Control de asistencia
                    </MobileNavLink>
                    <MobileNavLink href="/attendance/register" icon={<Clock className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                      Registrar asistencia
                    </MobileNavLink>
                  </>
                )}

                {hasRole(['PERSON', 'BUSINESS', 'ADMIN']) && (
                  <MobileNavLink href="/chat" icon={<MessageSquare className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Mensajes
                  </MobileNavLink>
                )}

                {hasRole(['PERSON', 'BUSINESS', 'ADMIN']) && (
                  <MobileNavLink href="/contracts" icon={<Handshake className="h-5 w-5" />} onClick={() => setIsMenuOpen(false)}>
                    Contrataciones
                  </MobileNavLink>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 pb-8 bg-white">
              <div className="flex justify-center">
                <NavbarRole isMobile={true} section="logIn" />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Desktop Navigation Link component
const NavLink = ({ href, children, icon, isScrolled }: { href: string; children: React.ReactNode; icon: React.ReactNode; isScrolled: boolean }) => (
  <Link 
    href={href} 
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      isScrolled 
        ? 'text-gray-700 hover:text-[#097EEC]' 
        : 'text-white hover:text-white/90'
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
  onClick 
}: { 
  href: string; 
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-800 hover:bg-[#097EEC]/10 hover:text-[#097EEC] transition-all duration-300 font-eras-medium"
  >
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;