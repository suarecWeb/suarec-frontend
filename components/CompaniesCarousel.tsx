"use client";

import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { ImageWithFallback } from "./ui/ImageWithFallback";
import { Building2 } from "lucide-react";

export function CompaniesCarousel() {
  const companies = [
    {
      title: "Café y Fogón",
      image: "https://xkwybhxcytfhnqrdvcel.supabase.co/storage/v1/object/public/suarec-media/empresas-aliadas/CafeYFogon.png",
      description: "Gastronomía de calidad con los mejores sabores colombianos"
    },
    {
      title: "Enfacol",
      image: "https://xkwybhxcytfhnqrdvcel.supabase.co/storage/v1/object/public/suarec-media/empresas-aliadas/enfacol.png",
      description: "Soluciones empresariales"
    },
    {
      title: "Olimpo Cocktail",
      image: "https://xkwybhxcytfhnqrdvcel.supabase.co/storage/v1/object/public/suarec-media/empresas-aliadas/OlimpoCocktail.png",
      description: "Cócteles únicos y deliciosos"
    },
    {
      title: "Veens",
      image: "https://xkwybhxcytfhnqrdvcel.supabase.co/storage/v1/object/public/suarec-media/empresas-aliadas/veens.png",
      description: ""
    }
  ];

  return (
    <div className="h-[300px] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={companies}
        direction="right"
        speed="slow"
        className="w-full"
      />
    </div>
  );
} 