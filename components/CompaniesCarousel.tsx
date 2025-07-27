"use client";

import React from "react";
import { Carousel } from "./ui/carousel";

export function CompaniesCarousel() {
  const companies = [
    {
      title: "Café y Fogón",
      src: "/CafeYFogon.png",
      button: "",
    },
    {
      title: "Enfacol",
      src: "/enfacol.png",
      button: "",
    },
    {
      title: "Olimpo Cocktail",
      src: "/OlimpoCocktail.png",
      button: "",
    },
    {
      title: "Veens",
      src: "/veens.png",
      button: "",
    },
  ];

  return (
    <div className="py-8 pb-16">
      <Carousel slides={companies} />
    </div>
  );
}
