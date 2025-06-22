'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  // Usar el pathname actual para detectar la página de registro
  // Esto es más seguro que revisar el children
  const pathname = usePathname();
  const isRegistrationPage = pathname?.includes("/register");
  const isVerifyEmailPage = pathname?.includes("/verify-email");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#097EEC] to-[#082D50]">
      {/* Header con logo */}
      <header className="w-full p-4">
        <div className="container mx-auto">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-extrabold text-white">SUAREC</h1>
          </Link>
        </div>
      </header>

      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Contenido principal - Ancho adaptativo según la página */}
      <div className="flex-grow flex justify-center items-center w-full px-4 py-8 relative z-10">
        <div className={`w-full ${
          // Usar clases dinámicas según la página
          isRegistrationPage || isVerifyEmailPage
            ? "max-w-4xl lg:max-w-5xl xl:max-w-6xl" // Ancho más equilibrado
            : "max-w-[500px]" // Ancho original para otros contenidos
        } bg-white rounded-xl shadow-2xl overflow-hidden`}>
          <div className="p-8 md:p-10">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-white/70 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} SUAREC. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;