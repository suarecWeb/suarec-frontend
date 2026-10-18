"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import RoleGuard from "@/components/role-guard";
import { useAuth } from "@/hooks/useAuth";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { MailPlus, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmailTemplatesManagement from "@/components/admin/email/EmailTemplatesManagement";
import EmailCampaignsHistory from "@/components/admin/email/EmailCampaignsHistory";

// Plantillas de correo + campañas (roadmap email-templates-campanas.txt).
// Cuelga del grupo Ads del sidebar como /admin/email (página propia: el
// editor con preview no cabe en una pestaña de Notificaciones).
// El backend exige súper admin en CADA endpoint (SuperAdminGuard) -- pero
// RoleGuard allowedRoles={["ADMIN"]} de acá abajo es el mismo guard
// genérico de cualquier pantalla admin, no el mismo corte que isSuperAdmin
// (el repo no tiene un rol "SUPER_ADMIN" en RoleGuard, ese estado vive en
// el flag isSuperAdmin -- ver components/sidebarroot.tsx). Sin el chequeo
// de abajo, un ADMIN cualquiera que entra directo a esta URL ve toda la
// UI (plantillas, cupo del día) antes de que cada llamada le devuelva 403
// (hallazgo de auditoría 2026-10-16).

type EmailTab = "plantillas" | "campanas";

const TAB_CONFIG: Record<EmailTab, { label: string; icon: React.ReactNode }> = {
  plantillas: {
    label: "Plantillas",
    icon: <MailPlus className="h-4 w-4" />,
  },
  campanas: {
    label: "Campañas",
    icon: <History className="h-4 w-4" />,
  },
};

const tabContentVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
};

const EmailPageContent = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();
  const [activeTab, setActiveTab] = useState<EmailTab>("plantillas");

  // Corte real: RoleGuard de abajo solo exige rol ADMIN (igual que
  // cualquier otra pantalla admin), pero esta sección es SOLO súper admin
  // (ADR-1 del roadmap, alineado con SuperAdminGuard del backend)
  useEffect(() => {
    if (!authLoading && !user?.isSuperAdmin) {
      router.push("/access-denied");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user?.isSuperAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Correos</h1>
            <p className="mt-2 text-blue-100">
              Plantillas de email y campañas a los usuarios de SUAREC
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
            <div className="flex gap-2 mb-4">
              {(Object.keys(TAB_CONFIG) as EmailTab[]).map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm ${
                    activeTab === tab
                      ? "bg-[#097EEC] text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                  }`}
                >
                  {TAB_CONFIG[tab].icon}
                  {TAB_CONFIG[tab].label}
                </motion.button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {activeTab === "plantillas" && <EmailTemplatesManagement />}
                  {activeTab === "campanas" && <EmailCampaignsHistory />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const EmailPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <EmailPageContent />
  </RoleGuard>
);

export default EmailPage;
