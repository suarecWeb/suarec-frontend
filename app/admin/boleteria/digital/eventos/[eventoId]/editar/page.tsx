"use client";

import RoleGuard from "@/components/role-guard";
import EditarEventoDigital from "@/components/admin/boleteria/digital/evento/EditarEventoDigital";
import { volverSeguro } from "@/components/admin/boleteria/digital/evento/rutas";

interface EditarEventoPageProps {
  params: { eventoId: string };
  // ?volver=: a donde regresar al guardar o cancelar
  searchParams: { volver?: string };
}

// Editar evento DIGITAL. La página solo lee la dirección; el trabajo lo
// hace EditarEventoDigital
const EditarEventoPage = ({ params, searchParams }: EditarEventoPageProps) => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <EditarEventoDigital
      eventoId={Number(params.eventoId)}
      volver={volverSeguro(searchParams.volver)}
    />
  </RoleGuard>
);

export default EditarEventoPage;
