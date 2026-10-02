"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import RoleGuard from "@/components/role-guard";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import FeriasManagement from "@/components/admin/boleteria/ferias/FeriasManagement";
import PalcosPorFeria from "@/components/admin/boleteria/palcos/PalcosPorFeria";
import { CalendarDays, Ticket } from "lucide-react";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// Ferias: las ferias y sus eventos. Gestion de palcos: los eventos PALCO de
// cada feria; al elegir uno se ve su mapa con lo vendido, libre, en compra
// y apartado. (No "Gestion de recinto": choca con Boleteria -> Recintos,
// que es el editor del plano)
type FeriasTab = "ferias" | "gestion-palcos";

const TAB_CONFIG: Record<
  FeriasTab,
  { label: string; subtitulo: string; icon: React.ReactNode }
> = {
  ferias: {
    label: "Ferias",
    subtitulo: "Cada feria agrupa sus eventos, digitales y físicos",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  "gestion-palcos": {
    label: "Gestión de palcos",
    subtitulo:
      "Estado de cada palco por evento: libre, en compra, apartado o vendido",
    icon: <Ticket className="h-4 w-4" />,
  },
};

const RUTA = "/admin/boleteria/ferias";

const FeriasPageContent = () => {
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();
  // El tab va en la direccion (?tab=gestion-palcos): al volver del mapa de
  // un evento o al recargar, sigue en el mismo tab
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab: FeriasTab =
    searchParams.get("tab") === "gestion-palcos" ? "gestion-palcos" : "ferias";
  const cambiarTab = (nuevo: FeriasTab) =>
    router.replace(nuevo === "ferias" ? RUTA : `${RUTA}?tab=${nuevo}`, {
      scroll: false,
    });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Ferias</h1>
            <p className="mt-2 text-blue-100">{TAB_CONFIG[tab].subtitulo}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4 flex">
          <div
            className="hidden md:flex flex-col gap-[24px] flex-shrink-0"
            style={{ width: panelWidth }}
          >
            <AdminSidePanel />
          </div>

          <div
            className="hidden md:flex items-center justify-center w-3 flex-shrink-0 cursor-col-resize group select-none"
            onMouseDown={onPanelDrag}
          >
            <div className="w-0.5 h-12 rounded-full bg-gray-200 group-hover:bg-[#097EEC] transition-colors duration-150" />
          </div>

          <div className="flex-1 min-w-0 ml-3">
            {/* Tabs al margen superior, igual que Digital y Física */}
            <div role="tablist" className="flex gap-2 mb-4">
              {(Object.keys(TAB_CONFIG) as FeriasTab[]).map((t) => (
                <motion.button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => cambiarTab(t)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                    tab === t
                      ? "bg-[#097EEC] text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                  }`}
                >
                  {TAB_CONFIG[t].icon}
                  {TAB_CONFIG[t].label}
                </motion.button>
              ))}
            </div>

            <div
              role="tabpanel"
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden"
            >
              {tab === "ferias" ? <FeriasManagement /> : <PalcosPorFeria />}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Suspense: lo pide useSearchParams para compilar la pagina
const FeriasPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <Suspense fallback={null}>
      <FeriasPageContent />
    </Suspense>
  </RoleGuard>
);

export default FeriasPage;
