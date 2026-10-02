"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CalendarDays, GripVertical, Ticket } from "lucide-react";
import { Evento, EventoModalidad } from "@/interfaces/event.interface";
import EventsService from "@/services/EventsService";
import { formatCurrency } from "@/lib/formatCurrency";
import toast from "react-hot-toast";

// Lo que el padre (CreateFeriaModal) necesita pedirle al pool: resolver el id
// que viaja en el drag & drop y devolver al pool un evento quitado de
// "Eventos asignados" (la drop zone vive en el padre, no aca).
export interface EventosParaAsignarRef {
  resolverEvento: (id: number) => Evento | undefined;
  reincorporar: (evento: Evento) => void;
}

interface EventosParaAsignarProps {
  // Ids de los eventos ya arrastrados a "Eventos asignados": se ocultan del
  // pool (ya estan arrastrados, no tiene sentido mostrarlos duplicados).
  asignadosIds: number[];
}

const TAMANO_PAGINA = 10;

// Motivo por el que un evento no se puede arrastrar cuando se esta viendo
// el catalogo completo (toggle "ver todos") -- null si es elegible.
const motivoNoElegible = (evento: Evento): string | null => {
  if (evento.feriaId) return `Ya en: ${evento.feria?.nombre ?? "otra feria"}`;
  if (evento.visible === false) return "Oculto";
  if (evento.modalidad !== EventoModalidad.DIGITAL) return "Física";
  return null;
};

// Card chica para el pool de "eventos disponibles" -- no se reusa
// EventFlipCard (esa es para grids grandes con flip), aqui necesitamos algo
// compacto que quepa varias veces en una columna angosta. Solo es arrastrable
// si es elegible; si no, se muestra atenuada con el motivo (toggle "ver todos").
const DraggableEventCard = ({ evento }: { evento: Evento }) => {
  const motivo = motivoNoElegible(evento);
  const elegible = motivo === null;

  return (
    <div
      draggable={elegible}
      onDragStart={
        elegible
          ? (e) => {
              e.dataTransfer.setData("text/plain", String(evento.id));
              e.dataTransfer.effectAllowed = "move";
            }
          : undefined
      }
      className={`flex items-center gap-2.5 p-3 rounded-lg border transition-all ${
        elegible
          ? "border-gray-200 bg-white hover:border-[#097EEC] hover:shadow-sm cursor-grab active:cursor-grabbing"
          : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
      }`}
    >
      <GripVertical
        className={`h-4 w-4 flex-shrink-0 ${elegible ? "text-gray-300" : "text-gray-200"}`}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-gray-800 truncate">
            {evento.nombre}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 flex-shrink-0">
            {formatCurrency(evento.precioBase)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-gray-400 truncate">
            {evento.ubicacion}
          </p>
          {motivo && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
              {motivo}
            </span>
          )}
        </div>
        {evento.descripcion && (
          <p className="text-[11px] text-gray-400 line-clamp-2 pt-1.5 border-t border-gray-100">
            {evento.descripcion}
          </p>
        )}
      </div>
    </div>
  );
};

// Pool de eventos que se pueden arrastrar hacia "Eventos asignados" en el
// modal de crear feria. Paginado con "Cargar mas": el filtro de elegibles se
// hace EN EL SERVIDOR (filtrar aca dejaria paginas incompletas o vacias).
const EventosParaAsignar = forwardRef<
  EventosParaAsignarRef,
  EventosParaAsignarProps
>(({ asignadosIds }, ref) => {
  // false = solo disponibles (filtrados en servidor); true = catalogo completo
  const [modoTodos, setModoTodos] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [fallo, setFallo] = useState(false);
  // Id incremental por request: si otro arranco despues (cambio de modo,
  // doble efecto de StrictMode), la respuesta anterior llega tarde y hay que
  // descartarla para no duplicar ni pisar lo del request vigente.
  const requestIdRef = useRef(0);
  // Ultimo pedido hecho: "Reintentar" repite exactamente ese (mismo modo,
  // misma pagina, misma forma de cargar)
  const ultimoPedidoRef = useRef({ pagina: 1, reiniciar: true });

  const cargar = useCallback(
    async (paginaNueva: number, reiniciar: boolean) => {
      const requestId = ++requestIdRef.current;
      ultimoPedidoRef.current = { pagina: paginaNueva, reiniciar };
      if (reiniciar) {
        // Empieza de cero: sin la lista del modo anterior. Si este pedido
        // falla, se ve el error y no eventos del otro modo con este titulo
        setEventos([]);
        setTotal(0);
        setCargando(true);
      } else setCargandoMas(true);
      try {
        const res = await EventsService.getEventosAdminPaginados(
          paginaNueva,
          TAMANO_PAGINA,
          modoTodos
            ? undefined
            : {
                sinFeria: true,
                visible: true,
                modalidad: EventoModalidad.DIGITAL,
              },
        );
        if (requestId !== requestIdRef.current) return;
        // Al sumar una pagina se descartan repetidos: si se crean eventos
        // mientras se pagina, uno puede correrse a la pagina siguiente
        setEventos((prev) =>
          reiniciar
            ? res.data.eventos
            : [
                ...prev,
                ...res.data.eventos.filter(
                  (e) => !prev.some((p) => p.id === e.id),
                ),
              ],
        );
        setTotal(res.data.total);
        setPagina(res.data.page);
        setFallo(false);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setFallo(true);
        toast.error("Error al cargar los eventos disponibles");
      } finally {
        if (requestId !== requestIdRef.current) return;
        setCargando(false);
        setCargandoMas(false);
      }
    },
    [modoTodos],
  );

  // Carga inicial y recarga al cambiar de modo -- siempre arranca en pagina 1
  // (el setEventos con reiniciar=true pisa lo acumulado del modo anterior).
  useEffect(() => {
    cargar(1, true);
  }, [cargar]);

  useImperativeHandle(ref, () => ({
    resolverEvento: (id: number) => eventos.find((e) => e.id === id),
    reincorporar: (evento: Evento) => {
      setEventos((prev) =>
        prev.some((e) => e.id === evento.id) ? prev : [evento, ...prev],
      );
    },
  }));

  const cambiarModo = () => {
    if (cargando || cargandoMas) return;
    setModoTodos((prev) => !prev);
  };

  const cargarMas = () => {
    if (cargando || cargandoMas || eventos.length >= total) return;
    cargar(pagina + 1, false);
  };

  // Repite el ultimo pedido tal cual (la carga inicial o del cambio de modo
  // desde la pagina 1, o la pagina de "cargar mas" que fallo)
  const reintentar = () => {
    const { pagina: p, reiniciar } = ultimoPedidoRef.current;
    cargar(p, reiniciar);
  };

  const eventosAMostrar = eventos.filter((e) => !asignadosIds.includes(e.id!));
  // El total del servidor aun cuenta los asignados (la asignacion real ocurre
  // al crear la feria), asi que se restan para que el numero baje al arrastrar
  const totalAMostrar = Math.max(total - asignadosIds.length, 0);
  const hayMas = !cargando && eventos.length < total;

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white shadow-sm min-h-[320px] p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
          <Ticket className="h-3.5 w-3.5" />
          {modoTodos ? "Todos los eventos" : "Eventos disponibles"} (
          {totalAMostrar})
        </p>
        <button
          type="button"
          onClick={cambiarModo}
          disabled={cargando || cargandoMas}
          className="text-[11px] font-medium text-[#097EEC] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        >
          {modoTodos ? "Ver solo disponibles" : "Ver todos los eventos"}
        </button>
      </div>

      {cargando ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : fallo && eventosAMostrar.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <CalendarDays className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-400">
            No se pudieron cargar los eventos
          </p>
          <button
            type="button"
            onClick={reintentar}
            className="mt-2 text-[11px] font-medium text-[#097EEC] hover:underline"
          >
            Reintentar
          </button>
        </div>
      ) : eventosAMostrar.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <CalendarDays className="h-10 w-10 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-400">
            {modoTodos
              ? "No hay eventos creados todavía"
              : "No hay eventos sueltos por asignar"}
          </p>
          {!modoTodos && (
            <p className="text-xs text-gray-300 mt-1">
              Todos los eventos visibles ya tienen feria
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {eventosAMostrar.map((evento) => (
            <DraggableEventCard key={evento.id} evento={evento} />
          ))}

          {hayMas &&
            (fallo ? (
              <button
                type="button"
                onClick={reintentar}
                className="w-full mt-1 py-2 text-[11px] font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                No se pudieron cargar más — Reintentar
              </button>
            ) : (
              <button
                type="button"
                onClick={cargarMas}
                disabled={cargandoMas}
                className="w-full mt-1 py-2 text-[11px] font-medium text-[#097EEC] hover:bg-[#097EEC]/5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {cargandoMas
                  ? "Cargando..."
                  : `Cargar más (${eventos.length} de ${total})`}
              </button>
            ))}

          {cargandoMas && (
            <div className="space-y-2 pt-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

EventosParaAsignar.displayName = "EventosParaAsignar";

export default EventosParaAsignar;
