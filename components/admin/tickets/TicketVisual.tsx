"use client";

import { QRCodeCanvas } from "qrcode.react";
import { QrCode } from "lucide-react";

interface EventoInfo {
  nombre?: string;
  fecha?: string;
  hora?: string;
  lugar?: string;
  descripcion?: string;
}

export interface TicketVisualProps {
  qrValue: string;
  qrId?: string;
  tipoBoleta?: "GENERAL" | "VIP";
  precio: string;
  fechaCompra: string;
  evento?: EventoInfo;
  className?: string;
  esPreview?: boolean;
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
  qrId,
  tipoBoleta = "GENERAL",
  precio,
  fechaCompra,
  evento,
  className = "",
  esPreview = false,
}: TicketVisualProps) => {
  return (
    <div
      className={`ticket-print relative w-[400px] h-[880px] shrink-0 overflow-hidden bg-white ${className}`}
    >
      {/* Imagen base del ticket */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tickets/base.png"
        alt="Ticket boletería física"
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Tipo de boleta */}
      <div className="absolute top-[23px] right-[8%] bg-white px-2 py-1">
        <span className="text-[18px] font-black text-black tracking-tight">
          {tipoBoleta}
        </span>
      </div>

      {/* Se presentan */}
      {evento?.descripcion && (
        <>
          <div className="absolute left-[10%] top-[30.999%] right-[10%] text-center bg-white px-1 py-1 rounded h-[20px]">
            <p className="text-[13px] uppercase tracking-wide text-gray-600 font-extrabold">
              Se presentan
            </p>
          </div>
          <div className="absolute left-[10%] top-[39.8%] right-[10%] text-center">
            {evento.descripcion
              .split(",")
              .map((linea) => linea.trim())
              .filter(Boolean)
              .map((linea, index) => (
                <p
                  key={index}
                  className="text-[14px] font-black text-black leading-tight"
                >
                  {linea}
                </p>
              ))}
          </div>
        </>
      )}

      {/* Información del evento */}
      <div className="absolute left-[16%] top-[57.8%] right-[30%]">
        <p className="text-[13px] font-semibold text-black leading-snug">
          {evento?.fecha || "Domingo, 19 de julio de 2026"}
        </p>
      </div>

      <div className="absolute left-[16%] top-[61.2%] right-[30%]">
        <p className="text-[13px] font-semibold text-black leading-snug">
          {evento?.hora || "6:00 p.m."}
        </p>
      </div>

      <div className="absolute left-[16%] top-[64.8%] right-[30%]">
        <p className="text-[13px] font-semibold text-black leading-snug">
          {evento?.lugar || "La Herradura, Cauca"}
        </p>
      </div>

      {/* UUID / Serie arriba del QR */}
      {qrId && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[69.8%] w-[78%] text-center px-2 py-1.5">
          <p className="text-[9px] uppercase tracking-wide text-gray-700 font-extrabold leading-tight mb-0.5"></p>
          <p className="text-[10px] font-black text-black leading-tight break-all">
            {qrId}
          </p>
        </div>
      )}

      {/* QR dinámico centrado */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[73%] w-[38%] aspect-square bg-white flex items-center justify-center">
        {esPreview ? (
          <div className="flex flex-col items-center justify-center text-center p-2">
            <QrCode className="h-14 w-14 text-gray-300 mb-1" />
          </div>
        ) : (
          <QRCodeCanvas
            value={qrValue || "SUAREC"}
            size={160}
            level="M"
            includeMargin={false}
          />
        )}
      </div>

      {/* Leyenda QR */}
      <div className="absolute left-0 right-0 top-[83.5%] text-center px-4"></div>

      {/* Valor pagado */}
      <div className="absolute left-[6%] bottom-[1.3%] text-center w-[40%] px-1.5 py-2">
        <p className="text-[10px] uppercase tracking-wide text-gray-800 font-extrabold leading-tight">
          Valor pagado
        </p>
        <p className="text-[17px] font-black text-black leading-tight tracking-tight">
          {formatCOP(precio)}
        </p>
      </div>

      {/* Fecha de compra */}
      <div className="absolute right-[6%] bottom-[1.3%] text-center w-[40%] px-1.5 py-2">
        <p className="text-[10px] uppercase tracking-wide text-gray-800 font-extrabold leading-tight">
          Fecha de compra
        </p>
        <p className="text-[17px] font-black text-black leading-tight tracking-tight">
          {fechaCompra}
        </p>
      </div>
    </div>
  );
};

export default TicketVisual;
