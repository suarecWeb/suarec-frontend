"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BankInfo,
  CreateBankInfoRequest,
  DocumentType,
  AccountType,
  DOCUMENT_TYPE_OPTIONS,
  ACCOUNT_TYPE_OPTIONS,
} from "@/interfaces/bank-info";
import { BankInfoService } from "@/services/bank-info.service";
import { BanksService, WompiBank } from "@/services/banks.service";

interface BankInfoFormProps {
  userId: number;
  initialData?: BankInfo | null;
  onSave?: (data: BankInfo) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

export default function BankInfoForm({
  userId,
  initialData,
  onSave,
  onDelete,
  onCancel,
}: BankInfoFormProps) {
  const [formData, setFormData] = useState<CreateBankInfoRequest>({
    accountHolderName: "",
    documentType: DocumentType.CC,
    documentNumber: "",
    bankName: "",
    accountType: AccountType.AHORROS,
    accountNumber: "",
    contactEmail: "",
    contactPhone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [banks, setBanks] = useState<WompiBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cargar datos iniciales si existen
  useEffect(() => {
    if (initialData) {
      setFormData({
        accountHolderName: initialData.accountHolderName,
        documentType: initialData.documentType,
        documentNumber: initialData.documentNumber,
        bankName: initialData.bankName,
        accountType: initialData.accountType,
        accountNumber: initialData.accountNumber,
        contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone || "",
      });
    }
  }, [initialData]);

  // Cargar bancos desde Wompi
  useEffect(() => {
    const fetchBanks = async () => {
      setBanksLoading(true);
      try {
        const result = await BanksService.getBanks();
        if (result.success && result.data) {
          setBanks(result.data);
          if (result.message) {
            console.warn(result.message);
          }
        }
      } catch (error) {
        console.error("Error al cargar bancos:", error);
      } finally {
        setBanksLoading(false);
      }
    };

    fetchBanks();
  }, []);

  const handleInputChange = (
    field: keyof CreateBankInfoRequest,
    value: string,
  ) => {
    let processedValue = value;

    // Validaciones específicas por campo
    switch (field) {
      case "accountHolderName":
        // Solo letras, espacios, tildes y caracteres especiales del español
        processedValue = value.replace(/[^a-zA-ZÀ-ÿ\u00f1\u00d1\s]/g, "");
        break;
      case "documentNumber":
        // Solo números
        processedValue = value.replace(/[^0-9]/g, "");
        break;
      case "accountNumber":
        // Solo números
        processedValue = value.replace(/[^0-9]/g, "");
        break;
      case "contactPhone":
        // Solo números, espacios, guiones y el símbolo +
        processedValue = value.replace(/[^0-9\s\-+]/g, "");
        break;
      case "contactEmail":
        // Permitir caracteres válidos para email (sin validación de formato aquí)
        processedValue = value.toLowerCase().trim();
        break;
      default:
        processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
    // No necesitamos limpiar mensajes ya que usamos notificaciones toast
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      if (
        !formData.accountHolderName ||
        !formData.documentNumber ||
        !formData.bankName ||
        !formData.accountNumber
      ) {
        toast.error("Por favor completa todos los campos obligatorios");
        return;
      }

      // Validaciones adicionales
      if (formData.accountHolderName.length < 3) {
        toast.error("El nombre completo debe tener al menos 3 caracteres");
        return;
      }

      if (formData.documentNumber.length < 6) {
        toast.error("El número de documento debe tener al menos 6 dígitos");
        return;
      }

      if (formData.accountNumber.length < 8) {
        toast.error("El número de cuenta debe tener al menos 8 dígitos");
        return;
      }

      // Validar email si se proporciona
      if (formData.contactEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail)) {
          toast.error("Por favor ingresa un correo electrónico válido");
          return;
        }
      }

      // Validar teléfono si se proporciona
      if (formData.contactPhone) {
        const phoneRegex = /^[\+]?[\d\s\-]{10,}$/;
        if (!phoneRegex.test(formData.contactPhone)) {
          toast.error(
            "Por favor ingresa un número de teléfono válido (mínimo 10 dígitos)",
          );
          return;
        }
      }

      // Mostrar toast de carga
      const loadingToast = toast.loading(
        initialData
          ? "Actualizando información bancaria..."
          : "Guardando información bancaria...",
      );

      const result = initialData
        ? await BankInfoService.updateBankInfo(userId, formData)
        : await BankInfoService.createBankInfo(userId, formData);

      // Cerrar toast de carga
      toast.dismiss(loadingToast);

      if (result.success && result.data) {
        toast.success(
          initialData
            ? "Información bancaria actualizada exitosamente"
            : "Información bancaria guardada exitosamente",
        );
        onSave?.(result.data);
      } else {
        toast.error(result.message || "Error al guardar la información");
      }
    } catch (error) {
      toast.error("Error inesperado. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      const loadingToast = toast.loading("Eliminando información bancaria...");
      const result = await BankInfoService.deleteBankInfo(userId);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Información bancaria eliminada exitosamente");
        onDelete?.();
      } else {
        toast.error(result.message || "Error al eliminar la información");
      }
    } catch (error) {
      toast.error("Error inesperado. Por favor intenta de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {initialData ? "Actualizar" : "Agregar"} Información Bancaria
        </h2>
        {initialData && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre completo del titular */}
        <div className="space-y-2">
          <label
            htmlFor="accountHolderName"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre completo del titular *
          </label>
          <Input
            id="accountHolderName"
            value={formData.accountHolderName}
            onChange={(e) =>
              handleInputChange("accountHolderName", e.target.value)
            }
            placeholder="Juan Carlos Pérez García"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500">
            Solo se permiten letras y espacios
          </p>
        </div>

        {/* Tipo de documento */}
        <div className="space-y-2">
          <label
            htmlFor="documentType"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de documento *
          </label>
          <select
            id="documentType"
            value={formData.documentType}
            onChange={(e) => handleInputChange("documentType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número de documento */}
        <div className="space-y-2">
          <label
            htmlFor="documentNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Número de documento *
          </label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) =>
              handleInputChange("documentNumber", e.target.value)
            }
            placeholder="1234567890"
            inputMode="numeric"
            maxLength={15}
            required
          />
          <p className="text-xs text-gray-500">
            Solo números, sin puntos ni espacios
          </p>
        </div>

        {/* Banco */}
        <div className="space-y-2">
          <label
            htmlFor="bankName"
            className="block text-sm font-medium text-gray-700"
          >
            Banco *
          </label>
          <select
            id="bankName"
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={banksLoading}
          >
            <option value="">
              {banksLoading ? "Cargando bancos..." : "Seleccionar banco"}
            </option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de cuenta */}
        <div className="space-y-2">
          <label
            htmlFor="accountType"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de cuenta *
          </label>
          <select
            id="accountType"
            value={formData.accountType}
            onChange={(e) => handleInputChange("accountType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número de cuenta */}
        <div className="space-y-2">
          <label
            htmlFor="accountNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Número de cuenta *
          </label>
          <Input
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange("accountNumber", e.target.value)}
            placeholder="1234567890123456"
            inputMode="numeric"
            maxLength={20}
            required
          />
          <p className="text-xs text-gray-500">
            Solo números, sin guiones ni espacios
          </p>
        </div>

        {/* Correo de contacto */}
        <div className="space-y-2">
          <label
            htmlFor="contactEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Correo de contacto *
          </label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        {/* Teléfono de contacto */}
        <div className="space-y-2">
          <label
            htmlFor="contactPhone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono de contacto *
          </label>
          <Input
            id="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
            placeholder="3001234567"
            inputMode="tel"
            maxLength={15}
            required
          />
          <p className="text-xs text-gray-500">
            Formato: 3001234567 o +57 300 123 4567
          </p>
        </div>

        <div className="flex gap-3">
          {initialData && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={`${initialData && onCancel ? "flex-1" : "w-full"} bg-[#097EEC] text-white hover:bg-[#0A6BC7] transition-colors`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>{initialData ? "Actualizar" : "Guardar"} Información</>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta información bancaria?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
