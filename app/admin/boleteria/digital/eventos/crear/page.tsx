"use client";

import RoleGuard from "@/components/role-guard";
import FormularioEventoDigital from "@/components/admin/boleteria/digital/evento/FormularioEventoDigital";
import { volverSeguro } from "@/components/admin/boleteria/digital/evento/rutas";

interface NuevoEventoPageProps {
  // ?volver=: a donde regresar al guardar o cancelar
  // ?feria=: se entra desde una feria y llega ya elegida
  searchParams: { volver?: string; feria?: string };
}

// Crear evento DIGITAL (reemplaza la ventana "Crear evento").
// Dirección: /admin/boleteria/digital/eventos/crear
const NuevoEventoPage = ({ searchParams }: NuevoEventoPageProps) => {
  const volver = volverSeguro(searchParams.volver);
  const feria = Number(searchParams.feria);
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <FormularioEventoDigital
        titulo="Nuevo evento"
        volver={volver}
        feriaInicial={Number.isInteger(feria) && feria > 0 ? feria : undefined}
      />
    </RoleGuard>
  );
};

export default NuevoEventoPage;
