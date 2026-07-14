"use client";

import { useRef, useCallback, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import { Printer, Usb } from "lucide-react";
import { motion } from "framer-motion";
import { TicketVisual } from "./tickets/TicketVisual";

interface EventoInfo {
  nombre?: string;
  fecha?: string;
  hora?: string;
  lugar?: string;
}

interface BoleteriaFisicaTicketProps {
  qrValue: string;
  tipoBoleta?: "GENERAL" | "VIP";
  precio: string;
  fechaCompra: string;
  evento?: EventoInfo;
  cantidad?: number;
}

const AGENT_URL = "http://localhost:3001";

function generarQrSecuencial(baseQr: string, index: number): string {
  const match = baseQr.match(/^(.*?)(\d+)$/);
  if (!match) return `${baseQr}-${index + 1}`;

  const prefix = match[1];
  const number = parseInt(match[2], 10);
  const length = match[2].length;
  const nextNumber = (number + index).toString().padStart(length, "0");
  return `${prefix}${nextNumber}`;
}

export const BoleteriaFisicaTicket = ({
  qrValue,
  tipoBoleta = "GENERAL",
  precio,
  fechaCompra,
  evento,
  cantidad = 1,
}: BoleteriaFisicaTicketProps) => {
  const ticketsRef = useRef<HTMLDivElement>(null);
  const [agentStatus, setAgentStatus] = useState<string>("");

  const qrValues = useMemo(() => {
    const count = Math.max(1, Math.min(cantidad, 50));
    return Array.from({ length: count }, (_, i) =>
      generarQrSecuencial(qrValue, i),
    );
  }, [qrValue, cantidad]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleAgentPrint = useCallback(async () => {
    if (!ticketsRef.current) {
      setAgentStatus("No se encontró el ticket para capturar.");
      return;
    }

    setAgentStatus(`Capturando ${qrValues.length} ticket(s) como imagen...`);

    try {
      const canvas = await html2canvas(ticketsRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const imageBase64 = canvas.toDataURL("image/png");

      setAgentStatus("Enviando imagen al agente de impresión...");

      const response = await fetch(`${AGENT_URL}/print-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error desconocido del agente");
      }

      setAgentStatus(
        `${qrValues.length} ticket(s) enviado(s) a la impresora ${data.printer}`,
      );
    } catch (error: any) {
      setAgentStatus(
        `Error: ${error.message}. Verifica que el agente local esté corriendo en ${AGENT_URL}`,
      );
    }
  }, [qrValues.length]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Contenedor de tickets: preview muestra solo el primero */}
      <div className="no-print p-4 bg-gray-100 rounded-xl">
        <div ref={ticketsRef} className="flex flex-col">
          {qrValues.map((code, index) => (
            <TicketVisual
              key={code}
              qrValue={code}
              tipoBoleta={tipoBoleta}
              precio={precio}
              fechaCompra={fechaCompra}
              evento={evento}
              className={index === 0 ? "" : "hidden print:block"}
            />
          ))}
        </div>
      </div>

      {/* Botones de impresión (se ocultan al imprimir) */}
      <div className="no-print flex flex-wrap items-center justify-center gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0766c2] transition-colors shadow"
        >
          <Printer className="h-4 w-4" />
          Imprimir {qrValues.length} ticket{qrValues.length > 1 ? "s" : ""}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAgentPrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow"
        >
          <Usb className="h-4 w-4" />
          Imprimir vía agente local
        </motion.button>
      </div>

      {agentStatus && (
        <p className="no-print text-sm text-center max-w-md text-gray-600">
          {agentStatus}
        </p>
      )}

      {/* Estilos de impresión térmica 80mm */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .ticket-print,
          .ticket-print * {
            visibility: visible;
          }

          .no-print {
            display: none !important;
          }

          .ticket-print {
            position: relative !important;
            width: 80mm !important;
            height: auto !important;
            aspect-ratio: 350 / 769 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
          }

          .ticket-print img {
            width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BoleteriaFisicaTicket;
