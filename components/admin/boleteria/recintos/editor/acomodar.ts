import { FiguraEditor, TamanoLienzo } from "./figuras";

// Acomodar figuras (PEN-24): alinear, distribuir, imán de la cuadrícula y
// orden de dibujo (capas). Funciones puras: el editor aplica el resultado
// en un solo paso (se deshace de una vez)

export type Alineacion =
  | "izquierda"
  | "centro"
  | "derecha"
  | "arriba"
  | "medio"
  | "abajo";

// Medio ancho y medio alto de lo que ocupa la figura en el lienzo YA
// girada: un rectangulo de 80 x 50 rotado 90° ocupa 50 de ancho
export const mitadesDe = (f: FiguraEditor) => {
  if (f.forma === "CIRCULO") return { mx: f.ancho / 2, my: f.ancho / 2 };
  const rad = (f.rotacion * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    mx: (f.ancho * cos + f.alto * sin) / 2,
    my: (f.ancho * sin + f.alto * cos) / 2,
  };
};

// La caja que encierra a todas
const cajaDe = (figuras: FiguraEditor[]) => {
  const bordes = figuras.map((f) => {
    const { mx, my } = mitadesDe(f);
    return { izq: f.x - mx, der: f.x + mx, arr: f.y - my, aba: f.y + my };
  });
  return {
    izq: Math.min(...bordes.map((b) => b.izq)),
    der: Math.max(...bordes.map((b) => b.der)),
    arr: Math.min(...bordes.map((b) => b.arr)),
    aba: Math.max(...bordes.map((b) => b.aba)),
  };
};

const entre = (valor: number, maximo: number) =>
  Math.min(Math.max(Math.round(valor), 0), maximo);

// Nuevas posiciones al alinear, solo de las que cambian. Con varias, la
// referencia es la caja de TODO lo seleccionado, asi una bloqueada sirve
// de ancla (ej: alinear palcos con la tarima). Con UNA sola, la referencia
// es el lienzo (pegarla a un borde o centrarla, como "Posición" en Canva).
// Las bloqueadas no se mueven. Solo cambia el eje que se alinea, y el
// centro nunca sale del lienzo
export const alinearFiguras = (
  figuras: FiguraEditor[],
  modo: Alineacion,
  lienzo: TamanoLienzo,
): Record<string, Partial<FiguraEditor>> => {
  const caja =
    figuras.length === 1
      ? { izq: 0, der: lienzo.ancho, arr: 0, aba: lienzo.alto }
      : cajaDe(figuras);
  const cambios: Record<string, Partial<FiguraEditor>> = {};
  figuras
    .filter((f) => !f.bloqueada)
    .forEach((f) => {
      const { mx, my } = mitadesDe(f);
      const destinos: Record<Alineacion, Partial<FiguraEditor>> = {
        izquierda: { x: caja.izq + mx },
        centro: { x: (caja.izq + caja.der) / 2 },
        derecha: { x: caja.der - mx },
        arriba: { y: caja.arr + my },
        medio: { y: (caja.arr + caja.aba) / 2 },
        abajo: { y: caja.aba - my },
      };
      const destino = destinos[modo];
      if (destino.x !== undefined) {
        const x = entre(destino.x, lienzo.ancho);
        if (x !== f.x) cambios[f.clave] = { x };
      } else if (destino.y !== undefined) {
        const y = entre(destino.y, lienzo.alto);
        if (y !== f.y) cambios[f.clave] = { y };
      }
    });
  return cambios;
};

// Imán de la cuadrícula: el borde izquierdo y el de arriba de la figura (ya
// girada) caen sobre una linea. Asi las figuras de una fila quedan a la
// misma altura aunque tengan distinto tamano. Recibe y devuelve el centro
export const ajustarACuadricula = (
  centro: { x: number; y: number },
  f: FiguraEditor,
  paso: number,
) => {
  const { mx, my } = mitadesDe(f);
  return {
    x: Math.round((centro.x - mx) / paso) * paso + mx,
    y: Math.round((centro.y - my) / paso) * paso + my,
  };
};

// Orden de dibujo (capas), como "Traer al frente" en Canva
export type Orden = "frente" | "subir" | "bajar" | "fondo";

// Reordena las figuras elegidas DENTRO de su grupo: referencias entre si y
// palcos entre si. Una referencia nunca pasa encima de un palco (RN-04):
// el editor y la app dibujan primero todas las referencias. Cada figura
// conserva el lugar de su tipo en el arreglo, asi que si nada cambia el
// resultado es identico (y no cuenta como paso para deshacer)
export const reordenar = (
  figuras: FiguraEditor[],
  claves: Set<string>,
  modo: Orden,
): FiguraEditor[] => {
  const porTipo = new Map<string, FiguraEditor[]>();
  figuras.forEach((f) =>
    porTipo.set(f.tipo, [...(porTipo.get(f.tipo) ?? []), f]),
  );

  const nuevos = new Map<string, FiguraEditor[]>();
  porTipo.forEach((grupo, tipo) => {
    const elegida = (f: FiguraEditor) => claves.has(f.clave);
    let lista = [...grupo];
    if (modo === "frente") {
      lista = [...lista.filter((f) => !elegida(f)), ...lista.filter(elegida)];
    } else if (modo === "fondo") {
      lista = [...lista.filter(elegida), ...lista.filter((f) => !elegida(f))];
    } else if (modo === "subir") {
      // De arriba hacia abajo: cada elegida salta a la siguiente no elegida
      for (let i = lista.length - 2; i >= 0; i--) {
        if (elegida(lista[i]) && !elegida(lista[i + 1])) {
          [lista[i], lista[i + 1]] = [lista[i + 1], lista[i]];
        }
      }
    } else {
      for (let i = 1; i < lista.length; i++) {
        if (elegida(lista[i]) && !elegida(lista[i - 1])) {
          [lista[i], lista[i - 1]] = [lista[i - 1], lista[i]];
        }
      }
    }
    nuevos.set(tipo, lista);
  });

  // Cada lugar del arreglo se llena con la siguiente figura de su tipo
  const usados: Record<string, number> = {};
  return figuras.map((f) => {
    const i = usados[f.tipo] ?? 0;
    usados[f.tipo] = i + 1;
    return (nuevos.get(f.tipo) as FiguraEditor[])[i];
  });
};

export type Distribucion = "horizontal" | "vertical";

// Distribuir (PEN-24): el MISMO espacio entre los bordes de las figuras, en
// un eje. Las dos de los extremos no se mueven y las del medio se reparten
// entre ellas en su orden actual (por su centro). Bordes de la figura ya
// girada. Las bloqueadas no se mueven ni cuentan; hacen falta 3 libres. Si
// no caben, quedan con el mismo traslape (como Canva). Solo cambia ese eje
export const distribuirFiguras = (
  figuras: FiguraEditor[],
  eje: Distribucion,
  lienzo: TamanoLienzo,
): Record<string, Partial<FiguraEditor>> => {
  const libres = figuras.filter((f) => !f.bloqueada);
  if (libres.length < 3) return {};
  const horizontal = eje === "horizontal";

  const datos = libres
    .map((f) => {
      const { mx, my } = mitadesDe(f);
      return {
        f,
        centro: horizontal ? f.x : f.y,
        mitad: horizontal ? mx : my,
      };
    })
    .sort((a, b) => a.centro - b.centro);

  const primero = datos[0];
  const ultimo = datos[datos.length - 1];
  const medio = datos.slice(1, -1);
  const desde = primero.centro + primero.mitad;
  const hasta = ultimo.centro - ultimo.mitad;
  const ocupado = medio.reduce((total, d) => total + d.mitad * 2, 0);
  const espacio = (hasta - desde - ocupado) / (datos.length - 1);

  const cambios: Record<string, Partial<FiguraEditor>> = {};
  let borde = desde + espacio;
  medio.forEach((d) => {
    const centro = entre(
      borde + d.mitad,
      horizontal ? lienzo.ancho : lienzo.alto,
    );
    if (centro !== (horizontal ? d.f.x : d.f.y)) {
      cambios[d.f.clave] = horizontal ? { x: centro } : { y: centro };
    }
    borde += d.mitad * 2 + espacio;
  });
  return cambios;
};
