import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
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

      {/* Contenido principal */}
      <div className="flex-grow flex justify-center items-center w-full px-4 py-8 relative z-10">
        <div className="w-full max-w-[500px] bg-white rounded-xl shadow-2xl overflow-hidden">
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
