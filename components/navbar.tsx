"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchBar from "./utils/searchBar";
import { NavbarRole } from "./navbar-role";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';
import { Menu, X, ChevronDown } from 'lucide-react';
import NotificationBadge from "./notification-badge";

interface TokenPayload {
  roles?: { name: string }[];
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

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
  }, []);

  const hasRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  return (
    <nav className="bg-[#097EEC] text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-extrabold font-sans tracking-tight transition-transform hover:scale-105"
          >
            SUAREC
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            <div className="mr-4">
              <SearchBar />
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {hasRole(['ADMIN']) && (
                <NavLink href="/users">Usuarios</NavLink>
              )}
              
              {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <NavLink href="/publications">Publicaciones</NavLink>
              )}
              
              {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <NavLink href="/companies">Compañías</NavLink>
              )}

              {hasRole(['BUSINESS', 'ADMIN']) && (
                <NotificationBadge userRoles={userRoles}>
                  <NavLink href="/applications">Aplicaciones</NavLink>
                </NotificationBadge>
              )}

              {hasRole(['PERSON', 'ADMIN']) && (
                <NavLink href="/my-applications">Mis Aplicaciones</NavLink>
              )}
              
              {/* User Menu */}
              <div className="ml-2 pl-2 border-l border-white/20">
                <NavbarRole isMobile={false} section="logIn" />
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden flex items-center p-2 rounded-md hover:bg-[#0A6BC7] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#097EEC] bg-opacity-98">
          <div className="flex flex-col h-full p-4">
            <div className="flex justify-between items-center mb-8">
              <Link 
                href="/" 
                className="text-2xl font-extrabold"
                onClick={() => setIsMenuOpen(false)}
              >
                SUAREC
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md hover:bg-[#0A6BC7] transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <SearchBar />
            </div>

            <div className="flex flex-col space-y-4">
              {hasRole(['ADMIN']) && (
                <MobileNavLink href="/users" onClick={() => setIsMenuOpen(false)}>
                  Usuarios
                </MobileNavLink>
              )}
              
              {hasRole(['ADMIN', 'PERSON']) && (
                <MobileNavLink href="/comments" onClick={() => setIsMenuOpen(false)}>
                  Comentarios
                </MobileNavLink>
              )}
              
              {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <MobileNavLink href="/publications" onClick={() => setIsMenuOpen(false)}>
                  Publicaciones
                </MobileNavLink>
              )}
              
              {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
                <MobileNavLink href="/companies" onClick={() => setIsMenuOpen(false)}>
                  Compañías
                </MobileNavLink>
              )}

              {hasRole(['BUSINESS', 'ADMIN']) && (
                <MobileNavLink href="/applications" onClick={() => setIsMenuOpen(false)}>
                  Aplicaciones
                </MobileNavLink>
              )}

              {hasRole(['PERSON', 'ADMIN']) && (
                <MobileNavLink href="/my-applications" onClick={() => setIsMenuOpen(false)}>
                  Mis Aplicaciones
                </MobileNavLink>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-white/20">
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
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-[#0A6BC7] hover:text-white/90 relative group"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

// Mobile Navigation Link component
const MobileNavLink = ({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link 
    href={href} 
    className="py-3 px-4 text-lg font-medium rounded-md transition-colors hover:bg-[#0A6BC7] active:bg-[#0A6BC7]/80 flex items-center justify-between"
    onClick={onClick}
  >
    <span>{children}</span>
    <ChevronDown className="h-5 w-5 opacity-70" />
  </Link>
);

export default Navbar;
