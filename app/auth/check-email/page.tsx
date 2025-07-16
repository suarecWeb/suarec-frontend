import Link from "next/link";

// Configuración para evitar prerenderización estática
export const dynamic = "force-dynamic";

const CheckEmailPage = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        {/* Icono de email */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">Revisa tu email</h1>
          <p className="text-gray-500 mt-2">
            Hemos enviado un enlace de recuperación a tu dirección de email.
            Revisa tu bandeja de entrada y sigue las instrucciones para
            restablecer tu contraseña.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            ¿No recibiste el email? Revisa tu carpeta de spam o
          </p>
          <Link
            href="/auth/forgot"
            className="font-medium text-[#097EEC] hover:text-[#0A6BC7] text-sm"
          >
            intenta con otro email
          </Link>
        </div>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-[#097EEC] hover:text-[#0A6BC7] text-sm"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
