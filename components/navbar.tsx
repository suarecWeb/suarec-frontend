//components/navbar
//para que use lo que sea que usas para las rutas
"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./utils/searchBar";
import { NavbarRole } from "./navbar-role";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-950 to-cyan-400 text-white py-4 shadow-md">
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
          className={`fixed top-0 left-0 w-full h-full bg-gradient-to-r from-blue-901 to-cyan-400 bg-opacity-90 z-50 flex flex-col items-center justify-center transition-transform duration-300 ease-in-out ${
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
          <Link href="/users" className="nav-link text-xl my-2 lg:my-0">
            Usuarios
          </Link>
          <Link href="/comments" className="nav-link text-xl my-2 lg:my-0">
            Comentarios
          </Link>
          <Link href="/publications" className="nav-link text-xl my-2 lg:my-0">
            Publicaciones
          </Link>
          <Link href="/companies" className="nav-link text-xl my-2 lg:my-0">
            Compañías
          </Link>
        </div>
        
        {/* NavbarRole */}
        <NavbarRole isMobile={false} section="logIn" />
      </div>
    </nav>
  );
};

export default Navbar;
