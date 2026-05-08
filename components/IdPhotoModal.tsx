"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  ImageOff,
} from "lucide-react";
import { IdPhoto, IdPhotosService } from "@/services/IdPhotosService";
import toast from "react-hot-toast";

interface Props {
  photo: IdPhoto;
  onClose: () => void;
  onReviewed?: () => void;
}

const formatTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const IdPhotoModal = ({ photo, onClose, onReviewed }: Props) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<
    "idle" | "confirm" | "sending" | "done" | "error"
  >("idle");
  const [pendingAction, setPendingAction] = useState<
    "approved" | "rejected" | null
  >(null);
  const [allPhotos, setAllPhotos] = useState<IdPhoto[]>([photo]);
  const [loadingAll, setLoadingAll] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";

    IdPhotosService.getUserIdPhotosById(photo.user_id)
      .then((photos) => setAllPhotos(photos.length > 0 ? photos : [photo]))
      .catch(() => setAllPhotos([photo]))
      .finally(() => setLoadingAll(false));

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [photo.user_id, photo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "sending") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [step]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleRequest = (action: "approved" | "rejected") => {
    setPendingAction(action);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    setStep("sending");
    try {
      await IdPhotosService.reviewIdPhoto(photo.id, { status: pendingAction });
      setStep("done");
      toast.success(
        pendingAction === "approved" ? "Foto aprobada" : "Foto rechazada",
      );
      onReviewed?.();
      setTimeout(handleClose, 1500);
    } catch {
      setStep("error");
    }
  };

  const content = (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-colors duration-300 ${
        visible ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={step === "sending" ? undefined : handleClose}
    >
      <div
        className={`relative w-full sm:max-w-lg max-h-[90vh] bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full sm:translate-y-10 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Cerrar */}
        <button
          onClick={handleClose}
          disabled={step === "sending"}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                Verificación de Cédula
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <User className="h-3 w-3" />
                Usuario #{photo.user_id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              <Clock className="h-3 w-3" />
              {formatTime(photo.created_at)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              #{photo.id}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Fotos del usuario */}
          {loadingAll ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#097EEC]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allPhotos.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {p.photo_type === "front" ? "Frente" : "Reverso"}
                  </p>
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt={`Cédula ${p.photo_type}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <ImageOff className="h-8 w-8" />
                        <span className="text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-400 italic">
                      {p.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Acciones */}
          {step === "done" ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-700">
                {pendingAction === "approved"
                  ? "Foto aprobada correctamente"
                  : "Foto rechazada"}
              </p>
            </div>
          ) : step === "error" ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700">
                Error al procesar. Intenta de nuevo.
              </p>
            </div>
          ) : step === "confirm" ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
              <p className="text-sm text-center text-orange-700 font-medium">
                {pendingAction === "approved"
                  ? "¿Confirmar aprobación de la foto de cédula?"
                  : "¿Rechazar esta foto? El usuario deberá subir una nueva."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPendingAction(null);
                    setStep("idle");
                  }}
                  className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${
                    pendingAction === "approved"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          ) : step === "sending" ? (
            <div className="flex items-center justify-center gap-2 py-3 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Procesando...</span>
            </div>
          ) : (
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => handleRequest("approved")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Aprobar
              </button>
              <button
                onClick={() => handleRequest("rejected")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Rechazar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
};

export default IdPhotoModal;
