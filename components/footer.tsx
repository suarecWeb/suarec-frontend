"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  FileText,
  Building2,
  Users,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import SuarecLogo from "@/components/logo";
import TermsModal from "@/components/terms-modal";
import PrivacyModal from "@/components/privacy-modal";

export default function Footer() {
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="bg-[#097EEC] text-white py-16 mt-auto overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="sm:col-span-2 lg:col-span-2">
              <SuarecLogo
                width={120}
                height={50}
                className="mb-6"
                theme="dark"
              />
              <p className="text-white/80 max-w-md leading-relaxed mb-6 font-eras">
                Conectamos talento excepcional con oportunidades extraordinarias
                para crear un futuro laboral mejor en Colombia.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white/80 font-eras">
                  <Heart className="h-5 w-5 text-white-300" />
                  <span>Hecho en Colombia, para Colombianos</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-eras-bold mb-6">Enlaces rápidos</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/publications"
                    className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                  >
                    <FileText className="h-4 w-4" />
                    Publicaciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/companies"
                    className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                  >
                    <Building2 className="h-4 w-4" />
                    Empresas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/select-type"
                    className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                  >
                    <Users className="h-4 w-4" />
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-eras-bold mb-6">Contacto</h3>
              <ul className="space-y-3">
                <li className="text-white/80 font-eras">
                  <span className="block text-sm">Email</span>
                  <span className="text-white break-all sm:break-normal">
                    soportesuarec@gmail.com
                  </span>
                </li>
                <li className="text-white/80 font-eras">
                  <span className="block text-sm">Teléfono</span>
                  <span className="text-white">+57 314 6373088</span>
                </li>
                <li className="text-white/80 font-eras">
                  <span className="block text-sm">Ubicación</span>
                  <span className="text-white">Colombia</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-eras-bold mb-6">Síguenos</h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/suarec.co?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  href="https://www.tiktok.com/@suarec.co?_t=ZS-8yPgagZaqQS&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                >
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
                <a
                  href="https://x.com/suarec_?s=11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a
                  href="https://www.facebook.com/share/18shUoxxch/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-2 font-eras"
                >
                  <Facebook className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white/80 transition-colors duration-300 flex items-center gap-2 font-eras cursor-not-allowed"
                  title="LinkedIn - Próximamente"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60 font-eras">
              © {new Date().getFullYear()} SUAREC. Todos los derechos
              reservados. |
              <a
                href="#"
                className="hover:text-white transition-colors ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  setPrivacyOpen(true);
                }}
              >
                Privacidad
              </a>{" "}
              |
              <a
                href="#"
                className="hover:text-white transition-colors ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  setTermsOpen(true);
                }}
              >
                Términos
              </a>
            </p>
          </div>
        </div>
      </footer>
      <TermsModal isOpen={isTermsOpen} onClose={() => setTermsOpen(false)} />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </>
  );
}
