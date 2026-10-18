// Fechas en hora de Colombia para la pagina de evento

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

// "2026-11-20": el dia del evento en Colombia (PEN-10 compara dias)
export const diaBogota = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

const partes = (dia: string) => {
  const [y, m, d] = dia.split("-").map(Number);
  return { y, m, d };
};

// "20 nov" (con el año si no es el actual)
export const diaCorto = (dia: string) => {
  const { y, m, d } = partes(dia);
  const anio = y !== new Date().getFullYear() ? ` ${y}` : "";
  return `${d} ${MESES[m - 1]}${anio}`;
};

// "18–23 nov", "28 nov – 2 dic"
export const rangoFechas = (inicioIso: string, finIso: string) => {
  const ini = diaBogota(inicioIso);
  const fin = diaBogota(finIso);
  const a = partes(ini);
  const b = partes(fin);
  if (ini === fin) return diaCorto(ini);
  if (a.y === b.y && a.m === b.m) return `${a.d}–${diaCorto(fin)}`;
  return `${a.y === b.y ? `${a.d} ${MESES[a.m - 1]}` : diaCorto(ini)} – ${diaCorto(fin)}`;
};
