"use client";

import {
  useRef,
  useCallback,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import html2canvas from "html2canvas";
import { TicketVisual } from "./tickets/TicketVisual";

export type BoleteriaFisicaTicketRef = {
  handlePrint: () => void;
  handleAgentPrint: () => void;
};

interface EventoInfo {
  nombre?: string;
  fecha?: string;
  hora?: string;
  lugar?: string;
  descripcion?: string;
}

interface BoleteriaFisicaTicketProps {
  qrValue: string;
  qrValues?: string[];
  qrIds?: string[];
  tipoBoleta?: "GENERAL" | "VIP";
  precio: string;
  fechaCompra: string;
  evento?: EventoInfo;
  cantidad?: number;
  esPreview?: boolean;
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

export const BoleteriaFisicaTicket = forwardRef<
  BoleteriaFisicaTicketRef,
  BoleteriaFisicaTicketProps
>(function BoleteriaFisicaTicket(
  {
    qrValue,
    qrValues: qrValuesProp,
    qrIds: qrIdsProp,
    tipoBoleta = "GENERAL",
    precio,
    fechaCompra,
    evento,
    cantidad = 1,
    esPreview = false,
  },
  ref,
) {
  const ticketsRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const ticketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [agentStatus, setAgentStatus] = useState<string>("");

  const previewQrValues = useMemo(() => {
    const count = Math.max(1, Math.min(cantidad, 50));
    return Array.from({ length: count }, (_, i) =>
      generarQrSecuencial(qrValue, i),
    );
  }, [qrValue, cantidad]);

  const realQrValues = useMemo(() => {
    if (qrValuesProp && qrValuesProp.length > 0) {
      return qrValuesProp.slice(0, 50);
    }
    return [];
  }, [qrValuesProp]);

  const hasRealQr = realQrValues.length > 0;
  const printQrValues = hasRealQr ? realQrValues : previewQrValues;

  // eslint-disable-next-line no-console
  console.log("[BoleteriaFisicaTicket] render", {
    hasRealQr,
    realQrCount: realQrValues.length,
    printQrCount: printQrValues.length,
    firstQr: printQrValues[0]?.slice(0, 30),
  });

  const capturePrintTickets = useCallback(async () => {
    if (!printRef.current) return null;

    const canvas = await html2canvas(printRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    return canvas.toDataURL("image/png");
  }, []);

  const captureSingleTickets = useCallback(async () => {
    const validRefs = ticketRefs.current.filter(Boolean) as HTMLDivElement[];
    if (validRefs.length === 0) return [];

    const images: string[] = [];
    for (const el of validRefs) {
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      images.push(canvas.toDataURL("image/png"));
    }
    return images;
  }, []);

  const handlePrint = useCallback(async () => {
    setAgentStatus(
      hasRealQr
        ? "Generando imagen de impresión..."
        : "Imprimiendo vista previa — el QR real se genera al confirmar la venta.",
    );

    try {
      const imageBase64 = await capturePrintTickets();
      if (!imageBase64) {
        setAgentStatus("No se pudo generar la imagen del ticket.");
        return;
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setAgentStatus("El navegador bloqueó la ventana de impresión.");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket SUAREC</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { margin: 0; padding: 0; background: white; }
              img { width: 80mm; height: auto; display: block; }
            </style>
          </head>
          <body>
            <img src="${imageBase64}" onload="window.print(); window.onafterprint = () => window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
      setAgentStatus("Ventana de impresión abierta.");
    } catch (error: any) {
      setAgentStatus(`Error al generar imagen: ${error.message}`);
    }
  }, [hasRealQr, capturePrintTickets]);

  const handleAgentPrint = useCallback(async () => {
    setAgentStatus(
      hasRealQr
        ? `Capturando ${printQrValues.length} ticket(s) como imagen...`
        : "Capturando vista previa — el QR real se genera al confirmar la venta.",
    );

    try {
      const imagesBase64 = await captureSingleTickets();
      if (imagesBase64.length === 0) {
        setAgentStatus("No se pudo generar la imagen del ticket.");
        return;
      }

      setAgentStatus("Enviando imagen al agente de impresión...");

      const response = await fetch(`${AGENT_URL}/print-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: imagesBase64 }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Error desconocido del agente");
      }

      setAgentStatus(
        `${printQrValues.length} ticket(s) enviado(s) a la impresora ${data.printer}`,
      );
    } catch (error: any) {
      setAgentStatus(
        `Error: ${error.message}. Verifica que el agente local esté corriendo en ${AGENT_URL}`,
      );
    }
  }, [hasRealQr, printQrValues.length, captureSingleTickets]);

  useImperativeHandle(ref, () => ({
    handlePrint,
    handleAgentPrint,
  }));

  const previewScale = 0.7;
  const previewWidth = Math.round(400 * previewScale);
  const previewHeight = Math.round(880 * previewScale);

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Vista previa en pantalla: miniaturas en grilla */}
      <div className="no-print w-full p-4 bg-gray-100 rounded-xl">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Vista previa de {printQrValues.length}{" "}
          {printQrValues.length === 1 ? "boleta" : "boletas"}
        </p>
        <div
          ref={ticketsRef}
          className="grid grid-cols-2 gap-4 justify-items-center max-h-[680px] overflow-y-auto p-1"
        >
          {printQrValues.map((code, index) => (
            <div
              key={code}
              className="relative rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white"
              style={{
                width: previewWidth,
                height: previewHeight,
              }}
            >
              <div
                className="absolute left-0 top-0"
                style={{
                  transform: `scale(${previewScale})`,
                  transformOrigin: "top left",
                }}
              >
                <TicketVisual
                  qrValue={code}
                  qrId={qrIdsProp?.[index]}
                  tipoBoleta={tipoBoleta}
                  precio={precio}
                  fechaCompra={fechaCompra}
                  evento={evento}
                  esPreview={!hasRealQr}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tickets ocultos usados para generar la imagen de impresión.
          Con QR reales imprime boletas válidas; sin venta imprime la
          vista previa marcada como "QR no válido". */}
      <div
        ref={printRef}
        className="absolute left-0 top-0 -z-[9999] pointer-events-none flex flex-col"
        aria-hidden="true"
      >
        {printQrValues.map((code, index) => (
          <div
            key={code}
            ref={(el) => {
              ticketRefs.current[index] = el;
            }}
          >
            <TicketVisual
              qrValue={code}
              qrId={qrIdsProp?.[index]}
              tipoBoleta={tipoBoleta}
              precio={precio}
              fechaCompra={fechaCompra}
              evento={evento}
              esPreview={!hasRealQr}
            />
          </div>
        ))}
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
            aspect-ratio: 400 / 880 !important;
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
});

export default BoleteriaFisicaTicket;
