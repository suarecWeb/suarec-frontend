"use client";

import GestionPalcosEvento from "@/components/admin/boleteria/digital/evento/pestanas/GestionPalcosEvento";

interface GestionPalcosPageProps {
  params: { eventoId: string };
  // ?palco=ID: el palco que venia elegido desde otro evento de la feria
  searchParams: { palco?: string };
}

// Pestaña "Gestión de palcos" de un evento PALCO. El acceso, la barra y
// ?volver= son del layout ([eventoId]/layout.tsx); se llega también desde
// Ferias -> tab "Gestión de palcos"
const GestionPalcosPage = ({
  params,
  searchParams,
}: GestionPalcosPageProps) => {
  const palco = Number(searchParams.palco);
  return (
    <GestionPalcosEvento
      eventoId={Number(params.eventoId)}
      palcoInicial={Number.isInteger(palco) && palco > 0 ? palco : null}
    />
  );
};

export default GestionPalcosPage;
