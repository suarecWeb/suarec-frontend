"use client";
import Navbar from "@/components/navbar";
import SwiperAuto from "@/components/ui/SwiperAuto";
import ContactModal from "@/components/contact-modal";
import CookiesModal from "@/components/cookies-modal";
import AppDownloadBanner from "@/components/AppDownloadBanner";
import Iridescence from "@/components/Iridescence";
import { useState } from "react";
import { CompaniesCarousel } from "@/components/CompaniesCarousel";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  const [isContactOpen, setContactOpen] = useState(false);
  const [isCookiesOpen, setCookiesOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isHomePage />

      {/* Hero Section Moderna */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Iridescence shader de fondo */}
        <div className="absolute inset-0 z-0">
          <Iridescence
            color={[0, 0.6, 0.9]}
            mouseReact
            amplitude={0.1}
            speed={1}
          />
        </div>

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
          <CompaniesCarousel />
        </div>
      </section>

      {/* App Download Banner */}
      <AppDownloadBanner />

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
