import { useCallback, useState } from "react";
import RecintosService from "@/services/RecintosService";
import {
  ErrorDeFigura,
  PalcoVendidoMovido,
  Recinto,
} from "@/interfaces/recinto.interface";
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
  // PEN-11: el backend pidió confirmar porque se movieron palcos vendidos
  // (por si el editor no lo detectó antes, ej. otra pestaña)
  const [porConfirmar, setPorConfirmar] = useState<PalcoVendidoMovido[] | null>(
    null,
  );

  const limpiarErrores = useCallback(() => {
    setErroresPorFigura({});
    setErroresGenerales([]);
  }, []);

  // Devuelve el recinto guardado, o null si no se pudo
  const guardar = useCallback(
    async (
      figuras: FiguraEditor[],
      versionBase: string,
      confirmarCambiosEnVendidos = false,
    ): Promise<Recinto | null> => {
      setGuardando(true);
      limpiarErrores();
      setPorConfirmar(null);
      try {
        const res = await RecintosService.guardarFiguras(recintoId, {
          versionBase,
          figuras: dibujoAEnvio(figuras),
          ...(confirmarCambiosEnVendidos && { confirmarCambiosEnVendidos }),
        });
        return res.data;
      } catch (err: any) {
        const data = err?.response?.data;
        const porFigura: Record<string, string> = {};
        const generales: string[] = [];

        if (data?.codigo === "CONFIRMAR_PALCOS_VENDIDOS") {
          setPorConfirmar(data.palcos as PalcoVendidoMovido[]);
          return null;
        }
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
    porConfirmar,
    cancelarConfirmacion: () => setPorConfirmar(null),
  };
};
