"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import PalcosEvento, {
  RUTA_TAB_PALCOS,
} from "@/components/admin/boleteria/palcos/PalcosEvento";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

interface PalcosEventoPageProps {
  params: { eventoId: string };
  // ?palco=ID: el palco que venia elegido desde otro evento de la feria
  searchParams: { palco?: string };
}

// Gestion de palcos de un evento (se llega desde Ferias -> tab "Gestion de
// palcos"). Sin panel lateral: el mapa necesita todo el ancho
const PalcosEventoPageContent = ({
  params,
  searchParams,
}: PalcosEventoPageProps) => {
  const palco = Number(searchParams.palco);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4 flex items-center gap-3">
            <Link
              href={RUTA_TAB_PALCOS}
              aria-label="Volver a Gestión de palcos"
              className="flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Gestión de palcos</h1>
              <p className="mt-2 text-blue-100">
                Estado de cada palco en este evento: libre, en compra, apartado
                o vendido
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            <PalcosEvento
              eventoId={Number(params.eventoId)}
              palcoInicial={Number.isInteger(palco) && palco > 0 ? palco : null}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PalcosEventoPage = (props: PalcosEventoPageProps) => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <PalcosEventoPageContent {...props} />
  </RoleGuard>
);

export default PalcosEventoPage;
