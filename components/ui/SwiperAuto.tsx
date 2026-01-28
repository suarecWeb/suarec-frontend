"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Award,
  Briefcase,
  Building2,
  Shield,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Card = {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
};

export default function SwiperAuto() {
  const cardsData: Card[] = useMemo(
    () => [
      {
        id: 1,
        icon: Briefcase,
        title: "Ofertas exclusivas",
        description:
          "Accede a oportunidades laborales únicas que no encontrarás en otras plataformas. Trabajamos directamente con las mejores empresas.",
      },
      {
        id: 2,
        icon: Building2,
        title: "Empresas verificadas",
        description:
          "Todas nuestras empresas pasan por un riguroso proceso de verificación para garantizar las mejores condiciones laborales.",
      },
      {
        id: 3,
        icon: Users,
        title: "Comunidad activa",
        description:
          "Forma parte de una red de profesionales que comparten oportunidades, experiencias y crecen juntos.",
      },
      {
        id: 4,
        icon: Shield,
        title: "Seguridad garantizada",
        description:
          "Tu información está protegida con los más altos estándares de seguridad y privacidad.",
      },
      {
        id: 5,
        icon: Zap,
        title: "Proceso rápido",
        description:
          "Conectamos profesionales con empresas en tiempo récord, sin trámites complicados.",
      },
      {
        id: 6,
        icon: Award,
        title: "Calidad premium",
        description:
          "Solo trabajamos con los mejores profesionales y las empresas más prestigiosas del mercado.",
      },
    ],
    [],
  );

  const [angle, setAngle] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useMemo(() => ({ current: 0 }), []);
  const lastTimeRef = useMemo(() => ({ current: 0 }), []);

  // Continuous animation loop
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== 0 && !isPaused) {
        const delta = time - lastTimeRef.current;
        // Ajustar velocidad aquí (0.0005 es lento/fluido)
        setAngle((prev) => prev - delta * 0.0005);
      }
      lastTimeRef.current = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [isPaused, lastTimeRef, animationRef]);

  const getCardStyle = (index: number) => {
    const total = cardsData.length;
    const theta = angle + index * ((2 * Math.PI) / total);

    // Coordenadas circulares (cilindro)
    // x = sin(theta) * radio (movimiento horizontal)
    // z = cos(theta) * radio (profundidad, determina escala/zIndex)
    const radius = 380; // Radio del carrusel
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta); // -1 (atrás) a 1 (adelante)

    // Escala basada en profundidad (z)
    // Cuando z es 1 (frente), escala es 1.1
    // Cuando z es -1 (atrás), escala es 0.7
    const scale = 0.9 + z * 0.2;

    // Opacidad (desvanece atrás)
    const opacity = 0.5 + (z + 1) * 0.25; // rango 0.5 a 1.0

    // zIndex para superposición correcta
    const zIndex = Math.round((z + 1) * 50);

    return {
      transform: `translateX(${x}px) scale(${scale}) perspective(1000px)`,
      zIndex,
      opacity,
      // No usamos transition aquí para movimiento fluido frame-a-frame
      // transition: "transform 0.1s linear",
    };
  };

  const handleClick = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div
      className="relative h-[450px] w-full max-w-6xl mx-auto flex items-center justify-center overflow-hidden"
      onClick={handleClick}
    >
      {/* Container for cards - centered */}
      <div className="relative w-full h-full flex items-center justify-center">
        {cardsData.map((card, index) => {
          const style = getCardStyle(index);
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="absolute bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center hover:border-[#097EEC]/30 cursor-pointer"
              style={{
                ...style,
                width: "260px",
                height: "380px",
                willChange: "transform, opacity", // Optimización render
              }}
            >
              <div className="bg-gradient-to-br from-[#097EEC] to-[#005bb5] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-lg shadow-[#097EEC]/20">
                <Icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="text-xl font-eras-bold mb-4 text-gray-800 px-2 leading-tight">
                {card.title}
              </h3>
              <p
                className="text-gray-600 leading-relaxed font-eras text-sm px-2"
                style={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 5,
                  overflow: "hidden",
                }}
              >
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
