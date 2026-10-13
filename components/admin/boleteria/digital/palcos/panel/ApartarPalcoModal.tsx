"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Lock, X } from "lucide-react";
import PalcosService from "@/services/PalcosService";
import {
  ApartarPalcoDatos,
  PalcoOcupadoAdmin,
} from "@/interfaces/palcos.interface";
import { formatDisplayDate } from "@/lib/TimeZone";
import { CUPOS_POR_PALCO } from "../estadosPalco";
import { useServerClock } from "../hooks/useServerClock";

// Mismos limites que valida el backend (ApartarPalcoDto)
const MAXIMO_NOTA = 300;
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CEDULA = /^\d{5,10}$/;

const OPCIONES: {
  valor: ApartarPalcoDatos["estado"];
  titulo: string;
  detalle: string;
}[] = [
  {
    valor: "RESERVADO",
    titulo: "Apartado",
    detalle: "Queda guardado para el cliente, sin boletas. No vence.",
  },
  {
    valor: "VENDIDO",
    titulo: "Vendido",
    detalle:
      "El cliente ya pagó por fuera de la app (ej: en taquilla). Se generan sus 10 boletas.",
  },
];

interface FormState {
  estado: ApartarPalcoDatos["estado"] | "";
  clienteNombre: string;
  clienteCorreo: string;
  clienteCedula: string;
  nota: string;
}

type FormErrors = Partial<Record<keyof FormState | "_server", string>>;

const limpiar = (texto: string) => texto.trim().replace(/\s+/g, " ");
// 1.234.567 queda 1234567
const limpiarCedula = (texto: string) => texto.replace(/[\s.-]/g, "");

const validar = (form: FormState): FormErrors => {
  const errores: FormErrors = {};
  if (!form.estado) errores.estado = "Elige cómo queda el palco";
  const nombre = limpiar(form.clienteNombre);
  if (nombre.length < 3 || nombre.length > 120)
    errores.clienteNombre = "Escribe el nombre completo (3 a 120 caracteres)";
  if (!CORREO.test(form.clienteCorreo.trim()))
    errores.clienteCorreo = "Escribe un correo válido";
  const cedula = limpiarCedula(form.clienteCedula);
  if (!cedula) errores.clienteCedula = "Escribe la cédula del cliente";
  else if (!CEDULA.test(cedula))
    errores.clienteCedula = "La cédula debe tener entre 5 y 10 números";
  const nota = limpiar(form.nota);
  if (!nota) errores.nota = "La nota es obligatoria";
  else if (nota.length > MAXIMO_NOTA)
    errores.nota = `Máximo ${MAXIMO_NOTA} caracteres`;
  return errores;
};

const datosDe = (form: FormState): ApartarPalcoDatos => ({
  estado: form.estado as ApartarPalcoDatos["estado"],
  nota: limpiar(form.nota),
  clienteNombre: limpiar(form.clienteNombre),
  clienteCorreo: form.clienteCorreo.trim().toLowerCase(),
  clienteCedula: limpiarCedula(form.clienteCedula),
});

const mensajeDeError = (err: any) => {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return typeof msg === "string" ? msg : "No se pudo apartar el palco";
};

const Resumen = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <div className="flex justify-between gap-3 text-sm">
    <dt className="text-gray-500">{etiqueta}</dt>
    <dd className="text-gray-800 font-medium text-right break-all">{valor}</dd>
  </div>
);

// Formulario para apartar un palco libre: como queda, los datos del
// cliente y una nota. Antes de guardar muestra un resumen para confirmar
export default function ApartarPalcoModal({
  eventoId,
  eventoNombre,
  figuraId,
  palcoNombre,
  libre,
  desfase,
  onClose,
  onApartado,
  onOcupado,
}: {
  eventoId: number;
  eventoNombre: string;
  figuraId: number;
  palcoNombre: string;
  // Sigue libre en el mapa (cambia en vivo mientras se llena el formulario)
  libre: boolean;
  // Hora del servidor menos la del computador
  desfase: number;
  onClose: () => void;
  onApartado: (palco: PalcoOcupadoAdmin) => void;
  // Otro lo tomo antes: hay que traer el mapa de nuevo
  onOcupado: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    estado: "",
    clienteNombre: "",
    clienteCorreo: "",
    clienteCedula: "",
    nota: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [paso, setPaso] = useState<"form" | "resumen">("form");
  const [enviando, setEnviando] = useState(false);
  // Hora del servidor, al segundo mientras se ve el resumen
  const ahora = useServerClock(desfase, paso === "resumen");

  const cambiar = (campo: keyof FormState, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo] || errors._server)
      setErrors((prev) => ({
        ...prev,
        [campo]: undefined,
        _server: undefined,
      }));
  };

  const revisar = (e: React.FormEvent) => {
    e.preventDefault();
    const errores = validar(form);
    setErrors(errores);
    if (Object.keys(errores).length === 0) setPaso("resumen");
  };

  const confirmar = async () => {
    setEnviando(true);
    try {
      const { data } = await PalcosService.apartarPalco(
        eventoId,
        figuraId,
        datosDe(form),
      );
      onApartado(data);
    } catch (err: any) {
      if (err?.response?.status === 409) onOcupado();
      setErrors({ _server: mensajeDeError(err) });
      setPaso("form");
    } finally {
      setEnviando(false);
    }
  };

  const inputClass = (conError?: string) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${
      conError
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50 focus:bg-white"
    }`;

  const datos = paso === "resumen" ? datosDe(form) : null;
  const opcion = OPCIONES.find((o) => o.valor === form.estado);
  const tomado = !libre && !enviando;
  const avisoTomado = tomado && (
    <div
      role="alert"
      className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>
        Este palco ya no está libre: alguien lo tomó mientras llenabas el
        formulario.
      </span>
    </div>
  );

  // En el body: ningun contenedor del mapa lo recorta
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* No cierra al hacer clic afuera: un clic accidental borraria lo
          que se lleno */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-apartar-palco"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <Lock className="h-5 w-5 flex-shrink-0 text-[#097EEC]" />
            <h3
              id="titulo-apartar-palco"
              className="text-lg font-semibold text-gray-800 truncate"
            >
              Apartar {palcoNombre}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {datos ? (
          <div className="space-y-4 px-6 py-5">
            {avisoTomado}
            <p className="text-sm text-gray-600">
              {form.estado === "VENDIDO"
                ? `Revisa los datos antes de guardar. Se generan las ${CUPOS_POR_PALCO} boletas del palco.`
                : "Revisa los datos antes de apartar. Las boletas se generan cuando lo marques vendido."}
            </p>
            <dl className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Resumen etiqueta="Evento" valor={eventoNombre} />
              <Resumen etiqueta="Palco" valor={palcoNombre} />
              <Resumen etiqueta="Queda" valor={opcion?.titulo ?? ""} />
              <Resumen
                etiqueta={
                  form.estado === "VENDIDO"
                    ? "Hora de la venta"
                    : "Hora de la reserva"
                }
                valor={formatDisplayDate(new Date(ahora).toISOString())}
              />
              <Resumen etiqueta="Cliente" valor={datos.clienteNombre} />
              <Resumen etiqueta="Correo" valor={datos.clienteCorreo} />
              <Resumen etiqueta="Cédula" valor={datos.clienteCedula} />
              <Resumen etiqueta="Nota" valor={datos.nota} />
            </dl>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaso("form")}
                disabled={enviando}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                Volver a editar
              </button>
              <button
                type="button"
                onClick={confirmar}
                disabled={enviando || tomado}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {enviando ? "Apartando..." : "Apartar palco"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={revisar} noValidate className="space-y-4 px-6 py-5">
            {avisoTomado}
            {errors._server && !tomado && (
              <div
                role="alert"
                className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
              >
                <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{errors._server}</span>
              </div>
            )}

            <fieldset>
              <legend className="block text-xs font-medium text-gray-600 mb-1">
                ¿Cómo queda el palco? <span className="text-red-400">*</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {OPCIONES.map((o) => (
                  <label
                    key={o.valor}
                    className={`flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm transition-colors ${
                      form.estado === o.valor
                        ? "border-[#097EEC] bg-blue-50"
                        : errors.estado
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium text-gray-800">
                      <input
                        type="radio"
                        name="estado"
                        value={o.valor}
                        checked={form.estado === o.valor}
                        onChange={() => cambiar("estado", o.valor)}
                        className="accent-[#097EEC]"
                      />
                      {o.titulo}
                    </span>
                    <span className="text-xs text-gray-500">{o.detalle}</span>
                  </label>
                ))}
              </div>
              {errors.estado && (
                <p className="mt-1 text-xs text-red-500">{errors.estado}</p>
              )}
            </fieldset>

            <div>
              <label
                htmlFor="apartar-nombre"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Nombre completo del cliente{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                id="apartar-nombre"
                type="text"
                value={form.clienteNombre}
                onChange={(e) => cambiar("clienteNombre", e.target.value)}
                maxLength={120}
                autoComplete="off"
                className={inputClass(errors.clienteNombre)}
              />
              {errors.clienteNombre && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.clienteNombre}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="apartar-correo"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Correo <span className="text-red-400">*</span>
                </label>
                <input
                  id="apartar-correo"
                  type="email"
                  value={form.clienteCorreo}
                  onChange={(e) => cambiar("clienteCorreo", e.target.value)}
                  maxLength={254}
                  autoComplete="off"
                  className={inputClass(errors.clienteCorreo)}
                />
                {errors.clienteCorreo && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.clienteCorreo}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="apartar-cedula"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Cédula <span className="text-red-400">*</span>
                </label>
                <input
                  id="apartar-cedula"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.clienteCedula}
                  // Solo números: lo demás se ignora al escribir o pegar
                  onChange={(e) =>
                    cambiar("clienteCedula", e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={10}
                  autoComplete="off"
                  className={inputClass(errors.clienteCedula)}
                />
                {errors.clienteCedula && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.clienteCedula}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="apartar-nota"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Nota <span className="text-red-400">*</span>
              </label>
              <textarea
                id="apartar-nota"
                value={form.nota}
                onChange={(e) => cambiar("nota", e.target.value)}
                rows={3}
                maxLength={MAXIMO_NOTA}
                placeholder="Ej: cortesía del patrocinador, pagó en taquilla…"
                className={`${inputClass(errors.nota)} resize-none`}
              />
              <div className="mt-1 flex justify-between gap-2 text-xs">
                <span className="text-red-500">{errors.nota}</span>
                <span className="text-gray-400 tabular-nums">
                  {form.nota.length}/{MAXIMO_NOTA}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={tomado}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Revisar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
