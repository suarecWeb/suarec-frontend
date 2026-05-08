"use client";

import { Briefcase, Users, FileText } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";

interface Contract {
  id: string;
}

interface KPIsProps {
  contracts: {
    asClient: Contract[];
    asProvider: Contract[];
  };
  activeTab: "client" | "provider" | "all";
  setActiveTab: (tab: "client" | "provider" | "all") => void;
  clientContent?: React.ReactNode;
  providerContent?: React.ReactNode;
  allContent?: React.ReactNode;
}

const TAB_CONFIG = [
  {
    key: "client" as const,
    label: "Contrataciones Solicitadas",
    sublabel: "Como cliente",
    Icon: Briefcase,
    accentColor: "#5a93fc",
    iconBg: "rgba(90, 147, 252, 0.1)",
    iconColor: "#5a93fc",
    activeBorder: "rgba(90, 147, 252, 0.35)",
    activeGlow: "rgba(90, 147, 252, 0.15)",
    dotColor: "#5a93fc",
  },
  {
    key: "provider" as const,
    label: "Servicios Ofrecidos",
    sublabel: "Como proveedor",
    Icon: Users,
    accentColor: "#097EEC",
    iconBg: "rgba(9, 126, 236, 0.1)",
    iconColor: "#097EEC",
    activeBorder: "rgba(9, 126, 236, 0.35)",
    activeGlow: "rgba(9, 126, 236, 0.15)",
    dotColor: "#097EEC",
  },
  {
    key: "all" as const,
    label: "Total de Contratos",
    sublabel: "Actividad total",
    Icon: FileText,
    accentColor: "#2563eb",
    iconBg: "rgba(37, 99, 235, 0.1)",
    iconColor: "#2563eb",
    activeBorder: "rgba(37, 99, 235, 0.35)",
    activeGlow: "rgba(37, 99, 235, 0.15)",
    dotColor: "#2563eb",
  },
] as const;

// ── Responsive: retorna valores dinámicos según ancho ──────────
function useResponsiveCarousel() {
  const [sizes, setSizes] = useState({
    cardW: 180,
    gap: 210,
    farGap: 370,
    containerH: 240,
    iconZone: 90,
    iconSize: 34,
    iconPad: 14,
    numSize: 34,
    labelSize: 11,
    isMobile: false,
  });

  const calc = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1200) {
      setSizes({
        cardW: 180,
        gap: 210,
        farGap: 370,
        containerH: 240,
        iconZone: 90,
        iconSize: 34,
        iconPad: 14,
        numSize: 34,
        labelSize: 11,
        isMobile: false,
      });
    } else if (w >= 900) {
      setSizes({
        cardW: 165,
        gap: 185,
        farGap: 325,
        containerH: 225,
        iconZone: 82,
        iconSize: 30,
        iconPad: 12,
        numSize: 30,
        labelSize: 10,
        isMobile: false,
      });
    } else if (w >= 640) {
      setSizes({
        cardW: 145,
        gap: 158,
        farGap: 275,
        containerH: 210,
        iconZone: 74,
        iconSize: 28,
        iconPad: 11,
        numSize: 28,
        labelSize: 10,
        isMobile: false,
      });
    } else {
      // Móvil: solo card activa visible, sin laterales
      setSizes({
        cardW: 150,
        gap: 0,
        farGap: 0,
        containerH: 175,
        iconZone: 65,
        iconSize: 26,
        iconPad: 11,
        numSize: 28,
        labelSize: 10,
        isMobile: true,
      });
    }
  }, []);

  useEffect(() => {
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [calc]);

  return sizes;
}

// ── Transforms: en móvil solo se ve la activa, en desktop carrusel 3D ──
function getCardTransform(
  offset: number,
  gap: number,
  farGap: number,
  isMobile: boolean,
): React.CSSProperties {
  // ── MOBILE: solo la card activa visible ──
  if (isMobile) {
    if (offset === 0) {
      return {
        transform: "translateX(0px) scale(1)",
        zIndex: 10,
        opacity: 1,
        pointerEvents: "auto",
      };
    }
    // Las demás se esconden fuera con transición
    return {
      transform: `translateX(${offset > 0 ? "120%" : "-120%"}) scale(0.85)`,
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
    };
  }

  // ── DESKTOP: carrusel 3D ──
  if (offset === 0) {
    return {
      transform: "translateX(0px) scale(1.06) rotateY(0deg)",
      zIndex: 10,
      opacity: 1,
      filter: "brightness(1)",
      pointerEvents: "auto",
    };
  }
  if (offset === -1) {
    return {
      transform: `translateX(-${gap}px) scale(0.88) rotateY(28deg)`,
      zIndex: 15,
      opacity: 0.85,
      filter: "brightness(0.92)",
      pointerEvents: "auto",
    };
  }
  if (offset === 1) {
    return {
      transform: `translateX(${gap}px) scale(0.88) rotateY(-28deg)`,
      zIndex: 15,
      opacity: 0.85,
      filter: "brightness(0.92)",
      pointerEvents: "auto",
    };
  }
  if (offset === -2) {
    return {
      transform: `translateX(-${farGap}px) scale(0.76) rotateY(40deg)`,
      zIndex: 20,
      opacity: 0.55,
      filter: "brightness(0.82)",
      pointerEvents: "auto",
    };
  }
  if (offset === 2) {
    return {
      transform: `translateX(${farGap}px) scale(0.76) rotateY(-40deg)`,
      zIndex: 20,
      opacity: 0.55,
      filter: "brightness(0.82)",
      pointerEvents: "auto",
    };
  }
  return { opacity: 0, pointerEvents: "none" };
}

// ── Swipe touch para móvil ──────────────────────────────────
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipe = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const dist = touchStart.current - touchEnd.current;
    if (Math.abs(dist) >= minSwipe) {
      if (dist > 0) onSwipeLeft();
      else onSwipeRight();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

export function KPIs({
  contracts,
  activeTab,
  setActiveTab,
  clientContent,
  providerContent,
}: KPIsProps) {
  const sizes = useResponsiveCarousel();

  // Swipe: izquierda = siguiente, derecha = anterior
  const tabOrder: ("client" | "provider" | "all")[] = [
    "client",
    "provider",
    "all",
  ];
  const currentIdx = tabOrder.indexOf(activeTab);
  const swipeHandlers = useSwipe(
    () => {
      if (currentIdx < tabOrder.length - 1)
        setActiveTab(tabOrder[currentIdx + 1]);
    },
    () => {
      if (currentIdx > 0) setActiveTab(tabOrder[currentIdx - 1]);
    },
  );

  const getCount = (key: "client" | "provider" | "all") => {
    if (key === "client") return contracts.asClient.length;
    if (key === "provider") return contracts.asProvider.length;
    return contracts.asClient.length + contracts.asProvider.length;
  };

  const activeContent =
    activeTab === "client" ? (
      clientContent
    ) : activeTab === "provider" ? (
      providerContent
    ) : (
      <>
        {clientContent}
        {providerContent}
      </>
    );

  const activeIndex = TAB_CONFIG.findIndex((t) => t.key === activeTab);

  return (
    <div className="flex flex-col gap-4 mb-8 mt-6">
      {/* ── Carrusel 3D (con touch swipe en móvil) ──────────────── */}
      <div
        className="relative flex items-center justify-center"
        style={{
          perspective: sizes.isMobile ? "none" : "900px",
          perspectiveOrigin: "50% 50%",
          height: `${sizes.containerH}px`,
          touchAction: "pan-y",
        }}
        {...swipeHandlers}
      >
        {TAB_CONFIG.map((tab, i) => {
          const {
            key,
            label,
            sublabel,
            Icon,
            accentColor,
            iconBg,
            iconColor,
            activeBorder,
            activeGlow,
          } = tab;
          const offset = i - activeIndex;
          const cardTransform = getCardTransform(
            offset,
            sizes.gap,
            sizes.farGap,
            sizes.isMobile,
          );
          const isActive = offset === 0;
          const count = getCount(key);

          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                ...cardTransform,
                position: "absolute",
                width: `${sizes.cardW}px`,
                padding: 0,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.45s cubic-bezier(0.34, 1.15, 0.64, 1)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  overflow: "hidden",
                  position: "relative",
                  background: "#ffffff",
                  border: isActive
                    ? `1.5px solid ${activeBorder}`
                    : "1px solid rgba(226,232,240,0.9)",
                  boxShadow: isActive
                    ? `0 14px 36px -6px rgba(0,0,0,0.12), 0 0 0 3px ${activeGlow}`
                    : "0 2px 12px -3px rgba(0,0,0,0.07)",
                }}
              >
                {/* Barra de acento superior */}
                {isActive && (
                  <div
                    style={{
                      height: "3px",
                      background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
                    }}
                  />
                )}

                {/* Zona icono */}
                <div
                  className="flex items-center justify-center"
                  style={{ height: `${sizes.iconZone}px` }}
                >
                  <div
                    style={{
                      padding: `${sizes.iconPad}px`,
                      borderRadius: "14px",
                      background: iconBg,
                      border: `1px solid ${accentColor}22`,
                    }}
                  >
                    <Icon
                      style={{
                        width: `${sizes.iconSize}px`,
                        height: `${sizes.iconSize}px`,
                        color: iconColor,
                      }}
                      strokeWidth={1.6}
                    />
                  </div>
                </div>

                {/* Divisor */}
                <div
                  style={{
                    height: "1px",
                    margin: "0 16px",
                    background: "rgba(226,232,240,0.7)",
                  }}
                />

                {/* Info */}
                <div style={{ padding: "10px 12px 14px", textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: `${sizes.numSize}px`,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: isActive ? accentColor : "#1e293b",
                      letterSpacing: "-0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    {count.toLocaleString("es-CO")}
                  </p>
                  <p
                    style={{
                      fontSize: `${sizes.labelSize}px`,
                      fontWeight: 600,
                      color: "#475569",
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: `${sizes.labelSize - 1}px`,
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    {sublabel}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Dots ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2">
        {TAB_CONFIG.map(({ key, dotColor }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              backgroundColor: activeTab === key ? dotColor : "#cbd5e1",
              width: activeTab === key ? "22px" : "7px",
              height: "7px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              borderRadius: "9999px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
