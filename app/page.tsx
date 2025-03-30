import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { ArrowRight, Briefcase, Building2, Users, CheckCircle } from "lucide-react"
import logoImage from "@/public/CafeYFogon.png"
import logoImageDos from "@/public/veens.png"
import logoImageTres from "@/public/enfacol.png"
import logoImageCuatro from "@/public/OlimpoCocktail.png"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#2171BC] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-white/[0.2] bg-[length:20px_20px]" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
          {/* Hero Content */}
          <div className="md:w-1/2 z-10 text-white space-y-6 md:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Encuentra el trabajo <span className="text-[#97CBFF]">de tus sueños</span>
            </h1>

            <p className="text-lg md:text-xl opacity-90 max-w-lg">
              Te ayudamos a conectar con las mejores empresas del mercado y a impulsar tu carrera profesional.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/select-type"
                className="bg-white text-[#097EEC] px-6 py-3 rounded-md text-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center gap-2 shadow-lg"
              >
                Regístrate ahora
                <ArrowRight className="h-5 w-5" />
              </Link>

              <Link
                href="/publications"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-white/10 transition flex items-center justify-center"
              >
                Ver oportunidades
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 mt-4 border-t border-white/20">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">500+</span>
                <span className="text-sm opacity-80">Empresas</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">10k+</span>
                <span className="text-sm opacity-80">Usuarios</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold">2k+</span>
                <span className="text-sm opacity-80">Contrataciones</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="md:w-1/2 mt-12 md:mt-0 relative z-10">
            <div className="relative h-[400px] md:h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://res.cloudinary.com/dxhi8xsyb/image/upload/v1743362098/carpinet_n4oyz8.jpg"
                alt="Profesionales trabajando"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#082D50]/70 to-transparent"></div>

              {/* Floating Elements */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <CheckCircle className="h-6 w-6 text-[#097EEC]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Oportunidades verificadas</p>
                    <p className="text-white/80 text-sm">Todas nuestras ofertas son validadas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            ¿Por qué elegir <span className="text-[#097EEC]">SUAREC</span>?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="bg-[#097EEC]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-[#097EEC]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ofertas exclusivas</h3>
              <p className="text-gray-600">Accede a oportunidades laborales que no encontrarás en otras plataformas.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="bg-[#097EEC]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-[#097EEC]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Empresas de calidad</h3>
              <p className="text-gray-600">
                Trabajamos con las mejores empresas del mercado para garantizar buenas condiciones.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="bg-[#097EEC]/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#097EEC]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad activa</h3>
              <p className="text-gray-600">
                Forma parte de una red de profesionales que comparten oportunidades y experiencias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Alianzas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">Nuestras alianzas</h2>
          <p className="text-lg text-center max-w-2xl mx-auto mb-12 text-gray-600">
            Trabajamos con empresas líderes para ofrecerte las mejores oportunidades laborales.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { logo: logoImage, name: "Café y Fogón" },
              { logo: logoImageDos, name: "Veens" },
              { logo: logoImageTres, name: "Enfacol" },
              { logo: logoImageCuatro, name: "Olimpo Cocktail" },
            ].map((company, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center justify-center"
              >
                <div className="h-24 flex items-center justify-center">
                  <Image
                    src={company.logo || "/placeholder.svg"}
                    alt={company.name}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-sm font-medium text-gray-700">{company.name}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/companies"
              className="inline-flex items-center text-[#097EEC] hover:text-[#082D50] font-medium"
            >
              Ver todas nuestras empresas aliadas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#097EEC]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para encontrar tu próxima oportunidad?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Únete a miles de profesionales que ya han encontrado el trabajo de sus sueños con SUAREC.
          </p>
          <Link
            href="/auth/select-type"
            className="bg-white text-[#097EEC] px-8 py-4 rounded-md text-lg font-medium hover:bg-opacity-90 transition inline-flex items-center gap-2"
          >
            Comenzar ahora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#082D50] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SUAREC</h3>
              <p className="text-white/70 max-w-xs">
                Conectamos talento con oportunidades para crear un futuro laboral mejor.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/publications" className="text-white/70 hover:text-white transition">
                    Publicaciones
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-white/70 hover:text-white transition">
                    Empresas
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/70 hover:text-white transition">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/70 hover:text-white transition">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-white/70 hover:text-white transition">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white/70 hover:text-white transition">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-white/70 hover:text-white transition">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center md:flex md:justify-between md:items-center">
            <p className="text-sm text-white/70">© {new Date().getFullYear()} SUAREC. Todos los derechos reservados.</p>
            <div className="mt-4 md:mt-0 flex justify-center gap-4">
              <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

