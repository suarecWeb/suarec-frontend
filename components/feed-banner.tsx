"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import PublicationService from "@/services/PublicationsService";

interface FeedBannerProps {
  className?: string;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string;
}

interface CategoryKPI {
  name: string;
  originalName: string;
  count: number;
  imagePath: string;
  color: string;
  bgColor: string;
}

// Componente individual para cada slide de categoría
interface CategorySlideProps {
  category: CategoryKPI;
  index: number;
  current: number;
  isSelected: boolean;
  onCategoryClick: (category: string) => void;
}

const CategorySlide = ({
  category,
  index,
  current,
  isSelected,
  onCategoryClick,
}: CategorySlideProps) => {
  const totalItems = 11; // Número total de categorías
  const angle = (360 / totalItems) * index;
  const currentAngle = (360 / totalItems) * current;
  const relativeAngle = angle - currentAngle;

  // Calcular la posición en el círculo expandido para ocupar más ancho
  const radius = 480; // Aumentado para expandir más el carousel
  const x = Math.sin((relativeAngle * Math.PI) / 180) * radius;
  const z = Math.cos((relativeAngle * Math.PI) / 180) * radius;

  // Calcular opacidad y escala basada en la posición Z
  const opacity = Math.max(0.15, (z + radius) / (radius * 2));
  const scale = Math.max(0.5, (z + radius) / (radius * 2));

  return (
    <div
      className="absolute transition-all duration-700 ease-out"
      style={{
        transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
        opacity: opacity,
        zIndex: Math.round(z + radius),
      }}
    >
      <div
        onClick={() => onCategoryClick(category.originalName.toUpperCase())}
        className={`relative w-32 h-40 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
          isSelected
            ? "bg-[#097EEC] shadow-lg shadow-blue-200"
            : "bg-transparent hover:shadow-md"
        }`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-between px-2 py-3">
          <div className="w-24 h-24 flex items-center justify-center flex-shrink-0">
            <Image
              src={category.imagePath}
              alt={category.name}
              width={80}
              height={80}
              className="w-24 h-24 object-contain"
            />
          </div>
          <h3
            className={`font-medium text-sm text-center leading-tight px-1 ${isSelected ? "text-white" : "text-gray-600"}`}
          >
            {category.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

const FeedBanner: React.FC<FeedBannerProps> = ({
  className = "",
  onCategoryClick,
  selectedCategory,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  // Mapeo de categorías a imágenes y colores
  const getCategoryConfig = (category: string) => {
    const categoryLower = category.toLowerCase();

    if (
      categoryLower.includes("tecnologia") ||
      categoryLower.includes("tech")
    ) {
      return {
        imagePath: "/categories/teknoloyia.png",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    }
    if (
      categoryLower.includes("construccion") ||
      categoryLower.includes("obra")
    ) {
      return {
        imagePath: "/categories/construccion.png",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    }
    if (categoryLower.includes("salud") || categoryLower.includes("medic")) {
      return {
        imagePath: "/categories/salud.png",
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    }
    if (
      categoryLower.includes("educacion") ||
      categoryLower.includes("enseñanza")
    ) {
      return {
        imagePath: "/categories/educacion.png",
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    }
    if (
      categoryLower.includes("servicios") ||
      categoryLower.includes("servic")
    ) {
      return {
        imagePath: "/categories/servicios.png",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      };
    }
    if (
      categoryLower.includes("gastronomia") ||
      categoryLower.includes("comida")
    ) {
      return {
        imagePath: "/categories/gastro.png",
        color: "text-pink-600",
        bgColor: "bg-pink-50",
      };
    }
    if (
      categoryLower.includes("transporte") ||
      categoryLower.includes("vehiculo")
    ) {
      return {
        imagePath: "/categories/el transportador.png",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    }
    if (
      categoryLower.includes("manufactura") ||
      categoryLower.includes("fabric")
    ) {
      return {
        imagePath: "/categories/manufactureiro.png",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
    }
    if (
      categoryLower.includes("finanzas") ||
      categoryLower.includes("financ")
    ) {
      return {
        imagePath: "/categories/finanzas.png",
        color: "text-blue-700",
        bgColor: "bg-blue-50",
      };
    }
    if (
      categoryLower.includes("agricultura") ||
      categoryLower.includes("agro")
    ) {
      return {
        imagePath: "/categories/agricultura.png",
        color: "text-green-700",
        bgColor: "bg-green-50",
      };
    }
    if (categoryLower.includes("otro")) {
      return {
        imagePath: "/categories/otros.png",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
    }

    // Default
    return {
      imagePath: "/categories/otros.png",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    };
  };

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        setLoading(true);

        // Obtener categorías disponibles
        const categoriesResponse =
          await PublicationService.getAvailableCategories();
        const availableCategories = categoriesResponse.data;

        // Crear stats para categorías (el backend ya debe normalizar)
        const mockStats: CategoryKPI[] = availableCategories.map(
          (category: string) => {
            const config = getCategoryConfig(category);
            return {
              name:
                category.charAt(0).toUpperCase() +
                category.slice(1).toLowerCase(),
              originalName: category, // Mantener el nombre original para el filtrado
              // FUNCION PARA MOSTRAR EN UN FUTURO LA CANTIDAD DE SERVICIOS POR CATEGORIA
              // count: Math.floor(Math.random() * 50) + 5, // Datos simulados
              count: 0, // Temporalmente sin mostrar números
              imagePath: config.imagePath,
              color: config.color,
              bgColor: config.bgColor,
            };
          },
        );

        setCategoryStats(mockStats);
        setCategories(availableCategories);
      } catch (error) {
        console.error("Error loading category stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  // Funciones del carousel
  const handlePrevious = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? categoryStats.length - 1 : previous);
  };

  const handleNext = () => {
    const next = current + 1;
    setCurrent(next === categoryStats.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = x - startX.current;

    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
      isDragging.current = false;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const id = useId();

  if (loading) {
    return (
      <div className={`w-full bg-transparent px-2 py-6 mb-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6 px-4">
          <TrendingUp className="h-5 w-5 text-[#097EEC]" />
          <h3 className="text-lg font-semibold text-gray-900">Categorias</h3>
        </div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 px-2">
              <div className="animate-pulse bg-gray-200 rounded-xl w-24 h-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-transparent px-2 py-6 mb-6 transition-all duration-500 ${className}`}
    >
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">Categorías</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-[#097EEC] hover:text-blue-700 font-medium transition-colors"
        >
          {isExpanded ? "Ver menos" : "Ver más"}
        </button>
      </div>

      {isExpanded ? (
        /* Vista expandida - Grid horizontal */
        <div className="relative">
          {/* Botones de navegación */}
          {categoryStats.length > 1 && (
            <>
              <button
                onClick={() => {
                  const container =
                    document.getElementById("category-carousel");
                  if (container) {
                    container.scrollBy({ left: -200, behavior: "smooth" });
                  }
                }}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border border-gray-200"
                aria-label="Categoría anterior"
              >
                <ChevronLeft className="w-5 h-5 text-[#097EEC]" />
              </button>
              <button
                onClick={() => {
                  const container =
                    document.getElementById("category-carousel");
                  if (container) {
                    container.scrollBy({ left: 200, behavior: "smooth" });
                  }
                }}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border border-gray-200"
                aria-label="Siguiente categoría"
              >
                <ChevronRight className="w-5 h-5 text-[#097EEC]" />
              </button>
            </>
          )}

          {/* Contenedor de categorías */}
          <div
            id="category-carousel"
            className="flex gap-4 px-12 py-8 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categoryStats.map((category, index) => {
              const isSelected =
                selectedCategory === category.originalName.toUpperCase();
              return (
                <div
                  key={index}
                  onClick={() =>
                    onCategoryClick?.(category.originalName.toUpperCase())
                  }
                  className={`relative flex-shrink-0 w-28 sm:w-32 md:w-36 h-36 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isSelected
                      ? "bg-[#097EEC] shadow-lg shadow-blue-200"
                      : "bg-transparent hover:shadow-md"
                  }`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-between px-2 py-3">
                    <div className="w-20 h-20 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={category.imagePath}
                        alt={category.name}
                        width={72}
                        height={80}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <h3
                      className={`font-medium text-sm text-center leading-tight px-1 ${isSelected ? "text-white" : "text-gray-700"}`}
                    >
                      {category.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vista colapsada - Carousel 3D */
        <div className="relative">
          <div
            ref={carouselRef}
            className="relative h-60 w-full overflow-visible"
            style={{
              perspective: "1500px",
              transformStyle: "preserve-3d",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              {categoryStats.map((category, index) => {
                const isSelected =
                  selectedCategory === category.originalName.toUpperCase();
                return (
                  <CategorySlide
                    key={index}
                    category={category}
                    index={index}
                    current={current}
                    isSelected={isSelected}
                    onCategoryClick={(cat) => {
                      onCategoryClick?.(cat);
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Botones de navegación */}
          {categoryStats.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border border-gray-200"
                aria-label="Categoría anterior"
              >
                <ChevronLeft className="w-5 h-5 text-[#097EEC]" />
              </button>
              <button
                onClick={handleNext}
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 z-10 border border-gray-200"
                aria-label="Siguiente categoría"
              >
                <ChevronRight className="w-5 h-5 text-[#097EEC]" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedBanner;
