"use client";
import { useMemo } from "react";
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

  const topSequence = cardsData;
  const bottomSequence = [...cardsData.slice(3), ...cardsData.slice(0, 3)];
  const durationSeconds = 45;

  const topLoop = [...topSequence, ...topSequence];
  const bottomLoop = [...bottomSequence, ...bottomSequence];

  const renderCard = (card: Card, key: string) => {
    const Icon = card.icon;
    return (
      <div
        key={key}
        className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#097EEC]/20 w-[340px] flex-shrink-0 text-center flex flex-col items-center"
      >
        <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
          <Icon className="h-8 w-8 text-white" />
        </div>

        <h3 className="text-xl font-eras-bold mb-3 text-gray-800">
          {card.title}
        </h3>
        <p
          className="text-gray-600 leading-relaxed font-eras text-sm"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 4,
            overflow: "hidden",
          }}
        >
          {card.description}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8 overflow-hidden">
      <style jsx>{`
        @keyframes marquee-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        @keyframes marquee-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        .marquee-track {
          width: max-content;
          display: flex;
          gap: 2rem;
          will-change: transform;
          animation: marquee-left ${durationSeconds}s linear infinite;
        }

        .marquee-track-right {
          width: max-content;
          display: flex;
          gap: 2rem;
          will-change: transform;
          animation: marquee-right ${durationSeconds}s linear infinite;
        }

        .marquee:hover .marquee-track,
        .marquee:hover .marquee-track-right {
          animation-play-state: paused;
        }
      `}</style>

      {/* Fila superior - izquierda (avance normal) */}
      <div className="relative overflow-hidden marquee">
        <div className="marquee-track">
          {topLoop.map((c, idx) => renderCard(c, `top-${c.id}-${idx}`))}
        </div>
      </div>

      {/* Fila inferior - derecha */}
      <div className="relative overflow-hidden marquee">
        <div className="marquee-track-right">
          {bottomLoop.map((c, idx) => renderCard(c, `bottom-${c.id}-${idx}`))}
        </div>
      </div>
    </div>
  );
}
