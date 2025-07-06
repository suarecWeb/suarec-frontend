"use client"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import CountdownTimer from "@/components/countdown-timer"
import {
  ArrowRight,
  Briefcase,
  Building2,
  Users,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Award,
  Heart,
  FileText
} from "lucide-react"
import logoImage from "@/public/CafeYFogon.png"
import logoImageDos from "@/public/veens.png"
import logoImageTres from "@/public/enfacol.png"
import logoImageCuatro from "@/public/OlimpoCocktail.png"
import TermsModal from "@/components/terms-modal"
import PrivacyModal from "@/components/privacy-modal"
import ContactModal from "@/components/contact-modal"
import CookiesModal from "@/components/cookies-modal"
import { useState } from "react"
import SuarecLogo from "@/components/logo"
import { CompaniesCarousel } from "@/components/CompaniesCarousel"

export default function Home() {
  const [isTermsOpen, setTermsOpen] = useState(false)
  const [isPrivacyOpen, setPrivacyOpen] = useState(false)
  const [isContactOpen, setContactOpen] = useState(false)
  const [isCookiesOpen, setCookiesOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section Moderna */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#097EEC] via-[#2171BC] to-[#082D50] overflow-hidden pt-20">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0">
          {/* Círculos decorativos animados */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/2 rounded-full blur-3xl animate-pulse delay-500"></div>

          {/* Grid sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

          {/* Partículas flotantes */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/30 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce delay-700"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 container mx-auto px-4 text-center mt-4">
          {/* Contador regresivo */}
          <CountdownTimer />

          {/* Logo/Título principal */}
          <div className="mb-8">
            <SuarecLogo width={550} height={100} className="mx-auto mb-4 w-[70%] drop-shadow-2xl"
              theme="dark" />
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-3"></div>
            <div className="w-12 h-1 bg-white/30 mx-auto"></div>
          </div>

          {/* Subtítulo elegante */}
          <div className="max-w-4xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-eras text-white/95 leading-relaxed">
              Conectamos <span className="font-eras-bold-italic text-[#97CBFF]">talento excepcional</span>
              <br />
              <span className="text-[#97CBFF] font-eras-bold-italic">con oportunidades extraordinarias</span>
            </h2>
          </div>

          {/* Descripción minimalista */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 font-eras leading-relaxed">
            La plataforma donde los mejores profesionales encuentran
            <br />
            <span className="font-eras-bold">las empresas que transformarán su carrera.</span>
          </p>

          {/* Estadísticas */}
          {/* <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-eras-bold text-white mb-2">500+</div>
              <div className="text-white/70 text-sm font-eras">Empresas activas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-eras-bold text-white mb-2">10K+</div>
              <div className="text-white/70 text-sm font-eras">Profesionales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-eras-bold text-white mb-2">95%</div>
              <div className="text-white/70 text-sm font-eras">Satisfacción</div>
            </div>
          </div> */}

          {/* Botón de acción */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <Link
              href="/auth/select-type"
              className="group bg-white text-[#097EEC] px-10 py-5 rounded-full text-lg font-eras-bold hover:bg-white/95 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              Comenzar ahora
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/companies"
              className="group border-2 border-white/30 text-white px-6 py-5 rounded-full text-base font-eras-medium hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center gap-3 backdrop-blur-sm"
            >
              Ver empresas
              <Building2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-eras-bold mb-6 text-gray-800">
              ¿Por qué elegir <span className="text-[#097EEC] font-eras-bold-italic">SUAREC</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-eras">
              Descubre las ventajas que nos hacen la plataforma preferida por profesionales y empresas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20">
              <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">Ofertas exclusivas</h3>
              <p className="text-gray-600 leading-relaxed font-eras">Accede a oportunidades laborales únicas que no encontrarás en otras plataformas. Trabajamos directamente con las mejores empresas.</p>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20">
              <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">Empresas verificadas</h3>
              <p className="text-gray-600 leading-relaxed font-eras">
                Todas nuestras empresas pasan por un riguroso proceso de verificación para garantizar las mejores condiciones laborales.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20">
              <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">Comunidad activa</h3>
              <p className="text-gray-600 leading-relaxed font-eras">
                Forma parte de una red de profesionales que comparten oportunidades, experiencias y crecen juntos.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20">
              <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">Seguridad garantizada</h3>
              <p className="text-gray-600 leading-relaxed font-eras">Tu información está protegida con los más altos estándares de seguridad y privacidad.</p>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20">
              <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">Proceso rápido</h3>
              <p className="text-gray-600 leading-relaxed font-eras">Conectamos profesionales con empresas en tiempo récord, sin trámites complicados.</p>
            </div>

            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20">
              <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">Calidad premium</h3>
              <p className="text-gray-600 leading-relaxed font-eras">Solo trabajamos con los mejores profesionales y las empresas más prestigiosas del mercado.</p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Sección de Alianzas */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-eras-bold mb-4 text-gray-800">Nuestras alianzas estratégicas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-eras">
              Trabajamos con empresas líderes para ofrecerte las mejores oportunidades laborales del mercado.
            </p>
          </div>

          {/* Carousel de Empresas Aliadas */}
          <CompaniesCarousel />

          <div className="text-center mt-8">
            <Link
              href="/companies"
              className="inline-flex items-center gap-3 bg-[#097EEC] text-white px-8 py-4 rounded-full text-lg font-eras-bold hover:bg-[#097EEC]/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver todas nuestras empresas aliadas
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#097EEC] to-[#097EEC] relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/3 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-eras-bold text-white mb-8">
              ¿Listo para encontrar tu próxima oportunidad?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed font-eras">
              Únete a miles de profesionales que ya han encontrado el trabajo de sus sueños con SUAREC.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link
                href="/auth/select-type"
                className="group bg-white text-[#097EEC] px-10 py-5 rounded-full text-xl font-eras-bold hover:bg-white/95 transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
              >
                Comenzar ahora
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/publications"
                className="group border-2 border-white/30 text-white px-8 py-5 rounded-full text-lg font-eras-medium hover:bg-white/10 hover:border-white/50 transition-all duration-300 flex items-center gap-3 backdrop-blur-sm"
              >
                Ver ofertas
                <Briefcase className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#097EEC] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              {/* <h3 className="text-3xl font-eras-bold mb-6">SUAREC</h3> */}
              <SuarecLogo width={120} height={50} className="mb-6" theme="dark" />
              <p className="text-white/80 max-w-md leading-relaxed mb-6 font-eras">
                Conectamos talento excepcional con oportunidades extraordinarias para crear un futuro laboral mejor en Colombia.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/80 font-eras">
                  <Heart className="h-5 w-5 text-white-300" />
                  <span>Hecho en Colombia, para Colombianos</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-eras-bold mb-6">Enlaces rápidos</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/publications" className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras">
                    <FileText className="h-4 w-4" />
                    Publicaciones
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras">
                    <Building2 className="h-4 w-4" />
                    Empresas
                  </Link>
                </li>
                <li>
                  <Link href="/auth/select-type" className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras">
                    <Users className="h-4 w-4" />
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-eras-bold mb-6">Contacto</h3>
              <ul className="space-y-3">
                <li className="text-white/80 font-eras">
                  <span className="block text-sm">Email</span>
                  <span className="text-white">soportesuarec@gmail.com</span>
                </li>
                <li className="text-white/80 font-eras">
                  <span className="block text-sm">Teléfono</span>
                  <span className="text-white">+57 314 6373088</span>
                </li>
                <li className="text-white/80 font-eras">
                  <span className="block text-sm">Ubicación</span>
                  <span className="text-white">Colombia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60 font-eras">
              © {new Date().getFullYear()} SUAREC. Todos los derechos reservados. |
              <a href="#" className="hover:text-white transition-colors ml-2" onClick={e => { e.preventDefault(); setPrivacyOpen(true); }}>Privacidad</a> |
              <a href="#" className="hover:text-white transition-colors ml-2" onClick={e => { e.preventDefault(); setTermsOpen(true); }}>Términos</a>
            </p>
          </div>
        </div>
      </footer>
      <TermsModal isOpen={isTermsOpen} onClose={() => setTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setPrivacyOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setContactOpen(false)} />
      <CookiesModal isOpen={isCookiesOpen} onClose={() => setCookiesOpen(false)} />
    </div>
  )
}