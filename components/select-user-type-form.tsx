"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const UserTypeForm = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserType(event.target.value);
  };

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
        <option value="empleador">Empleador</option>
        <option value="trabajador">Trabajador</option>
        <option value="compania">Compañía</option>
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
