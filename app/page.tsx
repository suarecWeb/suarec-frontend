"use client";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import CountdownTimer from "@/components/countdown-timer";
import SwiperAuto from "@/components/ui/SwiperAuto";
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
} from "lucide-react";
import logoImage from "@/public/CafeYFogon.png";
import logoImageDos from "@/public/veens.png";
import logoImageTres from "@/public/enfacol.png";
import logoImageCuatro from "@/public/OlimpoCocktail.png";
import ContactModal from "@/components/contact-modal";
import CookiesModal from "@/components/cookies-modal";
import { useState } from "react";
import SuarecLogo from "@/components/logo";
import { CompaniesCarousel } from "@/components/CompaniesCarousel";
import HeroSection from "@/components/HeroSection";
import StyleHome from "@/components/ui/StyleHome";

export default function Home() {
  const [isContactOpen, setContactOpen] = useState(false);
  const [isCookiesOpen, setCookiesOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isHomePage />

      {/* Hero Section Moderna */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#097EEC] overflow-hidden pt-20">
        {/* Contenido principal */}
        <HeroSection />

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
              ¿Por qué elegir{" "}
              <span className="text-[#097EEC] font-eras-bold-italic">
                SUAREC
              </span>{" "}
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-eras">
              Descubre las ventajas que nos hacen la plataforma preferida por
              profesionales y empresas
            </p>
          </div>

          <SwiperAuto />
        </div>
      </section>
      {/* Sección de Alianzas */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-eras-bold mb-4 text-gray-800">
              Nuestras alianzas estratégicas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-eras">
              Trabajamos con empresas líderes para ofrecerte las mejores
              oportunidades laborales del mercado.
            </p>
          </div>

          {/* Carousel de Empresas Aliadas */}
          <CompaniesCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 -mb-10 bg-gradient-to-br from-[#097EEC] to-[#097EEC] relative overflow-hidden">
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
              Contrata y vende servicios con personas y empresas verificadas,
              todo desde un solo lugar.
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
                Explorar servicios y empresas
                <Briefcase className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setContactOpen(false)}
      />
      <CookiesModal
        isOpen={isCookiesOpen}
        onClose={() => setCookiesOpen(false)}
      />
    </div>
  );
}
