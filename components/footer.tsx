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
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import SuarecLogo from "@/components/logo";
import TermsModal from "@/components/terms-modal";
import PrivacyModal from "@/components/privacy-modal";

export default function Footer() {
  const [isTermsOpen, setTermsOpen] = useState(false);
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="relative bg-gradient-to-t from-[#1a1f3a] via-[#2a3a6e] via-[#097EEC] to-[#097EEC] text-white py-14 mt-auto overflow-hidden rounded-t-[3rem] -mt-12">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <SuarecLogo
                width={120}
                height={50}
                className="mb-6"
                theme="dark"
              />
              <p className="text-white/80 leading-relaxed mb-6 font-eras text-sm">
                Conectamos talento excepcional con oportunidades extraordinarias
                para crear un futuro laboral mejor en Colombia.
              </p>
              <div className="flex items-center gap-2 text-white/70 font-eras text-xs">
                <Heart className="h-5 w-5 fill-white/70" />
                <span className="text-sm">
                  Hecho en Colombia, para Colombianos
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base font-eras-bold mb-4 text-white">
                Enlaces rápidos
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/publications"
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-3 group font-eras"
                  >
                    <FileText className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span>Publicaciones</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/companies"
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-3 group font-eras"
                  >
                    <Building2 className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span>Empresas</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/select-type"
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-3 group font-eras"
                  >
                    <Users className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    <span>Registrarse</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-base font-eras-bold mb-4 text-white">
                Contacto
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-white/70 hover:text-white transition-colors group">
                  <Mail className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="font-eras text-sm">
                    <span className="block text-xs text-white/50 mb-1">
                      Email
                    </span>
                    <a
                      href="mailto:soportesuarec@gmail.com"
                      className="break-all"
                    >
                      soportesuarec@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-white/70 hover:text-white transition-colors group">
                  <Phone className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="font-eras">
                    <span className="block text-xs text-white/50 mb-1">
                      Teléfono
                    </span>
                    <a href="tel:+573146373088">+57 314 6373088</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-white/70 group">
                  <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="font-eras">
                    <span className="block text-xs text-white/50 mb-1">
                      Ubicación
                    </span>
                    <span>Colombia</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-base font-eras-bold mb-4 text-white">
                Síguenos
              </h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/suarec.co?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-[#097EEC] transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@suarec.co?_t=ZS-8yPgagZaqQS&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-[#097EEC] transition-all duration-300 hover:scale-110"
                  aria-label="TikTok"
                >
                  <svg
                    className="h-5 w-5"
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
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-[#097EEC] transition-all duration-300 hover:scale-110"
                  aria-label="X"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/18shUoxxch/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white hover:text-[#097EEC] transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/30 cursor-not-allowed"
                  title="LinkedIn - Próximamente"
                >
                  <Linkedin className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-center">
              <p className="text-white/50 text-xs font-eras">
                © {new Date().getFullYear()} SUAREC. Todos los derechos
                reservados.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="text-white/50 hover:text-white text-sm transition-colors font-eras"
                >
                  Privacidad
                </button>
                <span className="text-white/30">|</span>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="text-white/50 hover:text-white text-sm transition-colors font-eras"
                >
                  Términos
                </button>
              </div>
            </div>
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
