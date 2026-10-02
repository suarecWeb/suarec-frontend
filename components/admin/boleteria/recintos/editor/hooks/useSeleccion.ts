import { useCallback, useRef, useState } from "react";

// Figuras seleccionadas (por clave). Una o varias, como en Canva:
// - presionar una figura sin Shift la selecciona sola, salvo que ya este
//   en el grupo (asi se puede arrastrar el grupo desde cualquiera)
// - clic sin arrastrar sobre una del grupo deja solo esa
// - Shift + clic agrega la figura o la quita del grupo
// - Shift + arrastrar mueve el grupo: presionar con Shift sobre una del
//   grupo NO la quita (si no, el arrastre la sacaba y se movia sola); se
//   quita recien en el clic, si no hubo arrastre (Konva no avisa clic
//   despues de arrastrar). Con Shift sobre una que no esta, se agrega al
//   presionar y se arrastra junto con las demas
export const useSeleccion = () => {
  const [seleccion, setSeleccion] = useState<string[]>([]);
  // La que se presiono con Shift estando YA en el grupo: se quita en el
  // clic (si se arrastro, no llega clic y sigue en el grupo)
  const quitarAlSoltar = useRef<string | null>(null);

  const alPresionar = useCallback((clave: string, conShift: boolean) => {
    setSeleccion((actual) => {
      if (conShift) {
        if (actual.includes(clave)) {
          quitarAlSoltar.current = clave;
          return actual;
        }
        quitarAlSoltar.current = null;
        return [...actual, clave];
      }
      quitarAlSoltar.current = null;
      return actual.includes(clave) ? actual : [clave];
    });
  }, []);

  const alHacerClic = useCallback((clave: string, conShift: boolean) => {
    if (conShift) {
      if (quitarAlSoltar.current === clave) {
        setSeleccion((actual) => actual.filter((c) => c !== clave));
      }
      quitarAlSoltar.current = null;
      return;
    }
    setSeleccion((actual) =>
      actual.length > 1 && actual.includes(clave) ? [clave] : actual,
    );
  }, []);

  const limpiar = useCallback(() => setSeleccion([]), []);

  return { seleccion, setSeleccion, alPresionar, alHacerClic, limpiar };
};
