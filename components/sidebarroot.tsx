"use client";

import Link from "next/link";
import {
  ArrowRightLeft,
  Ticket,
  UserRound,
  Wallet,
  FileText,
  Users,
} from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import { NotifBadge } from "@/components/ui/NotifBadge";
import { usePanelNoti } from "@/contexts/PanelNotiContext";

const SidebarRoot = () => {
  const { pendingPhotos, pendingReports, pendingPaymentsCount } =
    usePanelNoti();

  const photosCount = pendingPhotos.length;
  const reportsCount = pendingReports.length;
  // Validaciones = fotos pendientes de ID (usuarios esperando verificación)
  const validationCount = photosCount;
  // Tickets = reportes pendientes de moderación
  const ticketsCount = reportsCount;

  return (
    <AnimatedContent
      distance={70}
      direction="horizontal"
      reverse={true}
      duration={0.7}
      ease="power3.out"
      initialOpacity={0}
      animateOpacity
      scale={1}
      threshold={0.1}
      delay={0}
      className="hidden md:block"
    >
      <aside className="w-64 flex flex-col bg-white rounded-2xl shadow-xl pt-6 pb-4 px-4 bg-opacity-100">
        <div className="mb-6">
          <p className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wide">
            Navegación
          </p>
          <p className="mt-1 text-sm font-eras-bold text-gray-800">
            Panel de control
          </p>
        </div>

        <nav className="flex-1 space-y-1 text-sm font-jakarta">
          {/* Wallet */}
          <Link
            href="/wallet"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#097EEC] transition-colors"
          >
            <Wallet className="h-4 w-4" />
            <span>wallet</span>
          </Link>

          {/* Transacciones — badge de pagos pendientes (desembolso) */}
          <Link
            href="/payments"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#097EEC] transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>transacciones</span>
            <NotifBadge count={pendingPaymentsCount} variant="amber" />
          </Link>

          {/* Tickets — badge de reportes de moderación pendientes */}
          <Link
            href="/admin/tickets"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#097EEC] transition-colors"
          >
            <Ticket className="h-4 w-4" />
            <span>tickets de soporte</span>
            <NotifBadge count={ticketsCount} />
          </Link>

          {/* Publicaciones */}
          <Link
            href="/admin/publicaciones"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#097EEC] transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>publicaciones</span>
          </Link>

          {/* Accounts — badge de fotos de ID pendientes (verificación) */}
          <Link
            href="/users"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-[#097EEC] transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>accounts</span>
            <NotifBadge count={validationCount} />
          </Link>
        </nav>
      </aside>
    </AnimatedContent>
  );
};

export default SidebarRoot;
