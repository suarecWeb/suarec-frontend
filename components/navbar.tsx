// File: components/navbar.tsx
// Description: This component represents the navigation bar of the application.
// It includes links to different sections of the app based on user roles and a search bar.
// The navbar is responsive and includes a hamburger menu for mobile devices.
// It uses the `NavbarRole` component to handle user authentication and role management.
// It also uses the `jwt-decode` library to decode JWT tokens and extract user roles from them.
// The component is styled using Tailwind CSS classes for a modern and clean look.
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import SearchBar from "./utils/searchBar";
import { NavbarRole } from "./navbar-role";
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode';

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
        
        console.log("Roles decodificados:", roles);    
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
    <nav className="bg-[#097EEC] text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center relative">
        <Link href="/" className="nav-logo text-2xl font-extrabold font-sans">
          SUAREC
        </Link>
        {/* Menú hamburguesa */}
        <button
          className="lg:hidden block text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>
        
        {/* Menú desplegable (pantallas pequeñas) */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-[#2171BC] bg-opacity-90 z-50 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static lg:translate-x-0 lg:flex lg:flex-row lg:items-center lg:space-x-4 lg:h-auto`}
        >
          <button
            className="absolute top-4 right-4 text-white lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          
          <SearchBar />
          {hasRole(['ADMIN']) && (
            <Link href="/users" className="nav-link text-xl my-2 lg:my-0 hover:text-[#EFF1F1]">
              Usuarios
            </Link>
          )}
          
          {hasRole(['ADMIN', 'PERSON']) && (
            <Link href="/comments" className="nav-link text-xl my-2 lg:my-0 hover:text-[#EFF1F1]">
              Comentarios
            </Link>
          )}
          
          {hasRole(['ADMIN', 'BUSINESS', 'PERSON']) && (
            <Link href="/publications" className="nav-link text-xl my-2 lg:my-0 hover:text-[#EFF1F1]">
              Publicaciones
            </Link>
          )}
          
          {hasRole(['ADMIN', 'BUSINESS']) && (
            <Link href="/companies" className="nav-link text-xl my-2 lg:my-0 hover:text-[#EFF1F1]">
              Compañías
            </Link>
          )}
        </div>

        {/* NavbarRole */}
        <NavbarRole isMobile={false} section="logIn" />
      </div>
    </nav>
  );
};

export default Navbar;