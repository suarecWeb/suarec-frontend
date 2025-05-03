"use client";

import FormRegister from "@/components/form-register";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Register = () => {
  return (
      <div className="w-full max-w-6xl px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="mt-2 text-gray-600">Completa el formulario para unirte a nuestra plataforma</p>
        </div>
        
        <FormRegister />
        
        <div className="mt-6 text-center">
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
            className="mt-3 inline-flex items-center text-gray-500 hover:text-[#097EEC] transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
  );
};

export default Register;