'use client';

import Link from 'next/link';
import Navbar from '@/components/navbar';

export default function AccessDeniedPage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-4 text-red-500">Acceso Denegado</h1>
        <p className="text-xl mb-8">
          No tienes permiso para acceder a esta página.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver al Inicio
        </Link>
      </div>
    </>
  );
}