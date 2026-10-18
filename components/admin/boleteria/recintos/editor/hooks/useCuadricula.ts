import { useCallback, useEffect, useState } from "react";
import { TamanoLienzo } from "../figuras";

// Tamanos de celda que se ofrecen, en unidades del lienzo
export const TAMANOS_CUADRICULA = [5, 10, 20, 25, 50, 100, 200];

// Si esta prendida se recuerda en este navegador (no es parte del dibujo)
const CLAVE = "suarec:editor-recinto:cuadricula";

// Unas 30 celdas en el lado corto del lienzo: sirve igual para una
// discoteca que para un estadio
export const tamanoSugerido = (lienzo: TamanoLienzo) => {
  const ideal = Math.min(lienzo.ancho, lienzo.alto) / 30;
  return TAMANOS_CUADRICULA.reduce((mejor, t) =>
    Math.abs(t - ideal) < Math.abs(mejor - ideal) ? t : mejor,
  );
};

// Cuadrícula del editor (PEN-24): lineas de fondo y el imán al mover y
// estirar. paso = tamano de celda si esta prendida, null si no
export const useCuadricula = (lienzo: TamanoLienzo) => {
  const [activa, setActiva] = useState(false);
  const [tamano, setTamano] = useState(() => tamanoSugerido(lienzo));

  useEffect(() => {
    try {
      setActiva(localStorage.getItem(CLAVE) === "1");
    } catch {
      // Sin almacenamiento (modo privado): arranca apagada
    }
  }, []);

  const alternar = useCallback(() => {
    setActiva((prev) => {
      try {
        localStorage.setItem(CLAVE, prev ? "0" : "1");
      } catch {
        // No se recuerda, pero funciona igual
      }
      return !prev;
    });
  }, []);

  return {
    activa,
    tamano,
    setTamano,
    alternar,
    paso: activa ? tamano : null,
  };
};
