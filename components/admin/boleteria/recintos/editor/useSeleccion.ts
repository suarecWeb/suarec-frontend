import { useCallback, useState } from "react";

// Figuras seleccionadas (por clave). Una o varias, como en Canva:
// - presionar una figura sin Shift la selecciona sola, salvo que ya este
//   en el grupo (asi se puede arrastrar el grupo desde cualquiera)
// - clic sin arrastrar sobre una del grupo deja solo esa
// - Shift + clic la agrega o la quita
export const useSeleccion = () => {
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const alPresionar = useCallback((clave: string, conShift: boolean) => {
    setSeleccion((actual) => {
      if (conShift) {
        return actual.includes(clave)
          ? actual.filter((c) => c !== clave)
          : [...actual, clave];
      }
      return actual.includes(clave) ? actual : [clave];
    });
  }, []);

  const alHacerClic = useCallback((clave: string, conShift: boolean) => {
    if (conShift) return;
    setSeleccion((actual) =>
      actual.length > 1 && actual.includes(clave) ? [clave] : actual,
    );
  }, []);

  const limpiar = useCallback(() => setSeleccion([]), []);

  return { seleccion, setSeleccion, alPresionar, alHacerClic, limpiar };
};
