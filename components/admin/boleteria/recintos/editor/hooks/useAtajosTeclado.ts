import { useEffect, useRef } from "react";
import { Orden } from "../acomodar";

interface Atajos {
  // Mientras se guarda el dibujo ningun atajo hace nada
  bloqueado: boolean;
  haySeleccion: boolean;
  hayCopia: boolean;
  onBorrar: () => void;
  onQuitarSeleccion: () => void;
  onSeleccionarTodo: () => void;
  onCopiar: () => void;
  onPegar: () => void;
  onDuplicar: () => void;
  onDeshacer: () => void;
  onRehacer: () => void;
  onOrdenar: (modo: Orden) => void;
}

// Atajos del editor, salvo si se esta escribiendo en un campo (ahi
// Ctrl/Cmd+Z es el deshacer del propio texto): Supr/Backspace borra, Esc
// quita la seleccion; Ctrl/Cmd + A, C, V, D selecciona todo, copia, pega
// y duplica; Ctrl/Cmd + Z deshace y Ctrl/Cmd + Shift + Z (o Ctrl + Y)
// rehace; Ctrl/Cmd + flecha arriba/abajo sube o baja una capa (con Shift:
// al frente o al fondo). Las flechas y no [ ]: en el teclado en espanol
// los corchetes no estan a mano
export const useAtajosTeclado = (atajos: Atajos) => {
  // Siempre los ultimos valores, sin volver a registrar el listener en
  // cada render
  const ultimos = useRef(atajos);
  ultimos.current = atajos;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      const a = ultimos.current;
      if (a.bloqueado) return;
      const conModificador = e.ctrlKey || e.metaKey;
      if (!conModificador) {
        if (e.key === "Delete" || e.key === "Backspace") a.onBorrar();
        if (e.key === "Escape") a.onQuitarSeleccion();
        return;
      }
      const tecla = e.key.toLowerCase();
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (!a.haySeleccion) return;
        e.preventDefault(); // Cmd + flecha desplaza la pagina en Mac
        const sube = e.key === "ArrowUp";
        a.onOrdenar(
          e.shiftKey ? (sube ? "frente" : "fondo") : sube ? "subir" : "bajar",
        );
      } else if (tecla === "z") {
        e.preventDefault();
        if (e.shiftKey) a.onRehacer();
        else a.onDeshacer();
      } else if (tecla === "y") {
        e.preventDefault();
        a.onRehacer();
      } else if (tecla === "a") {
        e.preventDefault(); // sin esto, selecciona el texto de la pagina
        a.onSeleccionarTodo();
      } else if (tecla === "c" && a.haySeleccion) {
        e.preventDefault();
        a.onCopiar();
      } else if (tecla === "v" && a.hayCopia) {
        e.preventDefault();
        a.onPegar();
      } else if (tecla === "d" && a.haySeleccion) {
        e.preventDefault(); // Ctrl+D del navegador es "agregar a favoritos"
        a.onDuplicar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
