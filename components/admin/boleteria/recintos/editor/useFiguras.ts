import { useCallback, useState } from "react";
import { FiguraEditor } from "./figuras";

// Las figuras del dibujo en memoria. Todas las modificaciones pasan por
// aqui: guardar (item 6) y deshacer/rehacer (item 5) se apoyan en esto
// iniciales como funcion: solo se calcula al montar el editor
export const useFiguras = (iniciales: () => FiguraEditor[]) => {
  const [figuras, setFiguras] = useState<FiguraEditor[]>(iniciales);

  const agregar = useCallback((figura: FiguraEditor) => {
    setFiguras((prev) => [...prev, figura]);
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

  // Todo el dibujo de una vez (ej: al recuperar un borrador)
  const reemplazar = useCallback((nuevas: FiguraEditor[]) => {
    setFiguras(nuevas);
  }, []);

  return { figuras, agregar, actualizar, borrar, reemplazar };
};
