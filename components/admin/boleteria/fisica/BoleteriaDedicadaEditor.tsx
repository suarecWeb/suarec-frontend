"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  Loader2,
  PanelLeftOpen,
  PanelLeftClose,
  MousePointer2,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import EventsService from "@/services/EventsService";
import {
  CampoPlantillaDedicada,
  ClaveCampoDedicada,
  PlantillaDedicada,
  RecorteImagen,
} from "@/interfaces/plantilla-dedicada.interface";
import DedicadaCanvas from "./DedicadaCanvas";
import styles from "./dedicada.module.css";
import {
  constrainField,
  isImageField,
  createDefaultTemplate,
  FIELD_LABELS,
  MAX_MARGIN_MM,
  normalizeMarginMm,
} from "./plantillaDedicada";

export default function BoleteriaDedicadaEditor({
  imagenes,
  recortes,
  onCropRequest,
}: {
  imagenes?: Record<string, string>;
  // Encuadre por ranura del evento seleccionado (ver DedicadaCanvas).
  recortes?: Record<string, RecorteImagen>;
  // Click derecho sobre un bloque de imagen del lienzo (solo super admin).
  onCropRequest?: (clave: ClaveCampoDedicada) => void;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const [template, setTemplate] = useState<PlantillaDedicada | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [selected, setSelected] = useState<ClaveCampoDedicada>("tipoBoleta");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedActive, setSavedActive] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [reload, setReload] = useState(0);
  const canEdit = !authLoading && !!user?.isSuperAdmin;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    EventsService.getPlantillaDedicada()
      .then(({ data }) => {
        if (!active) return;
        // Solo se conservan propiedades del contrato; no id ni metadatos de BD.
        const defaults = createDefaultTemplate();
        const margin = normalizeMarginMm(data.margenMm);
        setTemplate({
          margenMm: margin,
          activa: data.activa === true,
          anchoMm: 50,
          altoMm: 152.4,
          campos: defaults.campos.map((fallback) => {
            const field = data.campos.find(
              (item) => item.clave === fallback.clave,
            );
            if (!field)
              return constrainField({ ...fallback, activo: false }, margin);
            const {
              clave,
              activo,
              xMm,
              yMm,
              anchoMm,
              altoMm,
              fontSize,
              alineacion,
              negrita,
              mayusculas,
            } = field;
            return constrainField(
              {
                clave,
                activo,
                xMm,
                yMm,
                anchoMm,
                altoMm,
                fontSize,
                alineacion,
                negrita,
                mayusculas,
              },
              margin,
            );
          }),
        });
        setSavedActive(data.activa === true);
        setDirty(
          data.campos.some((item) => {
            const bounded = constrainField(item, margin);
            return (["xMm", "yMm", "anchoMm", "altoMm"] as const).some(
              (key) => item[key] !== bounded[key],
            );
          }),
        );
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  function change(field: CampoPlantillaDedicada) {
    if (!canEdit || saving) return;
    setTemplate(
      (current) =>
        current && {
          ...current,
          campos: current.campos.map((item) =>
            item.clave === field.clave
              ? constrainField(field, current.margenMm)
              : item,
          ),
        },
    );
    setDirty(true);
  }
  async function save() {
    if (!template || !canEdit || saving) return;
    setSaving(true);
    try {
      await EventsService.updatePlantillaDedicada(template);
      setSavedActive(template.activa);
      setDirty(false);
      toast.success("Plantilla global de boletería dedicada guardada");
    } catch {
      toast.error(
        "No se pudo guardar la plantilla. Revisa tu conexión y permisos de super admin.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <div role="status" className={styles.loading}>
        <Loader2
          aria-hidden="true"
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
        />
        Cargando plantilla dedicada...
      </div>
    );
  if (error || !template)
    return (
      <div role="alert" className={styles.errorCard}>
        No se pudo cargar la plantilla dedicada.{" "}
        <button
          type="button"
          onClick={() => setReload((value) => value + 1)}
          className="underline"
        >
          Reintentar
        </button>
      </div>
    );
  const field = template.campos.find((item) => item.clave === selected)!;
  const disabled = !canEdit || saving;
  return (
    <section className={styles.editor}>
      <header className={styles.editorHeader}>
        <div>
          <h2>Diseño de ticket</h2>
          <p>Distribución global · papel 50 × 152,4 mm</p>
        </div>
        <span className={styles.editorHint}>
          Selecciona y arrastra los campos en el lienzo
          {onCropRequest
            ? " · click derecho sobre una imagen para recortarla"
            : ""}
        </span>
      </header>
      {!authLoading && !canEdit && (
        <p className="text-sm text-amber-700">
          Solo un super admin puede modificar y guardar esta plantilla.
        </p>
      )}
      <p className={styles.resetNote}>
        Los textos y el QR se completan en la venta. Aquí se ajusta su
        distribución junto a las imágenes del evento.
      </p>
      <div className={styles.settings}>
        <div className={styles.activation}>
          <span
            role="status"
            className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${savedActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
          >
            {savedActive
              ? "Activo · Boletería dedicada"
              : "Inactivo · Impresión POS"}
          </span>
          <label className="flex items-start gap-3 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              role="switch"
              aria-label="Usar esta plantilla como modo de impresión por defecto para la venta física"
              checked={template.activa}
              disabled={disabled}
              onChange={(event) => {
                setTemplate({ ...template, activa: event.target.checked });
                setDirty(true);
              }}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#097EEC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            />
            Usar en venta física
          </label>
          <p className="mt-2 text-xs text-gray-600">
            Pulsa Guardar para aplicar el modo seleccionado.
          </p>
        </div>
        <div className={styles.marginCard}>
          <label
            className="block text-sm font-medium text-gray-900"
            htmlFor="dedicated-margin"
          >
            Margen de seguridad (mm)
          </label>
          <input
            id="dedicated-margin"
            type="number"
            min={0}
            max={MAX_MARGIN_MM}
            step="0.125"
            value={template.margenMm}
            disabled={disabled}
            aria-describedby="dedicated-margin-help"
            title="Las cajas se ajustan automáticamente al margen de seguridad."
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              if (!Number.isFinite(value)) return;
              const margin = normalizeMarginMm(value);
              setTemplate(
                (current) =>
                  current && {
                    ...current,
                    margenMm: margin,
                    campos: current.campos.map((item) =>
                      constrainField(item, margin),
                    ),
                  },
              );
              setDirty(true);
            }}
            className="mt-2 w-32 rounded-lg border border-gray-300 p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-50"
          />
          <p id="dedicated-margin-help" className="mt-2 text-xs text-gray-600">
            0–10 mm por borde.
          </p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.secondaryButton}
          aria-expanded={propertiesOpen}
          aria-controls="dedicated-field-properties"
          onClick={() => setPropertiesOpen((open) => !open)}
        >
          {propertiesOpen ? (
            <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
          ) : (
            <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
          )}
          {propertiesOpen ? "Ocultar propiedades" : "Mostrar propiedades"}
        </button>
        <button
          type="button"
          disabled={disabled || !dirty}
          onClick={save}
          className={styles.primaryButton}
        >
          {saving ? (
            <Loader2
              aria-hidden="true"
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Save aria-hidden="true" className="h-4 w-4" />
          )}
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setTemplate(createDefaultTemplate());
            setDirty(true);
          }}
          className={styles.secondaryButton}
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Restaurar default
        </button>
        <span role="status" className="text-sm text-gray-500">
          {dirty ? "Cambios sin guardar" : "Sin cambios pendientes"}
        </span>
      </div>
      <p className={styles.resetNote}>
        Guardar publica la distribución global. Restaurar default recupera el
        diseño inicial.
      </p>
      <div
        className={`${styles.workspace} ${propertiesOpen ? "" : styles.workspaceCollapsed}`}
      >
        <fieldset
          id="dedicated-field-properties"
          hidden={!propertiesOpen}
          disabled={disabled}
          className={`${styles.properties} space-y-4 disabled:opacity-60`}
        >
          <legend className="px-1 font-medium">Propiedades del campo</legend>
          <label className="block text-sm">
            Campo
            <select
              value={selected}
              onChange={(event) =>
                setSelected(event.target.value as ClaveCampoDedicada)
              }
              className="mt-1 w-full rounded border p-2"
            >
              {template.campos.map((item) => (
                <option key={item.clave} value={item.clave}>
                  {FIELD_LABELS[item.clave]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={field.activo}
              onChange={(event) =>
                change({ ...field, activo: event.target.checked })
              }
            />
            Imprimir campo
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["xMm", "X (mm)"],
                ["yMm", "Y (mm)"],
                ["anchoMm", "Ancho (mm)"],
                ["altoMm", "Alto (mm)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm">
                {label}
                <input
                  type="number"
                  step="0.125"
                  min={
                    key === "anchoMm" || key === "altoMm"
                      ? 0.125
                      : template.margenMm
                  }
                  max={
                    key === "xMm"
                      ? 50 - template.margenMm - field.anchoMm
                      : key === "yMm"
                        ? 1219 / 8 - template.margenMm - field.altoMm
                        : key === "anchoMm"
                          ? 50 - template.margenMm * 2
                          : 1219 / 8 - template.margenMm * 2
                  }
                  value={Number(field[key].toFixed(3))}
                  onChange={(event) => {
                    const value = event.target.valueAsNumber;
                    if (Number.isFinite(value))
                      change({ ...field, [key]: value });
                  }}
                  className="mt-1 w-full rounded border p-2"
                />
              </label>
            ))}
          </div>
          {!isImageField(field.clave) && (
            <>
              <label className="block text-sm">
                Alineación
                <select
                  value={field.alineacion}
                  onChange={(event) =>
                    change({
                      ...field,
                      alineacion: event.target
                        .value as CampoPlantillaDedicada["alineacion"],
                    })
                  }
                  className="mt-1 w-full rounded border p-2"
                >
                  <option value="izquierda">Izquierda</option>
                  <option value="centro">Centro</option>
                  <option value="derecha">Derecha</option>
                </select>
              </label>
              <label className="block text-sm">
                Fuente TSPL (1–8)
                <select
                  value={field.fontSize}
                  onChange={(event) =>
                    change({ ...field, fontSize: Number(event.target.value) })
                  }
                  className="mt-1 w-full rounded border p-2"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={field.negrita}
                  onChange={(event) =>
                    change({ ...field, negrita: event.target.checked })
                  }
                />
                Negrita
              </label>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={field.mayusculas}
                  onChange={(event) =>
                    change({ ...field, mayusculas: event.target.checked })
                  }
                />
                Mayúsculas
              </label>
            </>
          )}
          {isImageField(field.clave) && (
            <p className="text-xs leading-relaxed text-slate-500">
              Bloque de imagen: ajusta su posición y tamaño. El contenido se
              adapta sin recortarse; la tipografía forma parte de la imagen del
              evento.
            </p>
          )}
          {field.clave === "qr" && (
            <p className="text-xs text-gray-500">
              El QR usa el menor valor entre ancho y alto como lado, en mm.
            </p>
          )}
          {field.clave === "logoPatrocinadores" && (
            <p className="text-xs text-amber-700">
              Beta: los bitmaps TSPL son más pesados. Se muestra el logo del
              evento seleccionado cuando está disponible.
            </p>
          )}
        </fieldset>
        <div className={styles.editorPanel}>
          <div className={styles.panelHeading}>
            <h3>
              <MousePointer2 aria-hidden="true" />
              Editor de plantilla
            </h3>
            <span>100 % · 1 px = 1 dot</span>
          </div>
          <DedicadaCanvas
            campos={template.campos}
            showFieldLabels
            imagenes={imagenes}
            recortes={recortes}
            margenMm={template.margenMm}
            selected={selected}
            onSelect={setSelected}
            onChange={change}
            disabled={disabled}
            onCropRequest={canEdit && !saving ? onCropRequest : undefined}
          />
        </div>
        <aside className={styles.previewPanel}>
          <div className={styles.panelHeading}>
            <h3>
              <Eye aria-hidden="true" />
              Vista previa
            </h3>
            <span>Campos sin rellenar</span>
          </div>
          <DedicadaCanvas
            campos={template.campos}
            showFieldLabels
            imagenes={imagenes}
            recortes={recortes}
            margenMm={template.margenMm}
            preview
          />
        </aside>
      </div>
    </section>
  );
}
