// Barra mínima para las vistas públicas de enlaces compartidos.
// No reutiliza el Navbar global de la app web: ese arrastra sesión,
// menús y providers que no aplican a un visitante que llegó por un
// enlace y cuyo destino natural es la app móvil.
import Image from "next/image";
import Link from "next/link";
import { GOOGLE_PLAY_URL } from "@/lib/public-api";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-blue-700/20 bg-[#097EEC]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/suarec-logo.png"
            alt="SUAREC"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span className="text-lg font-extrabold tracking-wide text-white">
            SUAREC
          </span>
        </Link>
        <a
          href={GOOGLE_PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#097EEC] transition hover:bg-blue-50"
        >
          Descargar la app
        </a>
      </div>
    </header>
  );
}
