"use client";

import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UsersService";
import CompanyService from "@/services/CompanyService";

// Interfaces para los DTOs
interface CreateUserDto {
  name: string;
  password: string;
  cv_url?: string;
  genre: string;
  cellphone: string;
  email: string;
  born_at: Date;
  roles?: string[];
  companyId?: string;
}

interface CreateCompanyDto {
  nit: string;
  name: string;
  born_at: Date;
  created_at: Date;
  email: string;
  cellphone: string;
  userId: string;
}

const FormRegister = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [userType, setUserType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>("");

  const router = useRouter();

  // Revisar el tipo de usuario almacenado en localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem("user-type");
    console.log('user type: ' + storedUserType);
    setUserType(storedUserType);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    setError("");
    setSuccess("");
  
    startTransition(async () => {
      try {
        if (userType === "PERSON") {
          // Datos del usuario para PERSON
          const userData: CreateUserDto = {
            name: formData.get("fullname") as string,
            password: formData.get("password") as string,
            genre: formData.get("genre") as string,
            cellphone: formData.get("cellphone") as string,
            email: formData.get("email") as string,
            born_at: new Date(formData.get("born_at") as string),
            cv_url: formData.get("cv_url") as string,
            roles: ["PERSON"],
          };
          
          // Para usuarios tipo PERSON, simplemente creamos el usuario
          const response = await UserService.createUser(userData);
          setSuccess("Usuario creado correctamente");
          
        } else if (userType === "BUSINESS") {
          // Para empresas, usamos el nombre y email de la empresa para el usuario
          const companyName = formData.get("company_name") as string;
          const companyEmail = formData.get("company_email") as string;
          const companyPhone = formData.get("company_cellphone") as string;
          const companyBornAt = new Date(formData.get("company_born_at") as string);
          
          // Datos del usuario para BUSINESS con valores predeterminados para campos personales
          const userData: CreateUserDto = {
            // Usamos el nombre de la empresa como nombre de usuario
            name: companyName,
            password: formData.get("password") as string,
            // Campos personales con valores predeterminados
            genre: "O", // Otro
            cellphone: companyPhone, // Usar el teléfono de la empresa
            email: companyEmail, // Usar el email de la empresa
            born_at: companyBornAt, // Usar la fecha de fundación
            cv_url: "", // CV vacío
            roles: ["BUSINESS"],
          };
          
          // Creamos primero el usuario
          const userResponse = await UserService.createUser(userData);
          
          // Obtenemos el ID del usuario creado
          const userId = userResponse.data.id;
          
          if (userId) {
            // Creamos los datos de la empresa
            const companyData: CreateCompanyDto = {
              nit: formData.get("nit") as string,
              name: companyName,
              email: companyEmail,
              cellphone: companyPhone,
              born_at: companyBornAt,
              created_at: new Date(), // Fecha actual
              userId: userId,
            };
            
            // Creamos la empresa asociada al usuario
            const companyResponse = await CompanyService.createCompany(companyData);
            
            setSuccess("Usuario y empresa creados correctamente");
          }
        }
        
        // Redirigir al login después de un tiempo
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } catch (error: any) {
        console.error("Error durante el registro:", error);
        setError(error.response?.data?.message || "Error al crear el usuario");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 flex-col w-full">
      {userType === "PERSON" || userType === "BUSINESS" ? (
        <>
          {/* Campos específicos por tipo de usuario */}
          {userType === "PERSON" ? (
            // Campos solo para PERSON
            <>
              <label htmlFor="fullname">Nombre completo</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Jhon Doe"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jhonDoe@gmail.com"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="genre">Sexo</label>
              <select
                id="genre"
                name="genre"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>

              <label htmlFor="cellphone">Teléfono</label>
              <input
                id="cellphone"
                name="cellphone"
                type="tel"
                placeholder="+57 123456789"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="born_at">Fecha de nacimiento</label>
              <input
                id="born_at"
                name="born_at"
                type="date"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />  

              <label htmlFor="cv_url">URL de CV</label>
              <input
                id="cv_url"
                name="cv_url"
                type="url"
                placeholder="https://mi-cv.com"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="profile_image">Foto de perfil (opcional)</label>
              <input
                id="profile_image"
                name="profile_image"
                type="file"
                accept="image/*"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                onChange={handleFileChange}
                disabled={isPending}
              />
            </>
          ) : (
            // Campos solo para BUSINESS
            <>
              <label htmlFor="nit">NIT</label>
              <input
                id="nit"
                name="nit"
                type="text"
                placeholder="1234567890"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="company_name">Nombre de la compañía</label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                placeholder="Mi Empresa S.A."
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="company_email">Correo electrónico de la compañía</label>
              <input
                id="company_email"
                name="company_email"
                type="email"
                placeholder="empresa@gmail.com"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="company_cellphone">Teléfono de la compañía</label>
              <input
                id="company_cellphone"
                name="company_cellphone"
                type="tel"
                placeholder="+57 123456789"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="company_born_at">Fecha de fundación</label>
              <input
                id="company_born_at"
                name="company_born_at"
                type="date"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                disabled={isPending}
                required
              />

              <label htmlFor="company_logo">Logo de la empresa (opcional)</label>
              <input
                id="company_logo"
                name="company_logo"
                type="file"
                accept="image/*"
                className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
                onChange={handleFileChange}
                disabled={isPending}
              />
            </>
          )}

          {/* Campos comunes para ambos tipos */}
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="*******"
            className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
            disabled={isPending}
            required
          />

          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview.toString()} 
                alt="Vista previa" 
                className="w-32 h-32 object-cover rounded-lg mx-auto" 
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4">
          <p className="text-red-500">No se ha seleccionado un tipo de usuario.</p>
          <button
            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg"
            onClick={() => router.push("/auth/select-type")}
            type="button"
          >
            Seleccionar tipo de usuario
          </button>
        </div>
      )}

      {error && (
        <div className="text-white font-bold bg-red-500 mt-2 rounded-lg px-2 py-1 flex gap-2 items-center">
          <IconExclamationCircle size={18} /> {error}
        </div>
      )}
      
      {success && (
        <div className="text-white font-bold bg-green-500 rounded-lg mt-2 px-2 py-1 flex gap-2 items-center">
          <IconCheck size={18} /> {success}
        </div>
      )}

      {(userType === "PERSON" || userType === "BUSINESS") && (
        <>
          <button
            type="submit"
            className="mt-4 bg-primary hover:bg-primary/80 text-white font-bold transition-all w-full p-[10px] rounded-3xl"
            disabled={isPending}
          >
            {isPending ? "Procesando..." : "Crear cuenta"}
          </button>
          
          <button
            className="mt-2 bg-transparent hover:bg-primary/10 border-2 border-primary text-primary transition-all w-full p-[10px] rounded-3xl"
            onClick={() => router.push("/auth/select-type")}
            type="button"
          >
            Volver
          </button>
        </>
      )}
    </form>
  );
};

export default FormRegister;