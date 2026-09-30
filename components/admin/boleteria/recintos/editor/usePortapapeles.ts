import { useCallback, useRef, useState } from "react";
import { FiguraEditor, Lienzo, copiasDeFiguras } from "./figuras";

// Copiar y pegar figuras como en Canva, solo dentro de ESTE recinto y
// mientras el editor este abierto (no usa el portapapeles del sistema).
// Trabaja con grupos: una figura sola es un grupo de una
export const usePortapapeles = (
  figuras: FiguraEditor[],
  lienzo: Lienzo,
  agregarVarias: (nuevas: FiguraEditor[]) => void,
) => {
  const [copiadas, setCopiadas] = useState<FiguraEditor[]>([]);
  // Veces que se pego lo copiado: cada pegada sale un poco mas corrida
  const vecesPegada = useRef(0);

  const copiar = useCallback((grupo: FiguraEditor[]) => {
    setCopiadas(grupo);
    vecesPegada.current = 0;
  }, []);

  // Pega copias de un grupo dado (duplicar) o de lo copiado (pegar).
  // Devuelve las nuevas para dejarlas seleccionadas
  const pegarDesde = useCallback(
    (grupo: FiguraEditor[]): FiguraEditor[] => {
      if (grupo.length === 0) return [];
      vecesPegada.current += 1;
      const nuevas = copiasDeFiguras(
        grupo,
        figuras,
        lienzo,
        vecesPegada.current,
      );
      agregarVarias(nuevas);
      return nuevas;
    },
    [figuras, lienzo, agregarVarias],
  );

  const pegar = useCallback(() => pegarDesde(copiadas), [pegarDesde, copiadas]);

  // Duplicar = copiar y pegar de una vez (Ctrl/Cmd+D)
  const duplicar = useCallback(
    (grupo: FiguraEditor[]) => {
      copiar(grupo);
      return pegarDesde(grupo);
    },
    [copiar, pegarDesde],
  );

  return { hayCopia: copiadas.length > 0, copiar, pegar, duplicar };
};
