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
      <div className="mb-6">
        <SuarecLogo
          width={550}
          height={100}
          className="mx-auto mb-5 w-[65%] md:w-[45%] drop-shadow-2xl"
          theme="dark"
        />
        <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent mx-auto" />
      </div>

      {/* Subtítulo elegante */}
      <div className="max-w-3xl mx-auto mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-[2.1rem] font-eras text-white/90 leading-relaxed">
          Conectamos{" "}
          <span className="font-eras-bold-italic text-white">
            talento excepcional
          </span>{" "}
          con{" "}
          <span className="font-eras-bold-italic text-white">
            oportunidades extraordinarias
          </span>
        </h2>
      </div>

      {/* Descripción minimalista */}
      <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-10 font-eras leading-relaxed">
        La plataforma donde los mejores profesionales encuentran{" "}
        <span className="font-eras-bold text-white">
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
          className="group bg-white text-[#097EEC] px-10 py-5 rounded-full text-lg font-eras-bold hover:bg-white/95 transition-colors duration-300 flex items-center gap-3 shadow-2xl"
        >
          Comenzar ahora
          <ArrowRight className="h-5 w-5" />
        </Link>

        <Link
          href="/companies"
          className="group border-2 border-white/30 text-white px-6 py-5 rounded-full text-base font-eras-medium hover:bg-white/10 hover:border-white/50 transition-colors duration-300 flex items-center gap-3 backdrop-blur-sm"
        >
          Ver empresas
          <Building2 className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
