"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Evento } from "@/interfaces/event.interface";

interface DeleteEventModalProps {
  event: Evento;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export default function DeleteEventModal({
  event,
  onClose,
  onConfirm,
}: DeleteEventModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!event.id) return;
    setLoading(true);
    try {
      await onConfirm(event.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <h2 className="text-base font-semibold text-gray-800">
              Eliminar evento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar el evento{" "}
            <span className="font-semibold text-gray-800">
              &quot;{event.nombre}&quot;
            </span>
            ?
          </p>
          <p className="mt-1.5 text-xs text-gray-400">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
