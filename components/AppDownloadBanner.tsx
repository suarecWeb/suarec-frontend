import Image from "next/image";
import { Smartphone } from "lucide-react";
import SuarecLogo from "@/components/logo";

export default function AppDownloadBanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "460px" }}
    >
      <div className="flex flex-col md:flex-row" style={{ minHeight: "460px" }}>
        {/* MITAD IZQUIERDA — estilo ARQ: limpio, directo, sin pill */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center gap-8 px-14 py-12 md:py-0">
          {/* Heading principal */}
          <div>
            <div className="flex items-end gap-2 mb-4">
              <h2 className="text-4xl md:text-5xl font-eras-bold text-gray-900 leading-none whitespace-nowrap pb-1">
                Descarga
              </h2>
              <SuarecLogo
                theme="light"
                width={180}
                height={30}
                className="mb-1"
              />
              <span className="text-4xl md:text-5xl font-eras-bold text-gray-900 leading-none pb-1">
                .
              </span>
            </div>
            <p className="text-lg font-eras text-gray-400 leading-relaxed max-w-xs">
              Conectamos profesionales y empresas.
              <br />
              Todo en un solo lugar.
            </p>
          </div>

          {/* QR + badges al estilo ARQ */}
          <div className="flex flex-row items-center justify-between w-full">
            {/* QR */}
            <div className="w-24 h-24 flex-shrink-0 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center">
              <div className="w-20 h-20 border-2 border-dashed border-[#097EEC]/30 rounded-xl flex flex-col items-center justify-center gap-1">
                <Smartphone className="w-7 h-7 text-[#097EEC]/40" />
                <span className="text-[9px] text-[#097EEC]/50 font-eras text-center leading-tight">
                  QR
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-col gap-2">
              {/* Google Play — fondo negro, ícono con los 4 colores oficiales */}
              <div className="flex items-center gap-3 bg-black rounded-xl px-4 py-2.5 w-[168px] cursor-not-allowed select-none">
                <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M3.18 23.76c.37.2.8.22 1.2.04l11.4-6.57-2.5-2.5-10.1 9.03z"
                  />
                  <path
                    fill="#4285F4"
                    d="M2.12 3.46A1.8 1.8 0 0 0 2 4.6v14.8c0 .57.26 1.07.67 1.4l.07.06 8.3-8.3v-.2L2.12 3.46z"
                  />
                  <path
                    fill="#FBBC04"
                    d="M18.4 9.4l-2.27-1.3-2.78 2.78 2.78 2.78 2.3-1.32a1.82 1.82 0 0 0 0-2.94z"
                  />
                  <path
                    fill="#34A853"
                    d="M3.18.27C2.78.07 2.35.07 1.98.3l9.02 9.02 2.78-2.78L3.18.27z"
                  />
                </svg>
                <div>
                  <p className="text-white/50 text-[8px] leading-none font-eras">
                    GET IT ON
                  </p>
                  <p className="text-white text-sm font-eras-bold leading-tight">
                    Google Play
                  </p>
                </div>
              </div>

              {/* App Store — fondo negro, ícono Apple blanco oficial */}
              <div className="flex items-center gap-3 bg-black rounded-xl px-4 py-2.5 w-[168px] cursor-not-allowed select-none">
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.78zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <p className="text-white/50 text-[8px] leading-none font-eras">
                    DOWNLOAD ON THE
                  </p>
                  <p className="text-white text-sm font-eras-bold leading-tight">
                    App Store
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MITAD DERECHA — mockup */}
        <div
          className="w-full md:w-1/2 relative bg-[#097EEC]"
          style={{ minHeight: "460px" }}
        >
          <Image
            src="/app-mockup.png"
            alt="SUAREC App"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      </div>
    </section>
  );
}
