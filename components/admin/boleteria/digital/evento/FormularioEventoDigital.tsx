"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { Evento, EventoTipo } from "@/interfaces/event.interface";
import { Cargando, ErrorCarga } from "../palcos/EstadoCarga";
import { useFormularioEvento } from "./hooks/useFormularioEvento";
import { useFerias, useMapaOriginal, useRecinto } from "./hooks/useDatosEvento";
import { usePreciosPalcos } from "./hooks/usePreciosPalcos";
import { useGuardarEvento } from "./hooks/useGuardarEvento";
import { EnMarcoEvento } from "./layout/LayoutEvento";
import { FORM_ID } from "./layout/botonesGuardar";
import SeccionDatos from "./secciones/SeccionDatos";
import SeccionTipo from "./secciones/SeccionTipo";
import CodigosRegalo from "./secciones/CodigosRegalo";
import PanelFeria from "./panel-feria/PanelFeria";
import PreciosPalcos from "./precios/PreciosPalcos";
import ConfirmarEventoPalco from "./modal-confirmaciones/ConfirmarEventoPalco";
import ConfirmarCambioFeria from "./modal-confirmaciones/ConfirmarCambioFeria";
import {
  avisosAlConfirmar,
  avisosDeFeria,
  bloqueoDeFeria,
} from "./reglasFeria";
import { diaBogota, diaCorto } from "./fechas";

const TARJETA =
  "bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 min-w-0";

function Seccion({
  titulo,
  className = "",
  children,
}: {
  titulo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`${TARJETA} ${className}`}>
      <h2 className="text-base font-semibold text-gray-800">{titulo}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Orden del boceto. En pantalla ancha: secciones 1, 2 y 3 a la izquierda,
// feria y recinto fijos a la derecha y debajo los precios a todo el ancho.
// En celular (y pantallas medianas) se apilan: datos, feria, tipo,
// precios, códigos. La parte de arriba va en su propio bloque para que la
// columna fija no baje por encima de los precios; en celular ese bloque
// "desaparece" (contents) y sus secciones se ordenan con los precios
const ARRIBA =
  "contents xl:grid xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-6 xl:items-start";
const LUGAR = {
  datos: "order-1 xl:order-none xl:col-start-1 xl:row-start-1",
  // Fija debajo de la barra azul (más alta con las pestañas de un PALCO)
  feria:
    "order-2 xl:order-none xl:col-start-2 xl:row-start-1 xl:row-span-3 xl:sticky min-w-0",
  tipo: "order-3 xl:order-none xl:col-start-1 xl:row-start-2",
  precios: "order-4 xl:order-none",
  codigos: "order-5 xl:order-none xl:col-start-1 xl:row-start-3",
};

interface FormularioEventoDigitalProps {
  // Sin evento: crear
  evento?: Evento;
  titulo: string;
  volver: string;
  // Al crear desde una feria, llega ya elegida
  feriaInicial?: number;
}

// Pagina de crear y editar evento DIGITAL según el boceto acordado. Crear
// un PALCO (o cambiarle la feria) pide confirmación antes de guardar
export default function FormularioEventoDigital({
  evento,
  titulo,
  volver,
  feriaInicial,
}: FormularioEventoDigitalProps) {
  const f = useFormularioEvento(evento, feriaInicial);
  const { carga: ferias, reintentar: reintentarFerias } = useFerias();
  const feriaDe = (id?: number) =>
    ferias.estado === "listo"
      ? ferias.datos.find((x) => x.id === id)
      : undefined;
  const feria = feriaDe(f.form.feriaId);
  const recintoId = feria?.recintoId ?? null;
  const { carga: recinto, reintentar: reintentarRecinto } =
    useRecinto(recintoId);
  const recintoListo = recinto.estado === "listo" ? recinto.datos : null;
  const palcoIds = useMemo(
    () =>
      new Set(
        (recintoListo?.figuras ?? [])
          .filter((x) => x.tipo === "PALCO")
          .map((x) => x.id),
      ),
    [recintoListo],
  );
  const palcosDelDibujo = recintoListo ? palcoIds.size : null;

  // Al editar un PALCO: precios guardados, recinto actual y ventas
  const editandoPalco = evento?.tipo === EventoTipo.PALCO;
  const { carga: mapa, reintentar: reintentarMapa } = useMapaOriginal(
    editandoPalco && evento?.id ? evento.id : null,
  );
  const original = mapa.estado === "listo" ? mapa.datos : null;
  const precios = usePreciosPalcos(original, recintoId);
  const feriaCambia = !!evento && f.form.feriaId !== evento.feriaId;
  // Un PALCO vendido sin mapa no puede pasar a una feria con recinto: esas
  // boletas no tienen palco (RN-25)
  const vendidasSinMapa =
    editandoPalco && original && !original.recinto
      ? (evento?.aforoTotal ?? 0) - (evento?.aforoDisponible ?? 0)
      : 0;
  const situacion = {
    original,
    feriaCambia,
    precios,
    vendidasSinMapa,
    recintoNuevo: recintoId !== null,
  };
  const bloqueo = bloqueoDeFeria(situacion);

  // PEN-10: otro PALCO de la feria el mismo día (en hora de Colombia), solo
  // en ferias con recinto (sin mapa no se comparten palcos). El backend
  // también lo frena; aquí se avisa junto a la fecha
  const choqueFecha = useMemo(() => {
    if (!feria?.recintoId || !f.form.fechaEvento) return null;
    const dia = f.form.fechaEvento.slice(0, 10);
    const otro = (feria.eventos ?? []).find(
      (e) =>
        e.tipo === EventoTipo.PALCO &&
        e.id !== evento?.id &&
        diaBogota(e.fechaEvento) === dia,
    );
    return otro
      ? `Ya existe un evento PALCO en esta feria el ${diaCorto(dia)} ("${otro.nombre}")`
      : null;
  }, [feria, f.form.fechaEvento, evento?.id]);

  // Cambiar a una feria con OTRO recinto borra los precios ya puestos:
  // primero se pregunta
  const [feriaPendiente, setFeriaPendiente] = useState<{
    id: number | undefined;
  } | null>(null);
  const cambiarFeria = (id: number | undefined) => {
    if (id === f.form.feriaId) return;
    const otroRecinto = (feriaDe(id)?.recintoId ?? null) !== recintoId;
    if (f.esPalco && precios.precios.size > 0 && otroRecinto)
      setFeriaPendiente({ id });
    else f.cambiar("feriaId", id);
  };

  const { guardando, guardar } = useGuardarEvento(f, evento, volver);
  const [confirmando, setConfirmando] = useState(false);
  // Precios por palco solo con mapa, y si se pudieron leer (al editar)
  const preciosAGuardar = () =>
    f.esPalco &&
    recintoId !== null &&
    (!editandoPalco || mapa.estado === "listo")
      ? precios.paraGuardar(palcoIds, f.form.precioBase)
      : null;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    const valido = f.validar({
      recintoDeLaFeria: recintoId,
      choqueFecha,
      palcosDelDibujo,
      feriaCambia,
    });
    if (!valido || bloqueo) {
      toast.error(bloqueo ?? "Revisa los campos marcados en rojo");
      return;
    }
    // Con mapa: esperar el recinto y confirmar (resumen de precios). Sin
    // mapa se guarda directo, como los demás tipos
    const conMapa = f.esPalco && recintoId !== null;
    if (conMapa && recinto.estado !== "listo") {
      toast.error("Espera a que cargue el recinto de la feria");
      return;
    }
    if (conMapa && (!evento || feriaCambia)) setConfirmando(true);
    else guardar({ precios: preciosAGuardar(), palcosDelDibujo });
  };

  const confirmar = async () => {
    const ok = await guardar({ precios: preciosAGuardar(), palcosDelDibujo });
    if (!ok) setConfirmando(false);
  };

  // Al editar: si hay algo sin guardar, cambiar de pestaña pregunta
  const hayCambios = f.hayCambios || precios.cambiados;
  // Un PALCO con recinto tiene pestañas en la barra (más alta)
  const conPestanas = editandoPalco && !!evento?.feria?.recintoId;

  const textoGuardar = guardando
    ? "Guardando..."
    : evento
      ? "Guardar cambios"
      : "Crear evento";
  return (
    <EnMarcoEvento
      titulo={titulo}
      volver={volver}
      texto={textoGuardar}
      guardando={guardando}
      hayCambios={hayCambios}
    >
      <form id={FORM_ID} onSubmit={enviar} noValidate className="space-y-6">
        {f.errores.servidor && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            {f.errores.servidor}
          </p>
        )}

        <div className="grid gap-6">
          <div className={ARRIBA}>
            <Seccion titulo="1 · Datos del evento" className={LUGAR.datos}>
              <SeccionDatos f={f} choqueFecha={choqueFecha} />
            </Seccion>

            <aside
              className={`${LUGAR.feria} ${conPestanas ? "xl:top-52" : "xl:top-44"}`}
            >
              <Seccion titulo="Feria y recinto">
                <PanelFeria
                  ferias={ferias}
                  onReintentarFerias={reintentarFerias}
                  feriaId={f.form.feriaId}
                  onCambiar={cambiarFeria}
                  permitirSinFeria={!evento?.feriaId}
                  recinto={recinto}
                  onReintentarRecinto={reintentarRecinto}
                  palcosDelDibujo={palcosDelDibujo}
                  esPalco={f.esPalco}
                  error={f.errores.feriaId ?? bloqueo ?? undefined}
                  avisos={bloqueo ? [] : avisosDeFeria(situacion)}
                />
              </Seccion>
            </aside>

            <Seccion titulo="2 · Tipo y aforo" className={LUGAR.tipo}>
              <SeccionTipo
                f={f}
                tipoOriginal={evento?.tipo}
                feriaConRecinto={!!recintoId}
                palcosDelDibujo={palcosDelDibujo}
              />
            </Seccion>

            <Seccion titulo="3 · Códigos de regalo" className={LUGAR.codigos}>
              <CodigosRegalo f={f} evento={evento} />
            </Seccion>
          </div>

          {f.esPalco &&
            (recintoListo && (!editandoPalco || mapa.estado === "listo") ? (
              <section className={`${TARJETA} ${LUGAR.precios}`}>
                <PreciosPalcos
                  key={recintoListo.id}
                  recinto={recintoListo}
                  precioBase={f.form.precioBase}
                  estado={precios}
                />
              </section>
            ) : (
              <Seccion
                titulo="4 · Precios de los palcos"
                className={LUGAR.precios}
              >
                {!recintoId ? (
                  <p className="py-8 text-center text-sm text-gray-400">
                    Sin recinto, el PALCO se vende sin mapa y todos valen el
                    precio base. Para poner precio por palco, elige una feria
                    con recinto.
                  </p>
                ) : recinto.estado === "error" ? (
                  <ErrorCarga
                    mensaje={recinto.mensaje}
                    onReintentar={reintentarRecinto}
                  />
                ) : mapa.estado === "error" ? (
                  <>
                    <ErrorCarga
                      mensaje={mapa.mensaje}
                      onReintentar={reintentarMapa}
                    />
                    <p className="-mt-8 pb-4 text-center text-xs text-gray-400">
                      Puedes guardar los demás datos: los precios no se tocan.
                    </p>
                  </>
                ) : (
                  <Cargando texto="Cargando palcos y precios..." />
                )}
              </Seccion>
            ))}
        </div>
      </form>

      {feriaPendiente && (
        <ConfirmarCambioFeria
          onCancelar={() => setFeriaPendiente(null)}
          onConfirmar={() => {
            f.cambiar("feriaId", feriaPendiente.id);
            setFeriaPendiente(null);
          }}
        />
      )}

      {confirmando && recintoListo && (
        <ConfirmarEventoPalco
          modo={evento ? "cambiarFeria" : "crear"}
          resumen={{
            fechaEvento: f.form.fechaEvento,
            feria: feria?.nombre ?? "",
            recinto: recintoListo.nombre,
            palcos: palcoIds.size,
            precioBase: f.form.precioBase,
            preciosPropios: preciosAGuardar() ?? [],
          }}
          avisos={avisosAlConfirmar(situacion, !evento)}
          guardando={guardando}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </EnMarcoEvento>
  );
}
