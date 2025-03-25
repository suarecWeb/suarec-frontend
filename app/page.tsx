import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import buildingImage from "@/public/building.jpg";
import logoImage from "@/public/CafeYFogon.png"
import logoImageDos from "@/public/veens.png"
import logoImageTres from "@/public/enfacol.png"
import logoImageCuatro from "@/public/OlimpoCocktail.png"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[#2171BC]">
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
                className="bg-[#097EEC] text-white px-6 py-3 rounded-md text-lg hover:bg-[#082D50] transition"
              >
                Regístrate ahora
              </Link>
          </div>
        </div>

        {/* Sección de Alianzas */}
        <section className="py-16 bg-[#2171BC] text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Nuestras alianzas</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Trabajamos con empresas líderes para ofrecerte las mejores oportunidades laborales.
          </p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {/* Logos de empresas */}
            <div className="bg-[#EFF1F1] p-4 rounded-lg">
              <Image
                src={logoImage}
                alt="Empresa 1"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <div className="bg-[#EFF1F1] p-4 rounded-lg">
              <Image
                src={logoImageDos}
                alt="Empresa 2"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <div className="bg-[#EFF1F1] p-4 rounded-lg">
              <Image
                src={logoImageTres}
                alt="Empresa 3"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
            <div className="bg-[#EFF1F1] p-4 rounded-lg">
              <Image
                src={logoImageCuatro}
                alt="Empresa 4"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#082D50] text-white py-6 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} SUAREC. Todos los derechos reservados.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/privacy" className="hover:text-[#EFF1F1]">
              Política de Privacidad
            </Link>
            <Link href="/terms" className="hover:text-[#EFF1F1]">
              Términos y Condiciones
            </Link>
          </div>
        </footer>
      </main>
    </>
  );
}