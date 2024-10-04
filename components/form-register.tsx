"use client";

import { IconBrandGoogleFilled, IconCheck } from "@tabler/icons-react";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { uploadImageCloudinary } from "@/cloudinary";
import { useRegister } from "@/hooks/auth/use-register";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const FormRegister = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>("");

  const { register } = useRegister();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        setImagePreview(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const imageFile = formData.get("input_file") as File;
    let [status, data] = [false, ""];

    /*
    if (imageFile) {
      [status, data] = await uploadImageCloudinary(imageFile);
    }*/

    // Obtener los valores de los campos del formulario
    const values = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("fullname") as string,
      photo_url: data || "",
      cellphone: formData.get("cellphone") as string,
      genre: formData.get("genre") as string, // Si no se puede convertir a número, se usa 0
      born_at: new Date(formData.get("born_at") as string), // Convierte la cadena a objeto Date
      role: "Company", // Asignar un valor fijo para el rol
      cv_url: "example.url.cv", // Usar la URL fija como solicitaste
    };

    setError("");
    setSuccess("");

    startTransition(() => {
      console.log("calling use register...");

      register(
        values.name,
        values.password,
        values.email,
        values.cv_url,
        values.cellphone,
        values.genre,
        values.born_at,
        values.role
      )
        .then((data: any) => {
          console.log("data received from use register hook... :" , data)
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
      {/* A JSX comment
      
      <label htmlFor="input_file" id="drop-area" className="flex-grow">
        <input
          type="file"
          id="input_file"
          name="input_file"
          accept=".jpg"
          hidden
          onChange={handleFileChange}
        />
        <div
          className="img-view w-[150px] h-full min-h-[150px] mx-auto border-2 border-black border-dashed rounded-full flex justify-center items-center flex-col gap-3 bg-gray-100 transition-all duration-200 ease-linear bg-cover"
          style={{ backgroundImage: `url(${imagePreview})` }}
        ></div>
        {imagePreview ? (
          <p className="cursor-pointer hover-secondary transition-all border-[3px] text-center mt-5 py-2 bg-secondary text-secondary rounded-3xl w-auto">
            Cambiar imagen
          </p>
        ) : (
          <p className="cursor-pointer hover-secondary transition-all border-[3px] border-primary text-center mt-5 py-2 bg-secondary text-secondary rounded-3xl w-auto">
            Subir imagen 
          </p>
        )}
      </label>
      
      */}

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
        type="text" // Cambié de 'genre' a 'text' para evitar confusiones
        placeholder="M - F"
        className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
        disabled={isPending}
        required
      />
      
      <label htmlFor="cellphone">Teléfono</label>
      <input
        id="cellphone"
        name="cellphone"
        type="tel" // Cambié de 'cellphone' a 'tel' para que sea un tipo de input correcto
        placeholder="123456789"
        className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
        disabled={isPending}
        required
      />
      
      <label htmlFor="born_at">Fecha de nacimiento</label>
      <input
        id="born_at"
        name="born_at"
        type="date" // Cambié el tipo a 'date' para permitir seleccionar la fecha
        className="w-full p-[10px] bg-secondary border border-primary rounded-lg"
        disabled={isPending}
        required
      />

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
    </form>
  );
};

export default FormRegister;
