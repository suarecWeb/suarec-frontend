import { MapaEventoPalco } from "@/interfaces/palcos.interface";
import { PreciosPalcosEstado } from "./hooks/usePreciosPalcos";

// RN-25 en la pagina: lo que pasa al cambiarle la feria a un evento PALCO.
// El backend aplica las mismas reglas; aqui solo se avisa antes

interface Situacion {
  // Al editar un PALCO: su mapa al abrir la pagina (null en otro caso)
  original: MapaEventoPalco | null;
  feriaCambia: boolean;
  precios: PreciosPalcosEstado;
  // Boletas vendidas de un PALCO sin mapa (feria sin recinto)
  vendidasSinMapa: number;
  // La feria elegida tiene recinto
  recintoNuevo: boolean;
}

const ventasDe = (o: MapaEventoPalco | null) =>
  o ? o.palcos.length + o.palcosFueraDelRecinto : 0;

const palcos = (n: number, estado: string) =>
  n === 1 ? `1 palco ${estado}` : `${n} palcos ${estado}s`;

// Lo que impide guardar (null si se puede)
export const bloqueoDeFeria = ({
  original,
  feriaCambia,
  precios,
  vendidasSinMapa,
  recintoNuevo,
}: Situacion): string | null => {
  if (!original || !feriaCambia) return null;
  if (original.palcos.some((p) => p.estado === "EN_COMPRA"))
    return "Hay una compra de palco en curso en este evento: espera a que termine para cambiar la feria.";
  const ventas = ventasDe(original);
  if (ventas > 0 && precios.recintoCambia)
    return `Este evento tiene ${palcos(ventas, "vendido")} o apartado${ventas === 1 ? "" : "s"} y esa feria ${recintoNuevo ? "usa otro recinto" : "no tiene recinto"}: no se puede cambiar (RN-25). Si son apartados, libéralos primero; los palcos vendidos no se pueden pasar a otro recinto.`;
  if (vendidasSinMapa > 0 && recintoNuevo && !original.recinto)
    return `Este evento PALCO ya vendió ${vendidasSinMapa} boleta${vendidasSinMapa === 1 ? "" : "s"} sin mapa: no puede pasar a una feria con recinto porque esas ventas no tienen palco (RN-25).`;
  return null;
};

// Avisos junto al selector de feria
export const avisosDeFeria = ({
  original,
  feriaCambia,
  precios,
}: Situacion): string[] => {
  const avisos: string[] = [];
  const ventas = ventasDe(original);
  if (!feriaCambia && ventas > 0)
    avisos.push(
      `Este evento tiene ${palcos(ventas, "vendido")} o apartado${ventas === 1 ? "" : "s"}: solo puede pasar a una feria con el mismo recinto.`,
    );
  if (feriaCambia && precios.preciosPerdidos > 0)
    avisos.push(
      `Esa feria usa otro recinto: los precios propios de este evento (${precios.preciosPerdidos}) se borran al guardar.`,
    );
  return avisos;
};

// Avisos del formulario de confirmacion
export const avisosAlConfirmar = (s: Situacion, creando: boolean): string[] => {
  if (creando)
    return [
      "El tipo PALCO no se puede cambiar después de crear el evento.",
      "Solo puede haber un evento PALCO por día en esta feria.",
    ];
  const avisos = [
    s.precios.recintoCambia
      ? s.precios.preciosPerdidos > 0
        ? `La feria nueva usa otro recinto: los ${s.precios.preciosPerdidos} precios propios anteriores se borran y quedan los que pusiste ahora.`
        : "La feria nueva usa otro recinto: el mapa del evento cambia."
      : "La feria nueva usa el mismo recinto: los palcos y sus precios se conservan.",
  ];
  if (ventasDe(s.original) > 0)
    avisos.push(
      "Las boletas ya vendidas siguen valiendo: su código no depende de la feria.",
    );
  avisos.push("Solo puede haber un evento PALCO por día en la feria nueva.");
  return avisos;
};
