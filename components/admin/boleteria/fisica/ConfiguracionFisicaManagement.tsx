"use client";

import { useState, useEffect, useRef } from "react";
import {
  Printer,
  Usb,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import EventsService from "@/services/EventsService";
import { Evento, EventoModalidad } from "@/interfaces/event.interface";
import {
  CampoPlantillaDedicada,
  ClaveCampoDedicada,
  ClaveImagenBoletaDedicada,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";

import BoleteriaDedicadaEditor from "./BoleteriaDedicadaEditor";
import ImagenesBoletaDedicada from "./ImagenesBoletaDedicada";
import RecorteImagenModal from "./RecorteImagenModal";
import { IMAGE_SLOT_KEYS } from "./plantillaDedicada";
import styles from "./dedicada.module.css";

const STORAGE_KEY = "suarec-boleteria-fisica-config";

interface FisicaConfig {
  printerName: string;
  agentUrl: string;
  paperWidth: number;
  copies: number;
}

const DEFAULT_CONFIG: FisicaConfig = {
  printerName: "POS-80C",
  agentUrl: "http://localhost:3100",
  paperWidth: 80,
  copies: 1,
};

const ConfiguracionFisicaManagement = () => {
  const [guardandoImagenDedicada, setGuardandoImagenDedicada] = useState(false);
  const [dedicatedOpened, setDedicatedOpened] = useState(false);
  const [section, setSection] = useState<"pos" | "dedicada">("pos");
  const [config, setConfig] = useState<FisicaConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // Plantilla de boleta por evento
  const [eventosFisicos, setEventosFisicos] = useState<Evento[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<
    number | null
  >(null);
  const [archivoPlantilla, setArchivoPlantilla] = useState<File | null>(null);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);

  // Logo de patrocinadores por evento
  const [archivoLogoPatrocinadores, setArchivoLogoPatrocinadores] =
    useState<File | null>(null);
  const [guardandoLogo, setGuardandoLogo] = useState(false);

  // Recorte de encuadre desde el lienzo (click derecho sobre una imagen).
  // El recorte es por evento y por ranura; se guarda en el mismo endpoint
  // que las imágenes.
  const [cropTarget, setCropTarget] = useState<{
    slot: ClaveImagenBoletaDedicada;
    boxAspect: number | null;
  } | null>(null);
  const [guardandoRecorte, setGuardandoRecorte] = useState(false);
  const plantillaCamposCache = useRef<CampoPlantillaDedicada[] | null>(null);

  // Proporción ancho/alto de la caja de la ranura, para que el encuadre se
  // recorte con las mismas dimensiones relativas con las que se imprime.
  async function boxAspectPara(
    slot: ClaveImagenBoletaDedicada,
  ): Promise<number | null> {
    try {
      if (!plantillaCamposCache.current) {
        const { data } = await EventsService.getPlantillaDedicada();
        plantillaCamposCache.current = data.campos;
      }
      const campo = plantillaCamposCache.current.find(
        (item) => item.clave === slot,
      );
      if (campo && campo.anchoMm > 0 && campo.altoMm > 0) {
        return campo.anchoMm / campo.altoMm;
      }
    } catch {
      // Sin plantilla el recorte queda libre; no bloquea la función.
    }
    return null;
  }

  async function handleCropRequest(clave: ClaveCampoDedicada) {
    if (!eventoSeleccionado) return;
    if (!IMAGE_SLOT_KEYS.includes(clave as ClaveImagenBoletaDedicada)) return;
    const slot = clave as ClaveImagenBoletaDedicada;
    if (!eventoSeleccionado.boletaImagenes?.[slot]) return;
    const boxAspect = await boxAspectPara(slot);
    setCropTarget({ slot, boxAspect });
  }

  async function handleSaveRecorte(
    slot: ClaveImagenBoletaDedicada,
    recorte: RecorteImagen,
  ): Promise<boolean> {
    if (!eventoSeleccionadoId || guardandoRecorte) return false;
    setGuardandoRecorte(true);
    setGuardandoImagenDedicada(true);
    try {
      const res = await EventsService.updateEvent(
        String(eventoSeleccionadoId),
        { boletaImagenesRecorte: { [slot]: recorte } },
      );
      setEventosFisicos((prev) =>
        prev.map((e) => (e.id === res.data.id ? res.data : e)),
      );
      toast.success("Encuadre guardado para este evento");
      return true;
    } catch {
      toast.error(
        "No se pudo guardar el encuadre. Revisa tu conexión y permisos de super admin.",
      );
      return false;
    } finally {
      setGuardandoRecorte(false);
      setGuardandoImagenDedicada(false);
    }
  }

  const eventoSeleccionado = eventosFisicos.find(
    (e) => e.id === eventoSeleccionadoId,
  );
  const previewPlantillaUrl = archivoPlantilla
    ? URL.createObjectURL(archivoPlantilla)
    : eventoSeleccionado?.plantillaTicketUrl || "/tickets/base.png";
  const previewLogoUrl = archivoLogoPatrocinadores
    ? URL.createObjectURL(archivoLogoPatrocinadores)
    : eventoSeleccionado?.logoPatrocinadoresUrl || null;

  useEffect(() => {
    EventsService.getAllEventsAdmin()
      .then((res) => {
        const fisicos = res.data.filter(
          (e) => e.modalidad === EventoModalidad.FISICO,
        );
        setEventosFisicos(fisicos);
        if (fisicos.length > 0 && fisicos[0].id) {
          setEventoSeleccionadoId(fisicos[0].id);
        }
      })
      .catch(() => toast.error("Error al cargar los eventos físicos"))
      .finally(() => setCargandoEventos(false));
  }, []);

  const handleGuardarPlantilla = async () => {
    if (!eventoSeleccionadoId || !archivoPlantilla) return;

    setGuardandoPlantilla(true);
    try {
      const res = await EventsService.updateEvent(
        String(eventoSeleccionadoId),
        {},
        undefined,
        archivoPlantilla,
      );
      setEventosFisicos((prev) =>
        prev.map((e) => (e.id === eventoSeleccionadoId ? res.data : e)),
      );
      setArchivoPlantilla(null);
      toast.success("Plantilla de boleta actualizada");
    } catch {
      toast.error("No se pudo guardar la plantilla de boleta");
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const handleRestaurarPlantilla = async () => {
    if (!eventoSeleccionadoId) return;

    setGuardandoPlantilla(true);
    try {
      const res = await EventsService.updateEvent(
        String(eventoSeleccionadoId),
        { removePlantillaTicket: true },
      );
      setEventosFisicos((prev) =>
        prev.map((e) => (e.id === eventoSeleccionadoId ? res.data : e)),
      );
      setArchivoPlantilla(null);
      toast.success("Plantilla restaurada a la boleta por defecto");
    } catch {
      toast.error("No se pudo restaurar la plantilla por defecto");
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const handleGuardarLogoPatrocinadores = async () => {
    if (!eventoSeleccionadoId || !archivoLogoPatrocinadores) return;

    setGuardandoLogo(true);
    try {
      const res = await EventsService.updateEvent(
        String(eventoSeleccionadoId),
        {},
        undefined,
        undefined,
        archivoLogoPatrocinadores,
      );
      setEventosFisicos((prev) =>
        prev.map((e) => (e.id === eventoSeleccionadoId ? res.data : e)),
      );
      setArchivoLogoPatrocinadores(null);
      toast.success("Logo de patrocinadores actualizado");
    } catch {
      toast.error("No se pudo guardar el logo de patrocinadores");
    } finally {
      setGuardandoLogo(false);
    }
  };

  const handleQuitarLogoPatrocinadores = async () => {
    if (!eventoSeleccionadoId) return;

    setGuardandoLogo(true);
    try {
      const res = await EventsService.updateEvent(
        String(eventoSeleccionadoId),
        { removeLogoPatrocinadores: true },
      );
      setEventosFisicos((prev) =>
        prev.map((e) => (e.id === eventoSeleccionadoId ? res.data : e)),
      );
      setArchivoLogoPatrocinadores(null);
      toast.success("Logo de patrocinadores eliminado");
    } catch {
      toast.error("No se pudo eliminar el logo de patrocinadores");
    } finally {
      setGuardandoLogo(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FisicaConfig>;
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success("Configuración guardada localmente");
    } catch {
      toast.error("No se pudo guardar la configuración");
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem(STORAGE_KEY);
    toast("Configuración restaurada por defecto");
  };

  if (!loaded) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Tipo de impresión"
        className="mb-7 inline-flex max-w-full flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1.5"
      >
        <button
          type="button"
          role="tab"
          id="pos-tab"
          aria-controls="pos-panel"
          aria-selected={section === "pos"}
          onClick={() => setSection("pos")}
          className={`rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${section === "pos" ? "bg-white text-[#097EEC] shadow-sm ring-1 ring-slate-200/60" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
        >
          Impresora POS
        </button>
        <button
          type="button"
          role="tab"
          id="dedicada-tab"
          aria-controls="dedicada-panel"
          aria-selected={section === "dedicada"}
          onClick={() => {
            setDedicatedOpened(true);
            setSection("dedicada");
          }}
          className={`rounded-lg px-5 py-2.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${section === "dedicada" ? "bg-white text-[#097EEC] shadow-sm ring-1 ring-slate-200/60" : "text-slate-500 hover:bg-white/60 hover:text-slate-800"}`}
        >
          Boletería dedicada
        </button>
      </div>
      {dedicatedOpened && (
        <div
          hidden={section !== "dedicada"}
          role="tabpanel"
          id="dedicada-panel"
          aria-labelledby="dedicada-tab"
        >
          <div className={styles.dedicatedLayout}>
            <header className={styles.dedicatedHeader}>
              <div className={styles.dedicatedTitle}>
                <Printer aria-hidden="true" className="h-5 w-5" />
                <h2>Boletería dedicada</h2>
              </div>
              {cargandoEventos ? (
                <p role="status" className="text-xs text-slate-500">
                  Cargando eventos...
                </p>
              ) : eventosFisicos.length > 0 ? (
                <label className={styles.assetEvent}>
                  Evento
                  <select
                    value={eventoSeleccionadoId ?? ""}
                    disabled={guardandoImagenDedicada}
                    onChange={(event) => {
                      setCropTarget(null);
                      setEventoSeleccionadoId(Number(event.target.value));
                    }}
                  >
                    {eventosFisicos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-xs text-slate-500">Sin eventos físicos</p>
              )}
            </header>

            <section
              className={styles.assetSection}
              aria-label="Imágenes de la boleta por evento"
            >
              <header>
                <h3>Imágenes del evento</h3>
                <p>
                  Arte por evento · las posiciones y tamaños se definen en el
                  diseño global de abajo.
                </p>
              </header>
              {cargandoEventos ? (
                <p role="status">Cargando eventos físicos...</p>
              ) : eventosFisicos.length === 0 ? (
                <p>No hay eventos físicos creados todavía.</p>
              ) : (
                <>
                  <p className="text-xs leading-relaxed text-slate-500">
                    PNG, JPG o WebP · impresión en blanco y negro tramado. El
                    lienzo utiliza las imágenes guardadas de este evento.
                  </p>
                  {eventoSeleccionado && (
                    <ImagenesBoletaDedicada
                      key={eventoSeleccionado.id}
                      evento={eventoSeleccionado}
                      onBusyChange={setGuardandoImagenDedicada}
                      onUpdated={(updated) =>
                        setEventosFisicos((current) =>
                          current.map((item) =>
                            item.id === updated.id ? updated : item,
                          ),
                        )
                      }
                    />
                  )}
                </>
              )}
            </section>

            {cropTarget && eventoSeleccionado && (
              <RecorteImagenModal
                slot={cropTarget.slot}
                url={eventoSeleccionado.boletaImagenes?.[cropTarget.slot] ?? ""}
                boxAspect={cropTarget.boxAspect}
                initial={
                  eventoSeleccionado.boletaImagenesRecorte?.[cropTarget.slot]
                }
                pending={guardandoRecorte}
                onClose={() => setCropTarget(null)}
                onSave={async (nuevo) => {
                  if (await handleSaveRecorte(cropTarget.slot, nuevo)) {
                    setCropTarget(null);
                  }
                }}
              />
            )}

            <BoleteriaDedicadaEditor
              onCropRequest={handleCropRequest}
              recortes={eventoSeleccionado?.boletaImagenesRecorte ?? undefined}
              imagenes={
                eventoSeleccionado
                  ? {
                      ...eventoSeleccionado.boletaImagenes,
                      ...(eventoSeleccionado.logoPatrocinadoresUrl
                        ? {
                            logoPatrocinadores:
                              eventoSeleccionado.logoPatrocinadoresUrl,
                          }
                        : {}),
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}
      <div
        role="tabpanel"
        id="pos-panel"
        aria-labelledby="pos-tab"
        hidden={section !== "pos"}
        className="max-w-2xl"
      >
        <div className="flex items-center gap-2 mb-6">
          <Printer className="h-5 w-5 text-[#097EEC]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Configuración de impresión
          </h2>
        </div>

        <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la impresora térmica
            </label>
            <input
              type="text"
              value={config.printerName}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, printerName: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del agente de impresión local
            </label>
            <div className="relative">
              <Usb className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={config.agentUrl}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, agentUrl: e.target.value }))
                }
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Debe coincidir con el servidor local que recibe la imagen del
              ticket para imprimir.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho del papel (mm)
              </label>
              <input
                type="number"
                min={58}
                max={120}
                value={config.paperWidth}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    paperWidth: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copias por defecto
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={config.copies}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    copies: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0562C7] transition-colors shadow"
            >
              <Save className="h-4 w-4" />
              Guardar configuración
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Restaurar
            </motion.button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 mt-10">
          <ImageIcon className="h-5 w-5 text-[#097EEC]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Plantilla de boleta por evento
          </h2>
        </div>

        <div className="space-y-4 bg-white rounded-xl border border-gray-100 p-6">
          {cargandoEventos ? (
            <p className="text-sm text-gray-400">Cargando eventos físicos...</p>
          ) : eventosFisicos.length === 0 ? (
            <p className="text-sm text-gray-400">
              No hay eventos físicos creados todavía.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evento
                </label>
                <select
                  value={eventoSeleccionadoId ?? ""}
                  onChange={(e) => {
                    setEventoSeleccionadoId(Number(e.target.value));
                    setArchivoPlantilla(null);
                    setArchivoLogoPatrocinadores(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm bg-white"
                >
                  {eventosFisicos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-[260px] h-[602px] shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewPlantillaUrl}
                    alt="Vista previa de la plantilla de boleta"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <p className="text-xs text-gray-500">
                    {eventoSeleccionado?.plantillaTicketUrl
                      ? "Este evento usa una plantilla personalizada."
                      : "Este evento usa la plantilla por defecto (base.png)."}
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva imagen de plantilla
                    </label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) =>
                        setArchivoPlantilla(e.target.files?.[0] ?? null)
                      }
                      className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-[#097EEC] file:text-sm file:font-medium hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGuardarPlantilla}
                      disabled={!archivoPlantilla || guardandoPlantilla}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0562C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
                    >
                      <Upload className="h-4 w-4" />
                      Guardar plantilla
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleRestaurarPlantilla}
                      disabled={
                        !eventoSeleccionado?.plantillaTicketUrl ||
                        guardandoPlantilla
                      }
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restaurar por defecto
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mt-4 mb-3">
                  Logo de patrocinadores
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-[260px] h-[121px] shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {previewLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewLogoUrl}
                        alt="Vista previa del logo de patrocinadores"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <p className="text-xs text-gray-400 text-center px-3">
                        Sin logo — el espacio queda en blanco
                      </p>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <p className="text-xs text-gray-500">
                      Recomendado ~892 × 413 px, se ubica debajo de
                      &quot;PATROCINAN&quot; en la boleta impresa.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva imagen de patrocinadores
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) =>
                          setArchivoLogoPatrocinadores(
                            e.target.files?.[0] ?? null,
                          )
                        }
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-[#097EEC] file:text-sm file:font-medium hover:file:bg-blue-100"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleGuardarLogoPatrocinadores}
                        disabled={!archivoLogoPatrocinadores || guardandoLogo}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0562C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow"
                      >
                        <Upload className="h-4 w-4" />
                        Guardar logo
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleQuitarLogoPatrocinadores}
                        disabled={
                          !eventoSeleccionado?.logoPatrocinadoresUrl ||
                          guardandoLogo
                        }
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Quitar logo
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionFisicaManagement;
