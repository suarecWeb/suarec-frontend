"use client"
import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-16">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icono de error */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          {/* Título y mensaje */}
          <h1 className="mt-6 text-6xl font-bold text-gray-900">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">
            Página no encontrada
          </h2>
          <p className="mt-2 text-gray-500">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          
          {/* Botones de acción */}
          <div className="mt-8 space-y-4">
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Volver al inicio
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Volver atrás
            </button>
          </div>
          
          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Si crees que esto es un error, contacta al soporte técnico.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
} 