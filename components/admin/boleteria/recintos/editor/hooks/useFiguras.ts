import { useCallback, useState } from "react";
import { FiguraEditor } from "../figuras";

// Las figuras del dibujo en memoria. Todas las modificaciones pasan por
// aqui: guardar (item 6) y deshacer/rehacer (item 5) se apoyan en esto
// iniciales como funcion: solo se calcula al montar el editor
export const useFiguras = (iniciales: () => FiguraEditor[]) => {
  const [figuras, setFiguras] = useState<FiguraEditor[]>(iniciales);

  const agregar = useCallback((figura: FiguraEditor) => {
    setFiguras((prev) => [...prev, figura]);
  }, []);

  // Varias de una vez (pegar o duplicar un grupo)
  const agregarVarias = useCallback((nuevas: FiguraEditor[]) => {
    setFiguras((prev) => [...prev, ...nuevas]);
  }, []);

  const actualizar = useCallback(
    (clave: string, cambios: Partial<FiguraEditor>) => {
      setFiguras((prev) =>
        prev.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)),
      );
    },
    [],
  );

  const borrar = useCallback((clave: string) => {
    setFiguras((prev) => prev.filter((f) => f.clave !== clave));
  }, []);

  const borrarVarias = useCallback((claves: string[]) => {
    const aBorrar = new Set(claves);
    setFiguras((prev) => prev.filter((f) => !aBorrar.has(f.clave)));
  }, []);

  // Todo el dibujo de una vez (ej: al recuperar un borrador)
  const reemplazar = useCallback((nuevas: FiguraEditor[]) => {
    setFiguras(nuevas);
  }, []);

  return {
    figuras,
    agregar,
    agregarVarias,
    actualizar,
    borrar,
    borrarVarias,
    reemplazar,
  };
};
