import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import FeriasService from "@/services/FeriasService";
import { Feria } from "@/interfaces/feria.interface";

// Carga una feria con TODOS sus eventos (tambien los ocultos). No hay
// endpoint admin por id: se busca en el listado admin, que es el mismo
// dato que usaba "Editar feria" antes de tener su propia pagina
export const useFeriaAdmin = (feriaId: number) => {
  const router = useRouter();
  const [feria, setFeria] = useState<Feria | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const volverALista = (mensaje: string) => {
      toast.error(mensaje);
      router.replace("/admin/boleteria/ferias");
    };

    if (Number.isNaN(feriaId)) {
      volverALista("ID de feria inválido");
      return;
    }

    FeriasService.getAllFeriasAdmin()
      .then((res) => {
        const encontrada = res.data.find((f) => f.id === feriaId);
        if (encontrada) setFeria(encontrada);
        else volverALista("Feria no encontrada");
      })
      .catch(() => volverALista("No se pudo cargar la feria"))
      .finally(() => setLoading(false));
  }, [feriaId, router]);

  return { feria, loading };
};
