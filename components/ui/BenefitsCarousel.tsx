"use client";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Building2,
  Users,
  Shield,
  Zap,
  Award,
  LucideIcon,
} from "lucide-react";

type CardData = {
  id: number;
  icon: LucideIcon;
  title: string;
  description: string;
};

const cardsData: CardData[] = [
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
];

export default function BenefitsCarousel() {
  const [topRow, setTopRow] = useState([
    cardsData[0],
    cardsData[1],
    cardsData[2],
  ]);
  const [bottomRow, setBottomRow] = useState([
    cardsData[3],
    cardsData[4],
    cardsData[5],
  ]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Esperar a que el componente se monte completamente
    const initTimeout = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(initTimeout);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      setTopRow((prev) => {
        const newTop = [...prev];
        const movedCard = newTop.shift(); // Quita la primera card de arriba

        setBottomRow((prevBottom) => {
          const newBottom = [...prevBottom];
          const movedBottomCard = newBottom.shift(); // Quita la primera card de abajo
          if (movedCard) newBottom.push(movedCard); // La card de arriba va al final de abajo

          if (movedBottomCard) newTop.push(movedBottomCard); // La card de abajo va al final de arriba
          return newBottom;
        });

        return newTop;
      });
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, [isInitialized]);

  const renderCard = (card: CardData) => {
    const Icon = card.icon;
    return (
      <div
        key={card.id}
        className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-[#097EEC]/20 flex-1 min-w-[280px]"
      >
        <div className="bg-gradient-to-br from-[#097EEC] to-[#097EEC] rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-2xl font-eras-bold mb-4 text-gray-800">
          {card.title}
        </h3>
        <p className="text-gray-600 leading-relaxed font-eras">
          {card.description}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Fila superior */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {topRow.map((card) => renderCard(card))}
      </div>

      {/* Fila inferior */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bottomRow.map((card) => renderCard(card))}
      </div>
    </div>
  );
}
