"use client";

import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";
import { useState, useTransition, useEffect } from "react";
import { useRegister } from "@/hooks/auth/use-register";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const FormRegister = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [userType, setUserType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>("");

  const { register } = useRegister();
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

    const values = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("fullname") as string,
      photo_url: "", // Aquí puedes agregar lógica para la foto si la subes
      cellphone: formData.get("cellphone") as string,
      genre: formData.get("genre") as string,
      born_at: new Date(formData.get("born_at") as string),
      role: userType || "Trabajador", // Rol basado en el userType de localStorage
      cv_url: "",
      company: {
        nit: "",
        name: "",
        email: "",
        cellphone: "",
        born_at: new Date(),
      }
    };

    // Añadir campos adicionales según el tipo de usuario
    if (userType === "trabajador") {
      values["cv_url"] = formData.get("cv_url") as string;
    } else if (userType === "compania") {
      values["company"] = {
        nit: formData.get("nit") as string,
        name: formData.get("company_name") as string,
        email: formData.get("company_email") as string,
        cellphone: formData.get("company_cellphone") as string,
        born_at: new Date(formData.get("company_born_at") as string),
      };
    }

    setError("");
    setSuccess("");

    startTransition(() => {
      register(
        values.name,
        values.password,
        values.email,
        values.cv_url || "", // Solo pasa cv_url si es Trabajador
        values.cellphone,
        values.genre,
        values.born_at,
        values.role,
      )
        .then((data: any) => {
          setError(data.error);
          setSuccess(data.success);
          if (data?.success) {
            setTimeout(() => {
              router.push("/auth/login");
            }, 2000);
          }
        })
        .catch((e: Error) => setError(e.message));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 flex-col w-full">
      {userType == "trabajador" || userType == "empleador" ? 
      
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

      <label htmlFor="genre">Sexo</label>
      <input
        id="genre"
        name="genre"
        type="text"
        placeholder="M - F"
        className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
        disabled={isPending}
        required
      />

      <label htmlFor="cellphone">Teléfono</label>
      <input
        id="cellphone"
        name="cellphone"
        type="tel"
        placeholder="123456789"
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

        {/* Si es Trabajador, muestra el campo de URL de CV */}
      {userType === "trabajador" && (
        <>
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
        </>
      )}
        </>
        :

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
            placeholder="123456789"
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
        </>
    }
      {error && (
        <div className="text-white font-bold bg-red-500 mt-2 rounded-lg px-2 py-1 flex gap-2">
          <IconExclamationCircle /> {error}
        </div>
      )}
      {success && (
        <div className="text-white font-bold bg-green-500 rounded-lg mt-2 px-2 py-1 flex gap-2">
          <IconCheck /> {success}
        </div>
      )}
      <button
        type="submit"
        className="mt-2 bg-white/80 hover-primary bg-primary text-primary font-bold transition-all w-full p-[10px] rounded-3xl"
        disabled={isPending}
      >
        Crear cuenta
      </button>
      <button
        className="mt-2 text-secondary bg-transparent hover-secondary border-2 border-primary text-white/80 transition-all transition-all w-full p-[10px] rounded-3xl"
        onClick={() => router.push("/auth/select-type")}
      >
        Volver
      </button>
    </form>
  );
};

export default FormRegister;
