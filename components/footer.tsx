"use client";
import Link from "next/link";
import { useState } from "react";
import { Heart, FileText, Building2, Users } from "lucide-react";
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
