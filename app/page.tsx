import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import buildingImage from "@/public/building.jpg"; // Asegúrate de tener esta imagen en la carpeta public

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-secondary">
        {/* Hero Section */}
        <div className="relative h-screen">
          <div className="absolute inset-0">
          <Image 
            src={buildingImage}
            alt="Edificios"
            fill
            style={{ objectFit: "cover" }}
            quality={100}
          />

            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Encuentra el trabajo de tus sueños
            </h1>
            <p className="text-lg md:text-xl mb-6">
              Te ayudamos a conectar con las mejores empresas del mercado
            </p>
            <Link 
                href="/auth/select-type" 
                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700 transition"
              >
                Regístrate ahora
              </Link>
          </div>
        </div>

        {/* Sección de Alianzas */}
        <section className="py-16 bg-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nuestras alianzas</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Trabajamos con empresas líderes para ofrecerte las mejores oportunidades laborales.
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {/* Logos de empresas 
            <Image
              src="/logo1.png"
              alt="Empresa 1"
              width={100}
              height={100}
              className="object-contain"
            />
            <Image
              src="/logo2.png"
              alt="Empresa 2"
              width={100}
              height={100}
              className="object-contain"
            />
            <Image
              src="/logo3.png"
              alt="Empresa 3"
              width={100}
              height={100}
              className="object-contain"
            />*/}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-white py-6 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} SUAREC. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:underline">Política de Privacidad
            </Link>
            <Link href="/terms"
              className="hover:underline">Términos y Condiciones
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}
