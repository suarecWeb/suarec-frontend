//zona horaria.
const TZ = "America/Bogota";

export const toDatetimeLocal = (iso: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
};

export const formatDisplayDate = (iso: string): string => {
  if (!iso) return "";

  return new Date(iso).toLocaleString("es-CO", {
    timeZone: TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",

    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
