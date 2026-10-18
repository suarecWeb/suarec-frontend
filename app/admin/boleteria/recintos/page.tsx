"use client";

import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import RoleGuard from "@/components/role-guard";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import RecintosManagement from "@/components/admin/boleteria/recintos/lista/RecintosManagement";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const RecintosPageContent = () => {
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Recintos</h1>
            <p className="mt-2 text-blue-100">
              El dibujo de cada lugar, reutilizable en varias ferias
            </p>
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
              <RecintosManagement />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RecintosPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <RecintosPageContent />
  </RoleGuard>
);

export default RecintosPage;
