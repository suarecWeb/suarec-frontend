"use client";

// CTA de descarga de la app para las vistas públicas de enlaces
// compartidos (roadmap compartir-publicacion-evento-enlace, ADR-2
// ampliado 2026-10-05: vista de solo lectura, el core transaccional
// — compra y gestión — vive solo en mobile).
import { useState } from "react";
import { Apple, Play, Smartphone } from "lucide-react";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/public-api";

interface DownloadAppCTAProps {
  /** Id del evento para el intento de abrir la app directo en el detalle */
  eventoId?: string;
}

const storeButtonClass =
  "inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700";

export default function DownloadAppCTA({ eventoId }: DownloadAppCTAProps) {
  const [intentandoAbrir, setIntentandoAbrir] = useState(false);

  const handleAbrirApp = () => {
    if (!eventoId) return;
    setIntentandoAbrir(true);

    const ua = navigator.userAgent;
    const esAndroid = /android/i.test(ua);
    const esIOS = /iPad|iPhone|iPod/.test(ua);

    if (esAndroid) {
      // Intent de Android: abre la app si está instalada; si no, cae al
      // navegador (la verificación App Links llega con la build nueva, ADR-5).
      window.location.href = `intent://suarec.com/eventos/${eventoId}#Intent;scheme=https;package=com.dantesiio.suarecmobile;end`;
    } else if (esIOS) {
      // Scheme propio de la app (Universal Links llegan con la build nueva).
      window.location.href = `myapp://eventos/${eventoId}`;
      // Si la app no está instalada el scheme falla en silencio: mandamos a
      // la tienda después de un momento.
      setTimeout(() => {
        window.location.href = APP_STORE_URL;
      }, 1500);
    } else {
      // Escritorio: directo a las tiendas.
      window.open(GOOGLE_PLAY_URL, "_blank", "noopener");
    }

    setTimeout(() => setIntentandoAbrir(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 text-center">
      <Smartphone className="mx-auto h-8 w-8 text-[#097EEC]" />
      <h3 className="mt-2 text-lg font-bold text-gray-900">
        La experiencia completa está en la app
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
        Comprar boletas, canjear códigos y gestionar tus eventos solo está
        disponible en la aplicación móvil de SUAREC.
      </p>

      {eventoId && (
        <button
          onClick={handleAbrirApp}
          disabled={intentandoAbrir}
          className="mt-4 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#097EEC] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
        >
          {intentandoAbrir ? "Abriendo…" : "Abrir en la app"}
        </button>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <a
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={storeButtonClass}
        >
          <Play className="h-4 w-4" />
          Google Play
        </a>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={storeButtonClass}
        >
          <Apple className="h-4 w-4" />
          App Store
        </a>
      </div>
    </div>
  );
}
