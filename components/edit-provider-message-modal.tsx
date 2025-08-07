import { useState } from "react";
import { Contract } from "@/interfaces/contract.interface";
import { ContractService } from "@/services/ContractService";
import { useNotification } from "@/contexts/NotificationContext";

interface EditProviderMessageModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  onMessageUpdated: (newMessage: string) => void;
}

export default function EditProviderMessageModal({
  contract,
  isOpen,
  onClose,
  onMessageUpdated,
}: EditProviderMessageModalProps) {
  const [message, setMessage] = useState(contract.providerMessage || "");
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const isVirtual = contract.propertyType === "virtual";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ContractService.updateContract(contract.id, {
        providerMessage: message.trim(),
      });
      showNotification("Mensaje actualizado exitosamente", "success");
      onMessageUpdated(message.trim());
      onClose();
    } catch (error: any) {
      showNotification(
        `Error al actualizar: ${error?.response?.data?.message || "Error desconocido"}`,
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto modal-scrollbar">
        <div className="bg-[#097EEC] text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">
            Editar {isVirtual ? "enlace virtual" : "mensaje"}
          </h2>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors p-1"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isVirtual
              ? "Enlace de conexión virtual"
              : "Mensaje para el cliente"}
            {isVirtual && <span className="text-red-500">*</span>}
          </label>
          <input
            type={isVirtual ? "url" : "text"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
            placeholder={
              isVirtual
                ? "Ej: https://meet.google.com/abc-defg-hij"
                : "Mensaje para el cliente..."
            }
            required={isVirtual}
          />
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
