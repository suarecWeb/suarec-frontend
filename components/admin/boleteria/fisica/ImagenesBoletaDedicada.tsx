"use client";

import { useEffect, useRef, useState } from "react";
import { Crop, Upload, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Evento } from "@/interfaces/event.interface";
import {
  ClaveImagenBoletaDedicada,
  esRecorteCompleto,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";
import EventsService from "@/services/EventsService";
import { useAuth } from "@/hooks/useAuth";
import {
  FIELD_LABELS,
  FORMATO_RECOMENDADO_IMAGEN,
  IMAGE_SLOT_KEYS,
} from "./plantillaDedicada";
import ImagenDedicada from "./ImagenDedicada";
import RecorteImagenModal from "./RecorteImagenModal";
import styles from "./dedicada.module.css";

interface SlotProps {
  slot: ClaveImagenBoletaDedicada;
  url?: string;
  recorte?: RecorteImagen | null;
  // anchoMm/altoMm de la caja del campo; null = proporción libre.
  boxAspect: number | null;
  disabled: boolean;
  pending: boolean;
  onUpload: (file: File) => Promise<boolean>;
  onRemove: () => Promise<boolean>;
  onSaveRecorte: (recorte: RecorteImagen) => Promise<boolean>;
}

function ImageSlot({
  slot,
  url,
  recorte,
  boxAspect,
  disabled,
  pending,
  onUpload,
  onRemove,
  onSaveRecorte,
}: SlotProps) {
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string>();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!file) {
      setLocalUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  // El menú de click derecho se cierra con cualquier interacción fuera de él.
  useEffect(() => {
    if (!menuPos) return;
    const close = () => setMenuPos(null);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [menuPos]);
  function clearFile() {
    setFile(null);
    if (input.current) input.current.value = "";
  }
  const hasCrop = !esRecorteCompleto(recorte);
  const formato = FORMATO_RECOMENDADO_IMAGEN[slot];
  return (
    <article className={styles.assetCard}>
      <h4>{FIELD_LABELS[slot]}</h4>
      {formato && (
        <p className="text-xs text-slate-500">
          Formato recomendado: {formato.anchoMm} × {formato.altoMm} mm (ancho ×
          alto)
        </p>
      )}
      <div
        className={styles.assetPreview}
        onContextMenu={(event) => {
          // Recortar aplica sobre la imagen guardada, no sobre la selección
          // local pendiente de subir.
          if (!url || disabled || file) return;
          event.preventDefault();
          setMenuPos({ x: event.clientX, y: event.clientY });
        }}
      >
        <ImagenDedicada
          key={localUrl ?? url ?? slot}
          url={localUrl ?? url}
          label={FIELD_LABELS[slot]}
          recorte={file ? undefined : recorte}
        />
      </div>
      <p className={styles.assetStatus}>
        {file
          ? "Selección local · pendiente de subir"
          : url
            ? hasCrop
              ? "Imagen guardada · encuadre personalizado"
              : "Imagen guardada para este evento"
            : "Esta ranura todavía no tiene imagen"}
      </p>
      <label className={styles.assetFile}>
        Seleccionar imagen
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={disabled}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            if (
              selected &&
              !["image/png", "image/jpeg", "image/webp"].includes(selected.type)
            ) {
              toast.error("Selecciona una imagen PNG, JPG o WebP.");
              event.target.value = "";
              return;
            }
            setFile(selected);
          }}
        />
      </label>
      <div className={styles.assetActions}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={disabled || !file}
          onClick={async () => {
            if (file && (await onUpload(file))) clearFile();
          }}
        >
          {pending ? (
            <Loader2
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Upload aria-hidden="true" className="h-3.5 w-3.5" />
          )}
          Subir
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={disabled || !url}
          onClick={async () => {
            if (await onRemove()) clearFile();
          }}
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
          Quitar
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={disabled || !url || !!file}
          title="Click derecho sobre la imagen también abre el recorte"
          onClick={() => setCropOpen(true)}
        >
          <Crop aria-hidden="true" className="h-3.5 w-3.5" />
          Recortar
        </button>
      </div>
      {menuPos && url && (
        <div
          role="menu"
          className="fixed z-50 min-w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          style={{
            left: Math.min(menuPos.x, window.innerWidth - 200),
            top: Math.min(menuPos.y, window.innerHeight - 80),
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-100"
            onClick={() => {
              setMenuPos(null);
              setCropOpen(true);
            }}
          >
            <Crop aria-hidden="true" className="h-3.5 w-3.5 text-[#097EEC]" />
            Recortar encuadre
          </button>
        </div>
      )}
      {cropOpen && url && (
        <RecorteImagenModal
          slot={slot}
          url={url}
          boxAspect={boxAspect}
          initial={recorte}
          pending={pending}
          onClose={() => setCropOpen(false)}
          onSave={async (nuevo) => {
            if (await onSaveRecorte(nuevo)) setCropOpen(false);
          }}
        />
      )}
    </article>
  );
}

interface Props {
  evento: Evento;
  onUpdated: (evento: Evento) => void;
  onBusyChange: (busy: boolean) => void;
}

export default function ImagenesBoletaDedicada({
  evento,
  onUpdated,
  onBusyChange,
}: Props) {
  const { user, isLoading } = useAuth();
  const [pending, setPending] = useState<ClaveImagenBoletaDedicada | null>(
    null,
  );
  // Proporción (ancho/alto) de la caja de cada ranura, para que el encuadre
  // se recorte con las mismas dimensiones relativas con las que se imprime.
  const [boxAspects, setBoxAspects] = useState<
    Partial<Record<ClaveImagenBoletaDedicada, number>>
  >({});
  const lock = useRef(false);
  const canEdit = !isLoading && !!user?.isSuperAdmin;

  useEffect(() => {
    let active = true;
    EventsService.getPlantillaDedicada()
      .then(({ data }) => {
        if (!active) return;
        const map: Partial<Record<ClaveImagenBoletaDedicada, number>> = {};
        for (const slot of IMAGE_SLOT_KEYS) {
          const campo = data.campos.find((item) => item.clave === slot);
          if (campo && campo.anchoMm > 0 && campo.altoMm > 0) {
            map[slot] = campo.anchoMm / campo.altoMm;
          }
        }
        setBoxAspects(map);
      })
      // Sin plantilla el recorte queda libre; no bloquea la función.
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function mutate(
    slot: ClaveImagenBoletaDedicada,
    file?: File,
  ): Promise<boolean> {
    if (!canEdit || lock.current || !evento.id) return false;
    lock.current = true;
    setPending(slot);
    onBusyChange(true);
    try {
      const { data } = await EventsService.updateEvent(
        String(evento.id),
        file ? {} : { removeBoletaImagenes: [slot] },
        undefined,
        undefined,
        undefined,
        file ? { [slot]: file } : undefined,
      );
      onUpdated(data);
      toast.success(
        file
          ? "Imagen de boleta guardada para este evento"
          : "Imagen de boleta eliminada de este evento",
      );
      return true;
    } catch {
      toast.error(
        "No se pudo actualizar la imagen. Tu selección se conserva para reintentar.",
      );
      return false;
    } finally {
      lock.current = false;
      setPending(null);
      onBusyChange(false);
    }
  }

  async function saveRecorte(
    slot: ClaveImagenBoletaDedicada,
    recorte: RecorteImagen,
  ): Promise<boolean> {
    if (!canEdit || lock.current || !evento.id) return false;
    lock.current = true;
    setPending(slot);
    onBusyChange(true);
    try {
      const { data } = await EventsService.updateEvent(String(evento.id), {
        boletaImagenesRecorte: { [slot]: recorte },
      });
      onUpdated(data);
      toast.success("Encuadre guardado para este evento");
      return true;
    } catch {
      toast.error(
        "No se pudo guardar el encuadre. Revisa tu conexión y permisos de super admin.",
      );
      return false;
    } finally {
      lock.current = false;
      setPending(null);
      onBusyChange(false);
    }
  }

  return (
    <div className="space-y-4">
      {!isLoading && !canEdit && (
        <p className="text-xs text-amber-700">
          Solo un super admin puede subir o quitar imágenes.
        </p>
      )}
      {canEdit && (
        <p className="text-xs leading-relaxed text-slate-500">
          Click derecho sobre una imagen (o botón Recortar) para elegir qué
          parte de la foto se verá; la caja conserva su posición y tamaño.
        </p>
      )}
      <div className={styles.assetGrid}>
        {IMAGE_SLOT_KEYS.map((slot) => (
          <ImageSlot
            key={slot}
            slot={slot}
            url={evento.boletaImagenes?.[slot]}
            recorte={evento.boletaImagenesRecorte?.[slot]}
            boxAspect={boxAspects[slot] ?? null}
            disabled={!canEdit || !!pending}
            pending={pending === slot}
            onUpload={(file) => mutate(slot, file)}
            onRemove={() => mutate(slot)}
            onSaveRecorte={(recorte) => saveRecorte(slot, recorte)}
          />
        ))}
      </div>
    </div>
  );
}
