import { useCallback, useState } from "react";

export interface Punto {
  x: number;
  y: number;
}

interface Tamano {
  ancho: number;
  alto: number;
}

// Limites del zoom, relativos a la escala de "ajustar" (100%)
const ZOOM_MINIMO_RELATIVO = 0.25;
const ZOOM_MAXIMO_RELATIVO = 20;
// Aire alrededor del lienzo al ajustarlo a la pantalla
const MARGEN_AJUSTE = 0.92;

// Vista del lienzo (PEN-25). El dibujo vive en unidades logicas
// (lienzoAncho x lienzoAlto); la vista solo decide con que escala y en
// que posicion se ve en esta pantalla. Nada de esto se guarda
export const useVistaLienzo = (lienzo: Tamano, pantalla: Tamano) => {
  // Escala y posicion juntas: el zoom cambia las dos a la vez
  const [vista, setVista] = useState({ escala: 1, x: 0, y: 0 });

  const escalaAjuste =
    pantalla.ancho > 0 && pantalla.alto > 0
      ? Math.min(pantalla.ancho / lienzo.ancho, pantalla.alto / lienzo.alto) *
        MARGEN_AJUSTE
      : 1;

  // Lienzo completo y centrado en la pantalla
  const ajustar = useCallback(() => {
    setVista({
      escala: escalaAjuste,
      x: (pantalla.ancho - lienzo.ancho * escalaAjuste) / 2,
      y: (pantalla.alto - lienzo.alto * escalaAjuste) / 2,
    });
  }, [escalaAjuste, pantalla.ancho, pantalla.alto, lienzo.ancho, lienzo.alto]);

  // Zoom dejando quieto el punto de pantalla indicado (el cursor, o el
  // centro si viene de los botones)
  const zoomEn = useCallback(
    (punto: Punto, factor: number) => {
      setVista((actual) => {
        const escala = Math.min(
          Math.max(actual.escala * factor, escalaAjuste * ZOOM_MINIMO_RELATIVO),
          escalaAjuste * ZOOM_MAXIMO_RELATIVO,
        );
        return {
          escala,
          x: punto.x - ((punto.x - actual.x) / actual.escala) * escala,
          y: punto.y - ((punto.y - actual.y) / actual.escala) * escala,
        };
      });
    },
    [escalaAjuste],
  );

  const mover = useCallback((x: number, y: number) => {
    setVista((actual) => ({ ...actual, x, y }));
  }, []);

  // Punto de pantalla -> unidades logicas enteras del lienzo (PEN-25)
  const aPuntoLogico = useCallback(
    (punto: Punto): Punto => ({
      x: Math.round((punto.x - vista.x) / vista.escala),
      y: Math.round((punto.y - vista.y) / vista.escala),
    }),
    [vista],
  );

  return {
    vista,
    // 1 = ajustado a la pantalla; se muestra como porcentaje
    zoomRelativo: vista.escala / escalaAjuste,
    ajustar,
    zoomEn,
    mover,
    aPuntoLogico,
  };
};
