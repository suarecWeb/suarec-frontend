"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { ImageWithFallback } from "./ImageWithFallback";
import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className,
}: {
  items: {
    title: string;
    image: string;
    description?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow" | "very-slow" | "ultra-slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    addAnimation();
  }, [isMobile]); // Re-ejecutar cuando cambie el estado móvil

  const [start, setStart] = useState(false);
  
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }
  
  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards",
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse",
        );
      }
    }
  };
  
  const getSpeed = () => {
    if (containerRef.current) {
      // En móviles, usar velocidad "fast" sin importar el prop speed
      const effectiveSpeed = isMobile ? "fast" : speed;
      
      if (effectiveSpeed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else if (effectiveSpeed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      } else if (effectiveSpeed === "slow") {
        containerRef.current.style.setProperty("--animation-duration", "120s");
      } else if (effectiveSpeed === "very-slow") {
        containerRef.current.style.setProperty("--animation-duration", "180s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "300s");
      }
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-b-0 border-zinc-200 bg-white shadow-lg overflow-hidden md:w-[400px] lg:w-[450px] hover:shadow-xl transition-shadow duration-300"
            key={idx}
          >
            <div className="relative">
              <ImageWithFallback
                src={item.image}
                alt={item.title}
                width={450}
                height={288}
                className="w-full h-64 md:h-72 object-cover"
                fallbackIcon={<Building2 className="w-8 h-8" />}
                fallbackText="Empresa"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-base text-white/90 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 