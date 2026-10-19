"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmailTemplatesService from "@/services/EmailTemplatesService";
import { EmailCampaign } from "@/interfaces/email-template.interface";

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// Historial de campañas (RF-7): conteos, nunca la lista de correos
// destinatarios (minimización de datos, RNF privacidad del roadmap).
const EmailCampaignsHistory = () => {
  const [campanas, setCampanas] = useState<EmailCampaign[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    const cargar = async (inicial = false) => {
      try {
        const { data } = await EmailTemplatesService.getHistorial();
        if (activo) setCampanas(data);
      } catch {
        if (activo && inicial) toast.error("No se pudo cargar el historial");
      } finally {
        if (activo) setCargando(false);
      }
    };
    void cargar(true);
    const timer = window.setInterval(() => void cargar(), 15000);
    return () => {
      activo = false;
      window.clearInterval(timer);
    };
  }, []);

  if (cargando) {
    return (
      <p className="text-sm text-gray-400 text-center py-16">
        Cargando historial...
      </p>
    );
  }

  if (campanas.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-16">
        Todavía no se ha enviado ninguna campaña.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-gray-500 mb-4">
        Cada clic en Enviar a todos autoriza un lote según el cupo disponible.
        Para continuar los pendientes debes pulsar de nuevo desde la plantilla.
        No hay envíos automáticos al cambiar de día. El progreso se actualiza
        cada 15 segundos; los intentos sin confirmación no se reenvían.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="pb-2 font-semibold">Fecha</th>
            <th className="pb-2 font-semibold">Plantilla</th>
            <th className="pb-2 font-semibold text-right">Destinatarios</th>
            <th className="pb-2 font-semibold text-right">Enviados</th>
            <th className="pb-2 font-semibold text-right">Incidencias</th>
            <th className="pb-2 font-semibold text-right">Pendientes</th>
            <th className="pb-2 font-semibold">Estado</th>
            <th className="pb-2 font-semibold">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {campanas.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 last:border-0">
              <td className="py-2.5 text-gray-600">{fmtFecha(c.createdAt)}</td>
              <td className="py-2.5 text-gray-800 font-medium">
                {c.template?.nombre ?? "(plantilla eliminada)"}
              </td>
              <td className="py-2.5 text-right text-gray-600">
                {c.destinatariosTotal}
              </td>
              <td className="py-2.5 text-right text-emerald-600 font-semibold">
                {c.enviados}
              </td>
              <td className="py-2.5 text-right text-red-500">
                {c.fallidos}
                {c.inciertos > 0 && (
                  <span className="block text-xs">
                    {c.inciertos} sin confirmación
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right text-gray-600">
                {c.pendientes ?? 0}
              </td>
              <td className="py-2.5 text-gray-600">
                {c.estado === "pendiente"
                  ? c.loteRestantes > 0 &&
                    c.loteDia === new Date().toISOString().slice(0, 10)
                    ? `Lote en proceso (${c.loteRestantes})`
                    : "Esperando otro clic"
                  : c.fallidos > 0
                    ? "Finalizada con incidencias"
                    : "Completada"}
              </td>
              <td className="py-2.5">
                {c.esPrueba ? (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Prueba
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#097EEC] bg-blue-50 px-2 py-0.5 rounded-full">
                    Campaña
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmailCampaignsHistory;
