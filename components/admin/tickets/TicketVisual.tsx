"use client";

import { QRCodeSVG } from "qrcode.react";

interface EventoInfo {
  nombre?: string;
  fecha?: string;
  hora?: string;
  lugar?: string;
}

export interface TicketVisualProps {
  qrValue: string;
  tipoBoleta?: "GENERAL" | "VIP";
  precio: string;
  fechaCompra: string;
  evento?: EventoInfo;
  className?: string;
}

const formatCOP = (value: string | number) => {
  const numeric =
    typeof value === "string" ? Number(value.replace(/\D/g, "")) : value;
  if (Number.isNaN(numeric)) return value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const TicketVisual = ({
  qrValue,
  tipoBoleta = "GENERAL",
  precio,
  fechaCompra,
  evento,
  className = "",
}: TicketVisualProps) => {
  return (
    <div
      className={`ticket-print relative w-[350px] h-[769px] shrink-0 overflow-hidden bg-white ${className}`}
    >
      {/* Imagen base del ticket */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tickets/ejemplo-boleteria-fisica.png"
        alt="Ticket boletería física"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Tipo de boleta */}
      <div className="absolute top-[10px] right-[8%] bg-white px-2 py-1">
        <span className="text-[16px] font-black text-black tracking-tight">
          {tipoBoleta}
        </span>
      </div>

      {/* Información del evento */}
      <div className="absolute left-[13%] top-[52.3%] right-[30%]">
        <p className="text-[11px] font-semibold text-black leading-snug">
          {evento?.fecha || "Domingo, 19 de julio de 2026"}
        </p>
      </div>

      <div className="absolute left-[13%] top-[55.3%] right-[30%]">
        <p className="text-[11px] font-semibold text-black leading-snug">
          {evento?.hora || "6:00 p.m."}
        </p>
      </div>

      <div className="absolute left-[13%] top-[58%] right-[30%]">
        <p className="text-[11px] font-semibold text-black leading-snug">
          {evento?.lugar || "La Herradura, Cauca"}
        </p>
      </div>

      {/* QR dinámico centrado */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[67%] w-[38%] aspect-square bg-white flex items-center justify-center">
        <QRCodeSVG
          value={qrValue || "SUAREC"}
          size={165}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Leyenda QR */}
      <div className="absolute left-0 right-0 top-[83.5%] text-center px-4">
        <p className="text-[10px] text-black font-medium">
          Presenta este código en la entrada
        </p>
      </div>

      {/* Valor pagado */}
      <div className="absolute left-[8%] bottom-[2.5%] text-center w-[38%]">
        <p className="text-[8px] uppercase tracking-wide text-gray-600 font-medium leading-tight">
          Valor pagado
        </p>
        <p className="text-[12px] font-bold text-black leading-tight">
          {formatCOP(precio)}
        </p>
      </div>

      {/* Fecha de compra */}
      <div className="absolute right-[8%] bottom-[2.5%] text-center w-[38%]">
        <p className="text-[8px] uppercase tracking-wide text-gray-600 font-medium leading-tight">
          Fecha de compra
        </p>
        <p className="text-[12px] font-bold text-black leading-tight">
          {fechaCompra}
        </p>
      </div>
    </div>
  );
};

export default TicketVisual;
