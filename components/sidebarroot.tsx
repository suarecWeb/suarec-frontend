"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRightLeft,
  Ticket,
  Wallet,
  FileText,
  Users,
  Ticket as TicketIcon,
  Bell,
  Megaphone,
} from "lucide-react";
import AnimatedContent from "@/components/AnimatedContent";
import BranchedMenu, { BranchedMenuItem } from "@/components/BranchedMenu";
import { NotifBadge } from "@/components/ui/NotifBadge";
import { usePanelNoti } from "@/contexts/PanelNotiContext";
import { useAuth } from "@/hooks/useAuth";

const SidebarRoot = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pendingPhotos, pendingReports, pendingPaymentsCount } =
    usePanelNoti();

  if (!user?.isSuperAdmin) {
    return null;
  }

  const photosCount = pendingPhotos.length;
  const reportsCount = pendingReports.length;
  // Validaciones = fotos pendientes de ID (usuarios esperando verificación)
  const validationCount = photosCount;
  // Tickets = reportes pendientes de moderación
  const ticketsCount = reportsCount;

  const items: BranchedMenuItem[] = [
    {
      value: "/admin/wallet",
      label: "Wallet",
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      value: "/payments",
      label: "Transacciones",
      icon: <ArrowRightLeft className="h-4 w-4" />,
      badge: <NotifBadge count={pendingPaymentsCount} variant="amber" />,
    },
    {
      value: "/admin/tickets",
      label: "tickets de soporte",
      icon: <Ticket className="h-4 w-4" />,
    },
    {
      value: "/admin/publicaciones",
      label: "Publicaciones",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      value: "/users",
      label: "Accounts",
      icon: <Users className="h-4 w-4" />,
      badge: <NotifBadge count={validationCount} />,
    },
    {
      value: "/admin/boleteria",
      label: "Boletería",
      icon: <TicketIcon className="h-4 w-4" />,
    },
    {
      label: "Ads",
      icon: (
        <img
          src="/images/ads-icon.png"
          alt="Ads"
          className="h-4 w-4 object-contain"
        />
      ),
      children: [
        {
          value: "/admin/notificaciones",
          label: "Notificaciones",
          icon: <Bell className="h-4 w-4" />,
        },
        {
          // El gestor de banners (BannerSlidesManagement) vive en la
          // pestaña "Banners" de Notificaciones, bajo el grupo Ads.
          value: "/admin/notificaciones?tab=banners",
          label: "Banners",
          icon: <Megaphone className="h-4 w-4" />,
        },
      ],
    },
  ];

  const currentValue =
    pathname === "/admin/notificaciones" &&
    searchParams.get("tab") === "banners"
      ? "/admin/notificaciones?tab=banners"
      : pathname;
  const activeSectionIndex = items.findIndex((item) =>
    item.children?.some((kid) => kid.value === currentValue),
  );
  const isTopLevelActive = items.some((item) => item.value === currentValue);
  const defaultActive =
    activeSectionIndex >= 0 || isTopLevelActive ? currentValue : "";
  const defaultOpen = activeSectionIndex >= 0 ? [activeSectionIndex] : [];

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
      <aside className="w-full flex flex-col bg-white rounded-2xl shadow-xl pt-6 pb-4 px-4 bg-opacity-100">
        <div className="mb-6">
          <p className="text-xs font-jakarta font-semibold text-gray-400 uppercase tracking-wide">
            Navegación
          </p>
          <p className="mt-1 text-sm font-eras-bold text-gray-800">
            Panel de control
          </p>
        </div>

        <div className="flex-1 font-jakarta">
          <BranchedMenu
            items={items}
            defaultOpen={defaultOpen}
            defaultActive={defaultActive}
            onSelect={(value) => router.push(value)}
          />
        </div>
      </aside>
    </AnimatedContent>
  );
};

export default SidebarRoot;
