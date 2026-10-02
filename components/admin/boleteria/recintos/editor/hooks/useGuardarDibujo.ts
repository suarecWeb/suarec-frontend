import { useCallback, useState } from "react";
import RecintosService from "@/services/RecintosService";
import { ErrorDeFigura, Recinto } from "@/interfaces/recinto.interface";
import { FiguraEditor, dibujoAEnvio } from "../figuras";

// Guardar el dibujo en el sistema: un solo envio, todo o nada (el backend
// valida todo antes de escribir). Si falla, el dibujo sigue en pantalla
// (y en el borrador) y los problemas quedan a la vista
export const useGuardarDibujo = (recintoId: number) => {
  const [guardando, setGuardando] = useState(false);
  // Problemas de figuras que estan en pantalla, por su clave local
  const [erroresPorFigura, setErroresPorFigura] = useState<
    Record<string, string>
  >({});
  // Problemas generales (version vieja, figuras borradas que no se podian
  // borrar, errores de red...)
  const [erroresGenerales, setErroresGenerales] = useState<string[]>([]);

  const limpiarErrores = useCallback(() => {
    setErroresPorFigura({});
    setErroresGenerales([]);
  }, []);

  // Devuelve el recinto guardado, o null si no se pudo
  const guardar = useCallback(
    async (
      figuras: FiguraEditor[],
      versionBase: string,
    ): Promise<Recinto | null> => {
      setGuardando(true);
      limpiarErrores();
      try {
        const res = await RecintosService.guardarFiguras(recintoId, {
          versionBase,
          figuras: dibujoAEnvio(figuras),
        });
        return res.data;
      } catch (err: any) {
        const data = err?.response?.data;
        const porFigura: Record<string, string> = {};
        const generales: string[] = [];

        if (data?.codigo === "FIGURAS_CON_ERRORES") {
          generales.push(data.message);
          (data.errores as ErrorDeFigura[]).forEach((e) => {
            const figura = e.indice !== null ? figuras[e.indice] : undefined;
            if (figura) porFigura[figura.clave] = e.mensaje;
            else
              generales.push(
                `${e.nombre ?? "Figura sin nombre"} (borrado): ${e.mensaje}`,
              );
          });
        } else if (Array.isArray(data?.message)) {
          generales.push(...data.message);
        } else {
          generales.push(
            typeof data?.message === "string"
              ? data.message
              : "No se pudo guardar el recinto. Revisa tu conexión e intenta de nuevo.",
          );
        }
        setErroresPorFigura(porFigura);
        setErroresGenerales(generales);
        return null;
      } finally {
        setGuardando(false);
      }
    },
    [recintoId, limpiarErrores],
  );

  return {
    guardar,
    guardando,
    erroresPorFigura,
    erroresGenerales,
    limpiarErrores,
  };
};
