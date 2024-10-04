import FormLogin from "@/components/form-login";
import Image from "next/image";
import Link from "next/link";

const Register = () => {
  return (
    <>
      <h1 className="text-4xl text-secondary text-center w-full font-bold">Iniciar sesión</h1>
      <FormLogin />
      <a href="/auth/register" className="text-secondary mx-auto">
        ¿Aún no tienes cuenta?{" "}
        <span className="text-success underline text-secondary">Registrarse</span>
      </a>
    </>
  );
};

export default Register;