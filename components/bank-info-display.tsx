"use client";

import { BankInfo } from "@/interfaces/bank-info";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface BankInfoDisplayProps {
  bankInfo: BankInfo;
  onEdit?: () => void;
  isOwner: boolean;
  isAdmin?: boolean;
}

export default function BankInfoDisplay({
  bankInfo,
  onEdit,
  isOwner,
  isAdmin = false,
}: BankInfoDisplayProps) {
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const maskAccountNumber = (accountNumber: string) => {
    if (showSensitiveData || isAdmin) return accountNumber;
    if (accountNumber.length <= 4) return accountNumber;
    return "*".repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  const maskDocumentNumber = (documentNumber: string) => {
    if (showSensitiveData || isAdmin) return documentNumber;
    if (documentNumber.length <= 4) return documentNumber;
    return "*".repeat(documentNumber.length - 4) + documentNumber.slice(-4);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Información Bancaria
        </h2>
        <div className="flex gap-2">
          {isOwner && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="text-[#097EEC] hover:text-[#0A6BC7] hover:bg-blue-50"
            >
              {showSensitiveData ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showSensitiveData ? "Ocultar" : "Mostrar"}
            </Button>
          )}
          {isOwner && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Titular */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">
            Titular de la cuenta
          </label>
          <p className="text-gray-900">{bankInfo.accountHolderName}</p>
        </div>

        {/* Documento */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">Documento</label>
          <p className="text-gray-900">
            {bankInfo.documentType}{" "}
            {maskDocumentNumber(bankInfo.documentNumber)}
          </p>
        </div>

        {/* Banco */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">Banco</label>
          <p className="text-gray-900">{bankInfo.bankName}</p>
        </div>

        {/* Tipo de cuenta */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-500">
            Tipo de cuenta
          </label>
          <p className="text-gray-900">
            {bankInfo.accountType === "AHORROS"
              ? "Cuenta de Ahorros"
              : "Cuenta Corriente"}
          </p>
        </div>

        {/* Número de cuenta */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-500">
            Número de cuenta
          </label>
          <p className="text-gray-900 font-mono">
            {maskAccountNumber(bankInfo.accountNumber)}
          </p>
        </div>

        {/* Email de contacto */}
        {bankInfo.contactEmail && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              Email de contacto
            </label>
            <p className="text-gray-900">{bankInfo.contactEmail}</p>
          </div>
        )}

        {/* Teléfono de contacto */}
        {bankInfo.contactPhone && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              Teléfono de contacto
            </label>
            <p className="text-gray-900">{bankInfo.contactPhone}</p>
          </div>
        )}
      </div>

      {/* Información adicional para admins */}
      {isAdmin && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Información del sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Creado:</span>{" "}
              {new Date(bankInfo.created_at).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div>
              <span className="font-medium">Actualizado:</span>{" "}
              {new Date(bankInfo.updated_at).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      )}

      {/* Nota de seguridad */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Esta información es confidencial y solo es
          visible para el propietario de la cuenta y los administradores del
          sistema.
        </p>
      </div>
    </div>
  );
}
