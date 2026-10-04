"use client";

import { ReactNode, Suspense } from "react";
import RoleGuard from "@/components/role-guard";
import LayoutEvento from "@/components/admin/boleteria/digital/evento/layout/LayoutEvento";

interface EventoLayoutProps {
  children: ReactNode;
  params: { eventoId: string };
}

// Pantalla de un evento digital: "Datos y precios" (editar/) y, en un
// PALCO, "Gestión de palcos" (gestion-de-palcos/). El marco queda montado
// al cambiar de pestaña; solo cambia el contenido. Suspense: LayoutEvento
// lee ?volver= de la dirección
const EventoLayout = ({ children, params }: EventoLayoutProps) => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <Suspense fallback={null}>
      <LayoutEvento eventoId={Number(params.eventoId)}>{children}</LayoutEvento>
    </Suspense>
  </RoleGuard>
);

export default EventoLayout;
