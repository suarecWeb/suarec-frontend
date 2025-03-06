"use client";

import RolesService from "@/services/RolesService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const UserTypeForm = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(event.target.value);
  };

  useEffect(() => {
    RolesService.getRoles().then((res: any) => setRoles(res.data));
  }, []);

  const handleNext = () => {
    if (userType) {
      // Guardar el tipo de usuario en localStorage
      localStorage.setItem("user-type", userType);
      // Navegar a la página de registro
      router.push("/auth/register");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <label htmlFor="userType" className="text-lg font-medium text-secondary">
        ¿Qué eres?
      </label>
      <select
        id="userType"
        name="userType"
        value={userType || ""}
        onChange={handleChange}
        className="w-full p-[10px] bg-transparent border border-primary rounded-lg text-secondary"
        required
      >
        <option value="" disabled>
          Selecciona una opción
        </option>
        { roles.map((role) => 
          role.name == 'ADMIN' ? <></> : <option value={role.name}>{role.name == 'PERSON' ? 'Persona' : 'Empresa'}</option>
        ) }
      </select>

      <button
        onClick={handleNext}
        className="mt-2 w-full bg-primary text-white font-bold transition-all p-[10px] hover-primary rounded-3xl disabled:opacity-50"
        disabled={!userType}
      >
        Siguiente
      </button>
    </div>
  );
};

export default UserTypeForm;
