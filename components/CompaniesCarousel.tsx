"use client";

import React from "react";

const companies = [
  {
    title: "Café y Fogón",
    src: "/CafeYFogon.png",
    description:
      "Gastronomía y hospitalidad con oportunidades únicas en el sector de alimentos y bebidas.",
  },
  {
    title: "Enfacol",
    src: "/enfacol.png",
    description:
      "Empresa líder en servicios de salud y bienestar laboral para profesionales del sector.",
  },
  {
    title: "Olimpo Cocktail",
    src: "/OlimpoCocktail.png",
    description:
      "Entretenimiento y mixología premium, conectando talentos con experiencias únicas.",
  },
  {
    title: "Veens",
    src: "/veens.png",
    description:
      "Innovación y tecnología aplicada a nuevas oportunidades de crecimiento profesional.",
  },
];

export function CompaniesCarousel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* ── Grid 2×2 de empresas (izquierda) ── */}
      <div className="grid grid-cols-2 gap-3">
        {companies.map((company) => (
          <div
            key={company.title}
            className={`relative group rounded-2xl overflow-hidden cursor-pointer ${company.title === "Veens" ? "bg-gray-900" : ""}`}
            style={{
              height: "160px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            }}
          >
            {/* Imagen de fondo */}
            <img
              src={company.src}
              alt={company.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay base — gradiente sutil siempre visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-300" />

            {/* Overlay hover — se intensifica al pasar el mouse */}
            <div className="absolute inset-0 bg-[#097EEC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Nombre empresa — siempre visible abajo */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white font-eras-bold text-sm md:text-base leading-tight drop-shadow-sm">
                {company.title}
              </p>
            </div>

            {/* Borde azul en hover */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#097EEC] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ── Texto descriptivo (derecha) ── */}
      <div className="space-y-8 text-center lg:text-left">
        <div>
          <p className="text-[#097EEC] text-xs font-eras uppercase tracking-widest mb-3">
            Alianzas estratégicas
          </p>
          <h2 className="text-3xl lg:text-4xl font-eras-bold text-gray-800 mb-4 leading-tight">
            Nuestras alianzas estratégicas
          </h2>
          <p className="text-lg text-gray-500 font-eras leading-relaxed max-w-lg mx-auto lg:mx-0">
            Trabajamos con empresas líderes para ofrecerte las mejores
            oportunidades laborales del mercado. Cada alianza está pensada para
            abrirte puertas y potenciar tu carrera profesional.
          </p>
        </div>

        {/* Lista de empresas con ícono */}
        <div className="grid grid-cols-2 gap-4 mx-auto lg:mx-0">
          {companies.map((company) => {
            const isVeens = company.title === "Veens";
            return (
              <div
                key={company.title}
                className="flex flex-col gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-[#097EEC]/30 transition-all duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center border ${
                    isVeens
                      ? "bg-gray-900 border-gray-800"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <img
                    src={company.src}
                    alt={company.title}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-eras-bold text-gray-800 leading-tight mb-1">
                    {company.title}
                  </p>
                  <p className="text-sm text-gray-500 font-eras leading-snug">
                    {company.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
