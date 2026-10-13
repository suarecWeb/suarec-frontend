"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import toast from "react-hot-toast";
import EventsService from "@/services/EventsService";
import { Evento, EventoTipo } from "@/interfaces/event.interface";
import { Carga, useCarga } from "../../palcos/hooks/usePalcosEventos";
import { RUTA_TAB_PALCOS } from "../../palcos/rutas";
import MarcoPaginaEvento from "./MarcoPaginaEvento";
import BotonVisibilidad from "./BotonVisibilidad";
import PestanasEvento from "./PestanasEvento";
import { botonesGuardar } from "./botonesGuardar";
import { RUTA_BOLETERIA_DIGITAL, volverSeguro } from "../rutas";

// Lo que el formulario de "Datos y precios" sube a la barra
interface Guardado {
  texto: string;
  guardando: boolean;
  hayCambios: boolean;
}

interface DatosLayout {
  carga: Carga<Evento>;
  reintentar: () => void;
  volver: string;
  registrar: (guardado: Guardado | null) => void;
}

const LayoutEventoContext = createContext<DatosLayout | null>(null);

// El evento (se pide una sola vez para las dos pestañas) y a dónde regresa
// la flecha
export function useLayoutEvento() {
  const layout = useContext(LayoutEventoContext);
  if (!layout) throw new Error("useLayoutEvento va dentro de LayoutEvento");
  return layout;
}

// Layout de un evento digital (lo usa app/.../[eventoId]/layout.tsx): el
// menú de arriba, la barra azul (título, miga de pan, botones y, en un
// PALCO, las pestañas) y el menú lateral se montan UNA vez. Al cambiar de
// pestaña solo cambia el contenido de abajo: sin fundido y sin volver a
// cargar
export default function LayoutEvento({
  eventoId,
  children,
}: {
  eventoId: number;
  children: ReactNode;
}) {
  const enGestion = useSelectedLayoutSegment() === "gestion-de-palcos";
  const volverPedido = useSearchParams().get("volver");
  // Sin ?volver=: Gestión regresa a Ferias -> Gestión de palcos (desde
  // donde se entra) y editar, a Digital
  const volver = volverPedido
    ? volverSeguro(volverPedido)
    : enGestion
      ? RUTA_TAB_PALCOS
      : RUTA_BOLETERIA_DIGITAL;

  const { carga, reintentar } = useCarga<Evento>(
    () => EventsService.getEventById(eventoId),
    "No se pudo cargar el evento",
    eventoId,
  );
  const [guardado, setGuardado] = useState<Guardado | null>(null);
  const valor = useMemo(
    () => ({ carga, reintentar, volver, registrar: setGuardado }),
    [carga, reintentar, volver],
  );

  const evento = carga.estado === "listo" ? carga.datos : null;
  const datos = !enGestion ? guardado : null;

  // Visibilidad en la app: se cambia sin volver a pedir el evento, para no
  // tocar lo que se está editando
  const [visibleCambiado, setVisibleCambiado] = useState<boolean | null>(null);
  const [cambiandoVisible, setCambiandoVisible] = useState(false);
  useEffect(() => setVisibleCambiado(null), [eventoId]);
  const visible = visibleCambiado ?? evento?.visible !== false;
  const cambiarVisibilidad = async () => {
    if (!evento?.id || cambiandoVisible) return;
    const nuevo = !visible;
    setCambiandoVisible(true);
    try {
      await EventsService.setVisibility(evento.id, nuevo);
      setVisibleCambiado(nuevo);
      toast.success(
        nuevo ? "Evento visible en la app" : "Evento oculto de la app",
      );
    } catch {
      toast.error("Error al cambiar visibilidad del evento");
    } finally {
      setCambiandoVisible(false);
    }
  };

  return (
    <LayoutEventoContext.Provider value={valor}>
      <MarcoPaginaEvento
        titulo={evento ? `Editar evento: ${evento.nombre}` : "Editar evento"}
        volver={volver}
        extra={
          evento ? (
            <BotonVisibilidad
              visible={visible}
              cambiando={cambiandoVisible}
              onClick={cambiarVisibilidad}
            />
          ) : undefined
        }
        acciones={
          datos
            ? botonesGuardar(volver, datos.texto, datos.guardando)
            : undefined
        }
        pestanas={
          // Gestión de palcos solo tiene sentido con mapa (feria con recinto)
          enGestion ||
          (evento?.tipo === EventoTipo.PALCO && !!evento.feria?.recintoId) ? (
            <PestanasEvento
              eventoId={eventoId}
              activa={enGestion ? "palcos" : "datos"}
              volver={volver}
              hayCambios={!!datos?.hayCambios}
            />
          ) : undefined
        }
      >
        {children}
      </MarcoPaginaEvento>
    </LayoutEventoContext.Provider>
  );
}

// Envuelve el formulario de evento. Dentro del layout del evento
// (editar) el marco ya está puesto: solo sube los botones y si hay cambios
// sin guardar. Fuera (crear), pinta el marco completo
export function EnMarcoEvento({
  titulo,
  volver,
  texto,
  guardando,
  hayCambios,
  children,
}: {
  titulo: string;
  volver: string;
  texto: string;
  guardando: boolean;
  hayCambios: boolean;
  children: ReactNode;
}) {
  const layout = useContext(LayoutEventoContext);
  const registrar = layout?.registrar;
  useEffect(() => {
    if (!registrar) return;
    registrar({ texto, guardando, hayCambios });
    return () => registrar(null);
  }, [registrar, texto, guardando, hayCambios]);

  if (layout) return <>{children}</>;
  return (
    <MarcoPaginaEvento
      titulo={titulo}
      volver={volver}
      acciones={botonesGuardar(volver, texto, guardando)}
    >
      {children}
    </MarcoPaginaEvento>
  );
}
