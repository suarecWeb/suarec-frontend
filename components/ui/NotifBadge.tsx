"use client";

import { cn } from "@/lib/utils";

interface NotifBadgeProps {
  /** Número a mostrar. 0 o undefined = oculto */
  count?: number;
  /** Máximo a mostrar antes de poner "99+" */
  max?: number;
  /** Clases extra */
  className?: string;
  /** Variante de color */
  variant?: "red" | "blue" | "amber";
}

const VARIANT_STYLES = {
  red: "bg-red-500 text-white",
  blue: "bg-[#097EEC] text-white",
  amber: "bg-amber-500 text-white",
};

export const NotifBadge = ({
  count,
  max = 99,
  className,
  variant = "red",
}: NotifBadgeProps) => {
  if (!count || count <= 0) return null;

  const label = count > max ? `${max}+` : String(count);
  const isWide = count > max || count > 9;

  return (
    <span
      className={cn(
        "ml-auto flex items-center justify-center flex-shrink-0",
        "text-[10px] font-bold leading-none",
        "shadow-sm select-none pointer-events-none",
        isWide
          ? "rounded-full px-1.5 h-[18px] min-w-[18px]"
          : "rounded-full w-[18px] h-[18px]",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
};

export default NotifBadge;
