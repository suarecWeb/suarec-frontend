"use client";

import UserTypeForm from "@/components/select-user-type-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Configuración para evitar prerenderización estática
export const dynamic = 'force-dynamic';

const UserType = () => {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tipo de registro</h1>
        <p className="mt-2 text-gray-600">Selecciona cómo deseas registrarte en nuestra plataforma</p>
      </div>
      
      <UserTypeForm />
      
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-[#097EEC] font-medium hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
        
        <Link
          href="/"
          className="mt-4 inline-flex items-center text-gray-500 hover:text-[#097EEC] transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default UserType;