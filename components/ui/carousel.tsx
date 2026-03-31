"use client";
import { useState, useRef, useId, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   Tipos compartidos
───────────────────────────────────────── */
interface SlideData {
  title: string;
  button: string;
  src: string;
  description?: string;
}

/* ═══════════════════════════════════════════
   CAROUSEL 3D  (nuevo)
═══════════════════════════════════════════ */

/** Posición 3D de cada card según su offset relativo al activo */
const POSITIONS = [
  // 0 → Frontal (activo)
  { transform: "translateZ(120px) rotateY(0deg)", opacity: 1, zIndex: 4 },
  // 1 → Derecha
  {
    transform: "translateX(160px) translateZ(40px) rotateY(38deg)",
    opacity: 0.75,
    zIndex: 3,
  },
  // 2 → Fondo
  {
    transform: "translateZ(-80px) rotateY(0deg) scale(0.82)",
    opacity: 0.35,
    zIndex: 1,
  },
  // 3 → Izquierda
  {
    transform: "translateX(-160px) translateZ(40px) rotateY(-38deg)",
    opacity: 0.75,
    zIndex: 3,
  },
];

interface Card3DProps {
  slide: SlideData;
  relPos: number; // 0=front 1=right 2=back 3=left
  onClick: () => void;
}

const Card3D = ({ slide, relPos, onClick }: Card3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>();
  const isActive = relPos === 0;

  /* RAF para suavizar el parallax del mouse */
  useEffect(() => {
    if (!isActive) return;
    const animate = () => {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--mx", `${xRef.current}px`);
        cardRef.current.style.setProperty("--my", `${yRef.current}px`);
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isActive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    xRef.current = e.clientX - (r.left + r.width / 2);
    yRef.current = e.clientY - (r.top + r.height / 2);
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const pos = POSITIONS[relPos];

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute w-[35vmin] h-[35vmin] rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        /* Centrado en el contenedor */
        top: "50%",
        left: "50%",
        marginTop: "calc(-35vmin / 2)",
        marginLeft: "calc(-35vmin / 2)",
        /* Posición 3D */
        transform: pos.transform,
        opacity: pos.opacity,
        zIndex: pos.zIndex,
        transition:
          "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease",
        boxShadow: isActive
          ? "0 25px 50px -12px rgba(0,0,0,0.45), 0 0 30px rgba(9,126,236,0.25)"
          : "0 10px 30px -10px rgba(0,0,0,0.3)",
      }}
    >
      {/* Fondo imagen con parallax en activo */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-300"
        style={{
          transform: isActive
            ? "translate3d(calc(var(--mx, 0px) / 30), calc(var(--my, 0px) / 30), 0)"
            : "none",
        }}
      >
        <img
          src={slide.src}
          alt={slide.title}
          className="w-[110%] h-[110%] object-cover"
          style={{ marginLeft: "-5%", marginTop: "-5%" }}
          loading="eager"
        />
        {/* Overlay gradiente */}
        <div
          className="absolute inset-0"
          style={{
            background: isActive
              ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)"
              : "rgba(15,20,40,0.55)",
          }}
        />
      </div>

      {/* Título solo en activo */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-white font-eras-bold text-lg md:text-xl drop-shadow-lg">
            {slide.title}
          </h2>
        </div>
      )}

      {/* Borde sutil activo */}
      {isActive && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-[#097EEC]/50 pointer-events-none" />
      )}
    </div>
  );
};

interface Carousel3DProps {
  slides: SlideData[];
}

export function Carousel3D({ slides }: Carousel3DProps) {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const handlePrev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  /* Auto-rotate cada 3.5s */
  useEffect(() => {
    const t = setInterval(handleNext, 3500);
    return () => clearInterval(t);
  }, [handleNext]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Escena 3D */}
      <div
        className="relative select-none"
        style={{
          width: "35vmin",
          height: "35vmin",
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {slides.map((slide, i) => {
            const relPos = (i - current + total) % total;
            return (
              <Card3D
                key={i}
                slide={slide}
                relPos={relPos}
                onClick={() => setCurrent(i)}
              />
            );
          })}
        </div>
      </div>

      {/* Controles: flechas + dots */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-[#097EEC] hover:border-[#097EEC] hover:text-white text-gray-500 flex items-center justify-center shadow-sm transition-all duration-200"
          aria-label="Anterior"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i
                  ? "bg-[#097EEC] w-6"
                  : "bg-gray-300 w-2 hover:bg-gray-400"
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-[#097EEC] hover:border-[#097EEC] hover:text-white text-gray-500 flex items-center justify-center shadow-sm transition-all duration-200"
          aria-label="Siguiente"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CAROUSEL ORIGINAL (se conserva tal cual)
═══════════════════════════════════════════ */

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      slideRef.current.style.setProperty("--x", `${xRef.current}px`);
      slideRef.current.style.setProperty("--y", `${yRef.current}px`);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, title } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[35vmin] h-[35vmin] mx-[4vmin] z-10 cursor-pointer hover:scale-110 hover:z-20"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-2xl"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(109,100,247,0.3)",
          }}
        >
          <img
            className="absolute inset-0 w-[120%] h-[120%] object-cover transition-opacity duration-600 ease-in-out"
            style={{ opacity: current === index ? 1 : 0.5 }}
            alt={title}
            src={src}
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />
          {current === index && (
            <div className="absolute inset-0 bg-black/30 transition-all duration-1000" />
          )}
        </div>
        <article
          className={`relative p-[4vmin] transition-opacity duration-1000 ease-in-out ${
            current === index ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <h2 className="text-lg md:text-2xl lg:text-4xl font-semibold">
            {title}
          </h2>
        </article>
      </li>
    </div>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handlePrevious = () =>
    setCurrent((c) => (c - 1 < 0 ? slides.length - 1 : c - 1));
  const handleNext = () =>
    setCurrent((c) => (c + 1 === slides.length ? 0 : c + 1));
  const handleSlideClick = (index: number) => {
    if (current !== index) setCurrent(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const walk = e.pageX - startX.current;
    if (Math.abs(walk) > 50) {
      walk > 0 ? handlePrevious() : handleNext();
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

  return (
    <div
      ref={carouselRef}
      className="relative w-[35vmin] h-[35vmin] mx-auto select-none"
      aria-labelledby={`carousel-heading-${id}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>
      <div className="absolute flex justify-center gap-2 w-full top-[calc(100%+2rem)]">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-[#6D64F7] w-8"
                : "bg-neutral-400 hover:bg-neutral-500"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
