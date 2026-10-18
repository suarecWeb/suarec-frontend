"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Loader2,
  AlertCircle,
  Repeat,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  pushBroadcastAdminService,
  PushBroadcastDeepLink,
  PushBroadcastItem,
} from "@/services/push-broadcast-admin.service";

// Tab "Programadas" (roadmap notificaciones-programadas.txt, 7.2): agenda
// notificaciones a día+hora (hora Colombia) y gestiona (quita) las que
// siguen pendientes. Sin reglas de 3/día ni 30 min -- esas solo aplican a
// las inmediatas de NotificationsSendForm.tsx (decisión 3 del roadmap).

const DEEP_LINK_OPTIONS: {
  value: PushBroadcastDeepLink | "";
  label: string;
}[] = [
  { value: "", label: "Sin redirección" },
  { value: PushBroadcastDeepLink.EVENTOS, label: "Eventos" },
];

// Margen de seguridad sobre los 2 minutos que exige el backend (RF-2) --
// evita un 400 justo al enviar por el tiempo que tarda la validación y la
// ida/vuelta de red
const MARGEN_MINUTOS_CLIENTE = 3;

function minDateTimeColombia(): { date: string; time: string } {
  const minimo = new Date(Date.now() + MARGEN_MINUTOS_CLIENTE * 60 * 1000);
  const colombia = new Date(
    minimo.toLocaleString("en-US", { timeZone: "America/Bogota" }),
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${colombia.getFullYear()}-${pad(colombia.getMonth() + 1)}-${pad(colombia.getDate())}`,
    time: `${pad(colombia.getHours())}:${pad(colombia.getMinutes())}`,
  };
}

const NotificationsScheduleForm = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState<PushBroadcastDeepLink | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [sending, setSending] = useState(false);

  const [items, setItems] = useState<PushBroadcastItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<string | null>(
    null,
  );

  const limite = minDateTimeColombia();
  const isValid =
    title.trim().length > 0 && body.trim().length > 0 && !!date && !!time;

  const cargarLista = () => {
    setLoadingList(true);
    pushBroadcastAdminService
      .getScheduled()
      .then(setItems)
      .catch(() => setListError(true))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    cargarLista();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSending(true);
    try {
      await pushBroadcastAdminService.create({
        title: title.trim(),
        body: body.trim(),
        ...(deepLink ? { deepLink } : {}),
        scheduledFor: pushBroadcastAdminService.toColombiaISOString(date, time),
        repeatDaily,
      });
      toast.success("Notificación programada correctamente.");
      setTitle("");
      setBody("");
      setDeepLink("");
      setDate("");
      setTime("");
      setRepeatDaily(false);
      cargarLista();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      toast.error(
        typeof message === "string"
          ? message
          : "No se pudo programar la notificación. Revisa la fecha/hora.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    try {
      await pushBroadcastAdminService.cancel(id);
      toast.success("Programada eliminada.");
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("Ya salió o está saliendo, no se puede quitar.");
        cargarLista();
      } else {
        toast.error("No se pudo quitar la programada.");
      }
    } finally {
      setCancelingId(null);
      setConfirmingCancelId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* ─── Formulario ─────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Ej: Nuevo evento disponible"
            disabled={sending}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC] disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Texto que se muestra en la notificación"
            disabled={sending}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC] disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">{body.length}/500</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Redirección al tocar la notificación
          </label>
          <select
            value={deepLink}
            onChange={(e) =>
              setDeepLink(e.target.value as PushBroadcastDeepLink | "")
            }
            disabled={sending}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC] disabled:bg-gray-50"
          >
            {DEEP_LINK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha (Colombia)
            </label>
            <input
              type="date"
              value={date}
              min={limite.date}
              onChange={(e) => setDate(e.target.value)}
              disabled={sending}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC] disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora (Colombia)
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={sending}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC] disabled:bg-gray-50"
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={repeatDaily}
            onChange={(e) => setRepeatDaily(e.target.checked)}
            disabled={sending}
            className="h-4 w-4 rounded border-gray-300 text-[#097EEC] focus:ring-[#097EEC]"
          />
          Repetir diariamente a la misma hora
        </label>

        <button
          type="submit"
          disabled={!isValid || sending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CalendarClock className="h-4 w-4" />
          )}
          Programar
        </button>
      </form>

      {/* ─── Lista de programadas pendientes ────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Programadas pendientes
        </p>

        {loadingList ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#097EEC]" />
          </div>
        ) : listError ? (
          <div className="flex flex-col items-center gap-2 py-10 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <p className="text-sm">No se pudo cargar la lista.</p>
          </div>
        ) : !items.length ? (
          <p className="text-sm text-gray-500 text-center py-10">
            No hay notificaciones programadas.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{item.body}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {item.scheduledFor
                        ? pushBroadcastAdminService.formatDate(
                            item.scheduledFor,
                          )
                        : "—"}
                    </span>
                    {item.repeatDaily && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#097EEC]">
                        <Repeat className="h-3 w-3" />
                        Diaria
                      </span>
                    )}
                  </div>
                </div>
                {confirmingCancelId === item.id ? (
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCancel(item.id)}
                      disabled={cancelingId === item.id}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white disabled:opacity-50"
                    >
                      {cancelingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Sí, quitar"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingCancelId(null)}
                      disabled={cancelingId === item.id}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancelId(item.id)}
                    title="Quitar"
                    className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsScheduleForm;
