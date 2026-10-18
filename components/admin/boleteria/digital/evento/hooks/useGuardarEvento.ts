"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import EventsService from "@/services/EventsService";
import PalcosService from "@/services/PalcosService";
import { Evento } from "@/interfaces/event.interface";
import { PrecioPalco } from "@/interfaces/palcos.interface";
import { FormularioEvento } from "./useFormularioEvento";
import { rutaEditarEvento } from "../rutas";

export const mensajeDe = (err: any, porDefecto: string): string => {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return typeof msg === "string" ? msg : porDefecto;
};

interface GuardarArgs {
  // null: no se tocan los precios (no es PALCO, o no se pudieron leer)
  precios: PrecioPalco[] | null;
  // Palcos del dibujo: el aforo de un PALCO nuevo
  palcosDelDibujo: number | null;
}

// Guardar el evento y despues lo que depende de su id: precios de los
// palcos (solo superadmin) y codigos de regalo. Si el evento se guardo
// pero lo demas fallo, se avisa y se queda en la pagina de editar
export function useGuardarEvento(
  f: FormularioEvento,
  evento: Evento | undefined,
  volver: string,
) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);

  const guardar = async ({
    precios,
    palcosDelDibujo,
  }: GuardarArgs): Promise<boolean> => {
    setGuardando(true);
    f.limpiarError("servidor");
    let id = evento?.id;
    try {
      if (evento?.id) {
        await EventsService.updateEvent(
          String(evento.id),
          f.aDto(palcosDelDibujo),
          f.imagen.archivo ?? undefined,
        );
      } else {
        const res = await EventsService.createEvent(
          f.aDto(palcosDelDibujo),
          f.imagen.archivo ?? undefined,
        );
        id = res.data.id;
      }
    } catch (err) {
      const msg = mensajeDe(err, "No se pudo guardar el evento");
      f.setErrores((prev) => ({ ...prev, servidor: msg }));
      toast.error(msg);
      setGuardando(false);
      return false;
    }

    const fallos: string[] = [];
    // Al crear sin precios propios no hay nada que guardar; al editar se
    // reemplazan siempre (todo o nada)
    if (id && precios && (evento || precios.length > 0)) {
      try {
        await PalcosService.guardarPrecios(id, precios);
      } catch (err) {
        fallos.push(
          `los precios de los palcos (${mensajeDe(err, "error del servidor")})`,
        );
      }
    }
    if (!evento && id && f.codigos.generar && f.codigos.cantidad) {
      try {
        const res = await EventsService.generarCodigosRegalo(
          id,
          f.codigos.cantidad,
        );
        toast.success(`Se generaron ${res.data.cantidad} códigos de regalo`);
      } catch {
        fallos.push("los códigos de regalo");
      }
    }

    toast.success(
      evento ? "Evento actualizado" : "Evento creado correctamente",
    );
    if (fallos.length > 0 && id) {
      toast.error(
        `El evento se guardó, pero no se pudieron guardar ${fallos.join(" ni ")}. Revísalo y vuelve a guardar.`,
        { duration: 8000 },
      );
      if (evento) setGuardando(false);
      else router.replace(rutaEditarEvento(id, volver));
      return false;
    }
    router.push(volver);
    return true;
  };

  return { guardando, guardar };
}
