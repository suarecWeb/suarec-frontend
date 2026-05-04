"use client";
import Navbar from "@/components/navbar";
import SwiperAuto from "@/components/ui/SwiperAuto";
import ContactModal from "@/components/contact-modal";
import CookiesModal from "@/components/cookies-modal";
import AppDownloadBanner from "@/components/AppDownloadBanner";
import { useState } from "react";
import { CompaniesCarousel } from "@/components/CompaniesCarousel";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  const [isContactOpen, setContactOpen] = useState(false);
  const [isCookiesOpen, setCookiesOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar isHomePage />

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #1a8ff5 0%, #097EEC 55%, #065fad 100%)",
        }}
      >
        <HeroSection />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── Divisor hero → beneficios ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#097EEC]/20 to-transparent" />

      {/* ── Beneficios ── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[#097EEC] text-xs font-eras uppercase tracking-widest mb-4">
              Por qué elegirnos
            </span>
            <h2 className="text-4xl md:text-5xl font-eras-bold text-gray-800 leading-tight mb-5">
              ¿Por qué elegir{" "}
              <span className="text-[#097EEC] font-eras-bold-italic">
                SUAREC
              </span>{" "}
              ?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-eras leading-relaxed">
              Descubre las ventajas que nos hacen la plataforma preferida por
              profesionales y empresas en Colombia.
            </p>
          </div>
          <SwiperAuto />
        </div>
      </section>

      {/* ── Divisor beneficios → alianzas ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* ── Alianzas ── */}
      <section className="py-24 bg-[#f8faff]">
        <div className="container mx-auto px-6">
          <CompaniesCarousel />
        </div>
      </section>

      {/* ── Descarga la app ── */}
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
