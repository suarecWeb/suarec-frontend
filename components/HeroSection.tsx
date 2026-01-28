"use client";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import SuarecLogo from "@/components/logo";

export default function HeroSection() {
  return (
    <div className="relative z-10 container mx-auto px-4 text-center mt-4 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
      {/* Contador regresivo */}
      {/* <CountdownTimer /> */}

      {/* Logo/Título principal */}
      <div className="mb-8">
        <SuarecLogo
          width={550}
          height={100}
          className="mx-auto mb-4 w-[70%] drop-shadow-2xl"
          theme="dark"
        />
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-3"></div>
        <div className="w-12 h-1 bg-white/30 mx-auto"></div>
      </div>

      {/* Subtítulo elegante */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-eras text-white leading-relaxed">
          Conectamos{" "}
          <span className="font-eras-bold-italic text-white">
            talento excepcional
          </span>
          <br />
          <span className="text-white font-eras-bold-italic">
            con oportunidades extraordinarias
          </span>
        </h2>
      </div>

      {/* Descripción minimalista */}
      <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-8 font-eras leading-relaxed">
        La plataforma donde los mejores profesionales encuentran
        <br />
        <span className="font-eras-bold">
          las empresas que transformarán su carrera.
        </span>
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
  );
}
