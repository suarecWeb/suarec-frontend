"use client";

import React from "react";

const companies = [
  { title: "Café y Fogón", src: "/CafeYFogon.png", dark: false },
  { title: "Enfacol", src: "/enfacol.png", dark: false },
  { title: "Olimpo Cocktail", src: "/OlimpoCocktail.png", dark: false },
  { title: "Veens", src: "/veens.png", dark: true },
];

export function CompaniesCarousel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* ── Izquierda: cards de imagen 2×2 ── */}
      <div className="grid grid-cols-2 gap-4">
        {companies.map((company) => (
          <div
            key={company.title}
            className={`relative group rounded-2xl overflow-hidden cursor-pointer ${company.dark ? "bg-gray-900" : ""}`}
            style={{
              height: "190px",
              boxShadow: "0 4px 32px rgba(0,0,0,0.13)",
            }}
          >
            <img
              src={company.src}
              alt={company.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradiente permanente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Tinte azul en hover */}
            <div className="absolute inset-0 bg-[#097EEC]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Nombre */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
              <p className="text-white font-eras-bold text-sm md:text-base drop-shadow">
                {company.title}
              </p>
            </div>

            {/* Borde azul hover */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#097EEC] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ── Derecha: heading + logo cards ── */}
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
            oportunidades laborales del mercado.
          </p>
        </div>

        {/* Nombres como pills */}
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {companies.map((company) => (
            <span
              key={company.title}
              className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm font-eras-bold text-gray-700 shadow-sm"
            >
              {company.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
