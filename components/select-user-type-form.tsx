"use client";

import { Role } from "@/interfaces/role.interface";
import RolesService from "@/services/RolesService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Building2, Loader2, ArrowRight, AlertCircle } from "lucide-react";

const UserTypeForm = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await RolesService.getRoles();
      setRoles(res.data.data);
    } catch (err) {
      console.error("Error al cargar roles:", err);
      setError("No se pudieron cargar las opciones de registro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleNext = () => {
    if (userType) {
      // Guardar el tipo de usuario en localStorage
      localStorage.setItem("user-type", userType);
      // Navegar a la página de registro
      router.push("/auth/register");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-[#097EEC] animate-spin" />
        <p className="mt-3 text-gray-600">Cargando opciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700">{error}</p>
            <button 
              className="mt-2 text-red-600 hover:text-red-800 transition-colors"
              onClick={fetchRoles}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-800">¿Cómo deseas registrarte?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => 
            role.name !== 'ADMIN' && (
              <div key={role.name} 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  userType === role.name 
                    ? 'border-[#097EEC] bg-[#097EEC]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setUserType(role.name)}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full ${
                    userType === role.name 
                      ? 'bg-[#097EEC]/20' 
                      : 'bg-gray-100'
                  } flex items-center justify-center`}>
                    {role.name === 'PERSON' ? (
                      <User className={`h-5 w-5 ${userType === role.name ? 'text-[#097EEC]' : 'text-gray-500'}`} />
                    ) : (
                      <Building2 className={`h-5 w-5 ${userType === role.name ? 'text-[#097EEC]' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">{role.name === 'PERSON' ? 'Persona' : 'Empresa'}</h3>
                    <p className="text-sm text-gray-500">
                      {role.name === 'PERSON' 
                        ? 'Crea tu perfil personal' 
                        : 'Registra tu empresa'}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-[#097EEC] text-white py-3 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!userType}
      >
        Continuar
        <ArrowRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
};

export default UserTypeForm;