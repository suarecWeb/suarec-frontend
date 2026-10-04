"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
  CreateEventoDto,
  Evento,
  EventoEstado,
  EventoModalidad,
  EventoTipo,
} from "@/interfaces/event.interface";
import { toDatetimeLocal } from "@/lib/TimeZone";
import { PRECIO_MINIMO } from "../opciones";

export type CampoConError =
  | keyof CreateEventoDto
  | "imagen"
  | "codigos"
  | "servidor";
export type Errores = Partial<Record<CampoConError, string>>;

const VACIO: CreateEventoDto = {
  nombre: "",
  descripcion: "",
  fechaEvento: "",
  ubicacion: "",
  aforoTotal: undefined,
  precioBase: undefined,
  comision: undefined,
  estado: EventoEstado.PREVENTA,
  formatId: undefined,
  nombreOrganizador: "",
};

const entero = (valor?: number) =>
  valor !== undefined && valor !== null ? Math.round(Number(valor)) : undefined;

const desdeEvento = (evento: Evento): CreateEventoDto => ({
  nombre: evento.nombre,
  descripcion: evento.descripcion ?? "",
  fechaEvento: toDatetimeLocal(evento.fechaEvento),
  ubicacion: evento.ubicacion,
  aforoTotal: evento.aforoTotal ? entero(evento.aforoTotal) : undefined,
  // Un evento viejo en $0 aparece vacío: hay que ponerle precio
  precioBase: evento.precioBase ? entero(evento.precioBase) : undefined,
  comision: entero(evento.comision),
  estado: evento.estado,
  formatId: evento.formatId,
  feriaId: evento.feriaId,
  nombreOrganizador: evento.nombreOrganizador ?? "",
});

// Los campos de un evento DIGITAL con las mismas validaciones que tenian
// las ventanas de crear y editar. Cambios de la pagina: la feria es
// opcional (salvo PALCO) y en un PALCO el aforo sale del dibujo
// feriaInicial: al crear desde una feria, llega ya elegida
export function useFormularioEvento(evento?: Evento, feriaInicial?: number) {
  const editando = !!evento;
  const [form, setForm] = useState<CreateEventoDto>(() =>
    evento ? desdeEvento(evento) : { ...VACIO, feriaId: feriaInicial },
  );
  const [tipo, setTipoState] = useState<EventoTipo | null>(
    evento?.tipo ?? null,
  );
  const [cargoSuarec, setCargoSuarec] = useState<number | undefined>(
    entero(evento?.cargoSuarec),
  );
  const [errores, setErrores] = useState<Errores>({});

  // Imagen: al editar arranca con la que ya tiene
  const [imagenPreview, setImagenPreview] = useState<string | null>(
    evento?.imagenUrl ?? null,
  );
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null);
  const [imagenQuitada, setImagenQuitada] = useState(false);
  const inputImagenRef = useRef<HTMLInputElement>(null);

  // Solo al crear: se generan despues de crear el evento. Al editar son
  // una accion aparte (CodigosRegalo)
  const [generarCodigos, setGenerarCodigos] = useState(false);
  const [cantidadCodigos, setCantidadCodigos] = useState<number | undefined>();

  useEffect(
    () => () => {
      if (imagenPreview?.startsWith("blob:"))
        URL.revokeObjectURL(imagenPreview);
    },
    [imagenPreview],
  );

  const limpiarError = (campo: CampoConError) =>
    setErrores((prev) =>
      prev[campo] ? { ...prev, [campo]: undefined } : prev,
    );

  const cambiar = (
    campo: keyof CreateEventoDto,
    valor: string | number | undefined,
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    limpiarError(campo);
  };

  const setTipo = (nuevo: EventoTipo) => {
    setTipoState(nuevo);
    limpiarError("tipo");
  };

  const elegirImagen = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setImagenArchivo(archivo);
    setImagenPreview(URL.createObjectURL(archivo));
    // La imagen nueva manda: si antes se quito, el backend no debe borrarla
    setImagenQuitada(false);
    limpiarError("imagen");
  };

  const quitarImagen = () => {
    setImagenPreview(null);
    setImagenArchivo(null);
    setImagenQuitada(true);
    if (inputImagenRef.current) inputImagenRef.current.value = "";
  };

  const esPalco = tipo === EventoTipo.PALCO;

  // Al editar: algo distinto de lo guardado (para avisar antes de cambiar
  // de pestaña). Los precios de los palcos los cuenta usePreciosPalcos
  const [formInicial] = useState(form);
  const hayCambios =
    editando &&
    (JSON.stringify(form) !== JSON.stringify(formInicial) ||
      tipo !== (evento?.tipo ?? null) ||
      cargoSuarec !== entero(evento?.cargoSuarec) ||
      !!imagenArchivo ||
      imagenQuitada);

  // recintoDeLaFeria: null si la feria elegida no tiene recinto.
  // choqueFecha: otro PALCO de la feria ese dia (PEN-10), ya escrito.
  // palcosDelDibujo: null mientras carga el recinto
  const validar = ({
    recintoDeLaFeria,
    choqueFecha,
    palcosDelDibujo,
  }: {
    recintoDeLaFeria: number | null;
    choqueFecha: string | null;
    palcosDelDibujo: number | null;
  }): boolean => {
    const e: Errores = {};
    const nombre = form.nombre.trim();
    if (!nombre) e.nombre = "El nombre es obligatorio";
    else if (nombre.length < 3)
      e.nombre = "El nombre debe tener al menos 3 caracteres";
    else if (nombre.length > 150)
      e.nombre = "El nombre no puede superar 150 caracteres";

    if (form.descripcion && form.descripcion.length > 2000)
      e.descripcion = "La descripción no puede superar 2000 caracteres";

    if (!form.fechaEvento) {
      e.fechaEvento = "La fecha es obligatoria";
    } else {
      const fecha = new Date(form.fechaEvento);
      const hoy = new Date();
      const max = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      max.setFullYear(max.getFullYear() + 2);
      if (fecha < hoy) e.fechaEvento = "La fecha debe ser hoy o en el futuro";
      else if (fecha > max)
        e.fechaEvento = "La fecha no puede ser mayor a 2 años desde hoy";
      else if (esPalco && choqueFecha) e.fechaEvento = choqueFecha;
    }

    const ubicacion = form.ubicacion.trim();
    if (!ubicacion) e.ubicacion = "El lugar es obligatorio";
    else if (ubicacion.length > 200)
      e.ubicacion = "El lugar no puede superar 200 caracteres";

    const organizador = form.nombreOrganizador?.trim() ?? "";
    if (!organizador)
      e.nombreOrganizador = "El nombre del organizador es obligatorio";
    else if (organizador.length > 150)
      e.nombreOrganizador =
        "El nombre del organizador no puede superar 150 caracteres";

    // Aforo obligatorio (la base no acepta 0). En PALCO no se escribe:
    // son los palcos dibujados en el recinto de la feria
    if (!esPalco) {
      if (form.aforoTotal === undefined)
        e.aforoTotal = "El aforo es obligatorio";
      else if (!Number.isInteger(form.aforoTotal))
        e.aforoTotal = "El aforo debe ser un número entero";
      else if (form.aforoTotal < 1)
        e.aforoTotal = "El aforo debe ser mayor a 0";
      else if (form.aforoTotal > 4000)
        e.aforoTotal = "El aforo no puede superar 4000";
    }

    // Obligatorio y desde $10.000: la pasarela cobra un costo por cada
    // transacción (también lo exige el backend)
    if (form.precioBase === undefined)
      e.precioBase = "El precio base es obligatorio";
    else if (form.precioBase < PRECIO_MINIMO)
      e.precioBase = "El precio mínimo es $10.000 COP";

    if (!form.formatId) e.formatId = "Debes seleccionar un formato de imagen";
    if (!editando && !imagenArchivo)
      e.imagen = "La imagen del evento es obligatoria";
    if (!tipo) e.tipo = "Debes seleccionar el tipo de evento";

    // Un PALCO necesita el mapa de su feria (tambien lo frena el backend)
    if (esPalco && !form.feriaId)
      e.feriaId = "Un evento PALCO necesita una feria con recinto";
    else if (esPalco && !recintoDeLaFeria)
      e.feriaId =
        "Esta feria no tiene recinto: asígnale uno en Ferias o elige otra";
    // Sin palcos el aforo seria 0 y la base no lo acepta
    // (eventos_aforo_total_check)
    else if (esPalco && !editando && palcosDelDibujo === 0)
      e.feriaId =
        "El recinto de esta feria no tiene palcos dibujados: dibújalos en Recintos o elige otra feria";

    if (
      !editando &&
      generarCodigos &&
      (!cantidadCodigos || cantidadCodigos < 1)
    )
      e.codigos = "Indica cuántos códigos generar (mínimo 1)";

    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // Lo que se manda al backend. En PALCO el admin no escribe el aforo: al
  // crear es la cantidad de palcos del dibujo (la base exige aforo > 0,
  // eventos_aforo_total_check). Al editar no se toca, para no chocar con
  // las ventas; en la fase 4 se calcula al vuelo
  const aDto = (palcosDelDibujo?: number | null): CreateEventoDto => ({
    ...form,
    aforoTotal: esPalco
      ? editando
        ? undefined
        : (palcosDelDibujo ?? undefined)
      : form.aforoTotal,
    tipo: tipo ?? undefined,
    cargoSuarec,
    ...(editando
      ? { removeImage: imagenQuitada }
      : { modalidad: EventoModalidad.DIGITAL }),
  });

  return {
    editando,
    form,
    cambiar,
    tipo,
    setTipo,
    esPalco,
    cargoSuarec,
    setCargoSuarec,
    errores,
    setErrores,
    limpiarError,
    imagen: {
      preview: imagenPreview,
      archivo: imagenArchivo,
      inputRef: inputImagenRef,
      elegir: elegirImagen,
      quitar: quitarImagen,
    },
    codigos: {
      generar: generarCodigos,
      setGenerar: setGenerarCodigos,
      cantidad: cantidadCodigos,
      setCantidad: setCantidadCodigos,
    },
    validar,
    aDto,
    hayCambios,
  };
}

export type FormularioEvento = ReturnType<typeof useFormularioEvento>;
