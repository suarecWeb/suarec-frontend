"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { BoleteriaFisicaTicketRef } from "./BoleteriaFisicaTicket";
import {
  PayloadImpresionDedicada,
  PlantillaDedicada,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";
import EventsService from "@/services/EventsService";
import { sendDedicatedPrint } from "@/services/ImpresionDedicadaService";
import DedicadaCanvas from "./DedicadaCanvas";
import { Ticket, Info } from "lucide-react";
import styles from "./dedicada.module.css";

interface Props {
  plantilla: PlantillaDedicada;
  ventaId?: number;
  previewValues: Record<string, string>;
  previewImagenes?: Record<string, string>;
  // Encuadre de las imágenes del evento para la vista previa previa a
  // confirmar; tras confirmar se usan los `recortes` del payload real.
  previewRecortes?: Record<string, RecorteImagen>;
  cantidad?: number;
  resolveAgentUrl: () => Promise<string>;
}

const BoleteriaDedicadaTicket = forwardRef<BoleteriaFisicaTicketRef, Props>(
  function BoleteriaDedicadaTicket(
    {
      plantilla,
      ventaId,
      previewValues,
      previewImagenes,
      previewRecortes,
      cantidad = 1,
      resolveAgentUrl,
    },
    ref,
  ) {
    const [payload, setPayload] = useState<PayloadImpresionDedicada | null>(
      null,
    );
    const [status, setStatus] = useState("");
    const [failed, setFailed] = useState(false);
    const request = useRef<{
      id: number;
      promise: Promise<PayloadImpresionDedicada>;
    } | null>(null);
    const currentSale = useRef(ventaId);
    currentSale.current = ventaId;
    const printing = useRef(false);

    // `idExplicito` permite imprimir justo despues de confirmar una venta sin
    // esperar a que React re-renderice con el ventaId nuevo: quien confirma ya
    // tiene el id en la mano y lo pasa directo.
    const loadPayload = useCallback(
      (idExplicito?: number) => {
        const id = idExplicito ?? ventaId;
        if (!id)
          return Promise.reject(
            new Error("Confirma la venta antes de imprimir boletas dedicadas."),
          );
        if (request.current?.id === id) return request.current.promise;
        const promise = EventsService.getImpresionDedicada(id).then(
          ({ data }) => data,
        );
        request.current = { id, promise };
        promise.catch(() => {
          if (request.current?.promise === promise) request.current = null;
        });
        return promise;
      },
      [ventaId],
    );

    const loadPreview = useCallback(async () => {
      setPayload(null);
      setFailed(false);
      if (!ventaId) {
        setStatus(
          "Vista previa con los valores actuales de la venta. El identificador y el QR válido se asignan al confirmar.",
        );
        return;
      }
      setStatus("Cargando boletas confirmadas...");
      try {
        const data = await loadPayload();
        if (currentSale.current !== ventaId) return;
        setPayload(data);
        setStatus(
          "Venta confirmada. Revisa las boletas y pulsa Imprimir cuando estén listas.",
        );
      } catch (error) {
        if (currentSale.current !== ventaId) return;
        setFailed(true);
        setStatus(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las boletas.",
        );
      }
    }, [loadPayload, ventaId]);
    useEffect(() => {
      void loadPreview();
    }, [loadPreview]);

    const print = useCallback(
      async (idExplicito?: number) => {
        const id = idExplicito ?? ventaId;
        if (printing.current) return;
        printing.current = true;
        setStatus("Preparando impresión dedicada...");
        try {
          const data = await loadPayload(id);
          // Con id explicito (impresion automatica al confirmar) no se compara
          // contra currentSale: el render con el ventaId nuevo puede no haber
          // ocurrido todavia y abortaria una impresion legitima.
          const vigente =
            idExplicito !== undefined || currentSale.current === id;
          if (!vigente) return;
          setPayload(data);
          setFailed(false);
          const agentUrl = await resolveAgentUrl();
          await sendDedicatedPrint(agentUrl, data);
          setStatus(
            `${data.boletas.length} boleta(s) enviada(s) a la impresora dedicada.`,
          );
        } catch (error) {
          setStatus(
            `Error de impresión: ${error instanceof Error ? error.message : "No se pudo imprimir."} La venta permanece confirmada; puedes reintentar la impresión.`,
          );
        } finally {
          printing.current = false;
        }
      },
      [loadPayload, resolveAgentUrl, ventaId],
    );

    useImperativeHandle(
      ref,
      () => ({ handlePrint: print, handleAgentPrint: print }),
      [print],
    );
    return (
      <div className={styles.sale}>
        <header className={styles.saleHeader}>
          <div className={styles.saleIcon}>
            <Ticket aria-hidden="true" className="h-5 w-5" />
          </div>
          <div>
            <span className={styles.eyebrow}>Boletería dedicada</span>
            <h3>Vista previa de venta</h3>
          </div>
          <span className={styles.saleBadge}>
            {ventaId ? "Venta confirmada" : "En preparación"}
          </span>
        </header>
        <p className="text-xs leading-relaxed text-slate-500">
          Papel térmico blanco · la impresión será monocroma tramada, aunque las
          imágenes se vean a color aquí.
        </p>
        {status && (
          <div role="status" className={styles.status}>
            <Info aria-hidden="true" className="h-3.5 w-3.5" />
            <p>{status}</p>
          </div>
        )}
        {failed && (
          <button
            type="button"
            onClick={() => void loadPreview()}
            className={styles.secondaryButton}
          >
            Reintentar vista previa
          </button>
        )}
        <div className={styles.ticketGrid}>
          {payload
            ? payload.boletas.map((boleta, index) => (
                <div key={`${ventaId}-${index}`} className={styles.ticketCard}>
                  <div className={styles.ticketHeading}>
                    <strong>Boleta {String(index + 1).padStart(2, "0")}</strong>
                    <span>{boleta.valores.qrId}</span>
                  </div>
                  <DedicadaCanvas
                    campos={payload.campos}
                    imagenes={payload.imagenes}
                    recortes={payload.recortes}
                    margenMm={plantilla.margenMm}
                    valores={boleta.valores}
                    qrValue={boleta.qrValue}
                    preview
                  />
                </div>
              ))
            : !ventaId && (
                <div className={styles.ticketCard}>
                  <div className={styles.ticketHeading}>
                    <strong>Boleta en preparación</strong>
                    <span>{cantidad} boleta(s) · Valores actuales</span>
                  </div>
                  <DedicadaCanvas
                    campos={plantilla.campos}
                    imagenes={previewImagenes}
                    recortes={previewRecortes}
                    margenMm={plantilla.margenMm}
                    valores={previewValues}
                    qrValue=""
                    preview
                  />
                </div>
              )}
        </div>
      </div>
    );
  },
);
export default BoleteriaDedicadaTicket;
