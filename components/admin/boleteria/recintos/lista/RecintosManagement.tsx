"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Recinto, CreateRecintoDto } from "@/interfaces/recinto.interface";
import RecintosService from "@/services/RecintosService";
import RecintoFormModal from "./RecintoFormModal";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  Shapes,
  Ruler,
  PenTool,
  PlusCircle,
  Pencil,
  Power,
  Trash2,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

// Mensaje del backend si viene (ej: por que no se puede eliminar)
const mensajeDeError = (err: any, porDefecto: string): string => {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  return typeof msg === "string" ? msg : porDefecto;
};

// Lista de recintos. Un recinto se dibuja una vez y se reutiliza en
// varias ferias (RN-13); aqui solo se ven sus datos, el dibujo va en el
// editor (/admin/boleteria/recintos/[recintoId])
const RecintosManagement = () => {
  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recintoToEdit, setRecintoToEdit] = useState<Recinto | null>(null);
  const [recintoToDelete, setRecintoToDelete] = useState<Recinto | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoEstadoId, setCambiandoEstadoId] = useState<number | null>(
    null,
  );

  // Con un modal abierto se bloquea el scroll de fondo
  const isModalOpen = showCreateModal || !!recintoToEdit;
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    RecintosService.getRecintos()
      .then((res) => setRecintos(res.data))
      .catch(() => toast.error("Error al cargar los recintos"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (dto: CreateRecintoDto) => {
    const res = await RecintosService.createRecinto(dto);
    setRecintos((prev) => [res.data, ...prev]);
    toast.success("Recinto creado");
  };

  const handleEdit = async (id: number, dto: CreateRecintoDto) => {
    const res = await RecintosService.updateRecinto(id, dto);
    setRecintos((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    toast.success("Recinto actualizado");
  };

  // RN-23: desactivado no se asigna a ferias nuevas; las que ya lo usan
  // no se afectan. Es reversible, por eso no pide confirmacion
  const handleToggleActivo = async (recinto: Recinto) => {
    setCambiandoEstadoId(recinto.id);
    try {
      const res = await RecintosService.updateRecinto(recinto.id, {
        activo: !recinto.activo,
      });
      setRecintos((prev) =>
        prev.map((r) => (r.id === recinto.id ? res.data : r)),
      );
      toast.success(
        res.data.activo
          ? "Recinto activado"
          : "Recinto desactivado: ya no se puede asignar a ferias nuevas",
      );
    } catch (err) {
      toast.error(mensajeDeError(err, "No se pudo cambiar el estado"));
    } finally {
      setCambiandoEstadoId(null);
    }
  };

  // El backend lo bloquea (409) si alguna feria lo usa o si tiene palcos
  // con ventas; en ese caso se muestra su mensaje
  const handleDelete = async () => {
    if (!recintoToDelete) return;
    setEliminando(true);
    try {
      await RecintosService.deleteRecinto(recintoToDelete.id);
      setRecintos((prev) => prev.filter((r) => r.id !== recintoToDelete.id));
      toast.success("Recinto eliminado");
    } catch (err) {
      toast.error(mensajeDeError(err, "No se pudo eliminar el recinto"));
    } finally {
      setEliminando(false);
      setRecintoToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-700">
          Recintos ({recintos.length})
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#097EEC] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0562C7] active:scale-[0.98] transition-all font-medium shadow-sm shadow-blue-100"
        >
          <PlusCircle className="h-4 w-4" />
          Crear recinto
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-xl p-4 space-y-3 animate-pulse"
            >
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : recintos.length === 0 ? (
        <div className="py-20 text-center">
          <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
            <Shapes className="h-9 w-9 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">
            No hay recintos todavía
          </h3>
          <p className="mt-1.5 text-sm text-gray-400">
            Un recinto es el dibujo del lugar del evento: tarima, zonas y
            palcos.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#097EEC] hover:underline font-medium"
          >
            <PlusCircle className="h-4 w-4" />
            Crear recinto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recintos.map((recinto, i) => (
            <div
              key={recinto.id}
              className={`opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards] flex flex-col border rounded-xl p-4 ${
                recinto.activo
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                      recinto.activo
                        ? "bg-[#097EEC]/10 text-[#097EEC]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Shapes className="h-4 w-4" />
                  </span>
                  <h3
                    className={`text-sm font-semibold truncate ${
                      recinto.activo ? "text-gray-800" : "text-gray-500"
                    }`}
                  >
                    {recinto.nombre}
                  </h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* RN-23: uno inactivo no se asigna a ferias nuevas */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      recinto.activo
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {recinto.activo ? "Activo" : "Inactivo"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleActivo(recinto)}
                    disabled={cambiandoEstadoId === recinto.id}
                    title={recinto.activo ? "Desactivar" : "Activar"}
                    className="h-7 w-7 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors disabled:opacity-40"
                  >
                    <Power className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecintoToDelete(recinto)}
                    title="Eliminar"
                    className="h-7 w-7 rounded-full border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-500 line-clamp-2 min-h-[2rem]">
                {recinto.descripcion || "Sin descripción"}
              </p>

              <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
                <Ruler className="h-3 w-3" />
                Lienzo {recinto.lienzoAncho} × {recinto.lienzoAlto}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400 truncate">
                <UserRound className="h-3 w-3 flex-shrink-0" />
                Creado por {recinto.creadoPor?.name ?? "—"}
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecintoToEdit(recinto)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar datos
                </button>
                <Link
                  href={`/admin/boleteria/recintos/${recinto.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-[#097EEC] text-xs font-medium text-white hover:bg-[#0562C7] transition-colors"
                >
                  <PenTool className="h-3.5 w-3.5" />
                  Abrir editor
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <RecintoFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {recintoToEdit && (
        <RecintoFormModal
          recinto={recintoToEdit}
          onClose={() => setRecintoToEdit(null)}
          onSubmit={(dto) => handleEdit(recintoToEdit.id, dto)}
        />
      )}

      <ConfirmationModal
        isOpen={!!recintoToDelete}
        onClose={() => {
          if (!eliminando) setRecintoToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar recinto"
        message={`Se eliminará "${recintoToDelete?.nombre ?? ""}". Si alguna feria lo usa o tiene palcos con ventas, el sistema no lo permitirá.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={eliminando}
      />
    </>
  );
};

export default RecintosManagement;
