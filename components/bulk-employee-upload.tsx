"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import BulkEmployeeService, {
  BulkEmployeeUploadResponse,
} from "@/services/BulkEmployeeService";
import { Button } from "@/components/ui/button";

interface BulkEmployeeUploadProps {
  companyId: string;
  onSuccess?: () => void;
}

export default function BulkEmployeeUpload({
  companyId,
  onSuccess,
}: BulkEmployeeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<BulkEmployeeUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validar tipo de archivo
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("Por favor selecciona un archivo Excel (.xlsx o .xls)");
      return;
    }

    // Validar tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande. El tamaño máximo es 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await BulkEmployeeService.uploadEmployees(companyId, file);
      setUploadResult(result);

      if (result.successful > 0) {
        onSuccess?.();
      }
    } catch (err: any) {
      let errorMessage = "Error al subir el archivo";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      await BulkEmployeeService.downloadTemplate(companyId);
    } catch (err: any) {
      setError("Error al descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearResults = () => {
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <FileSpreadsheet className="h-5 w-5" />
            Carga Masiva de Empleados
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Sube un archivo Excel con la información de tus empleados para
            registrarlos masivamente.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-medium mb-2">
              📋 Instrucciones importantes:
            </p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • <strong>Borra la primera fila de ejemplo</strong> antes de
                agregar tus datos
              </li>
              <li>
                • <strong>Solo necesitas el email</strong> de usuarios que ya
                estén registrados en la plataforma
              </li>
              <li>
                • Si un email no está registrado, el proceso se detendrá y no se
                registrará ninguno
              </li>
              <li>
                • Los usuarios deben registrarse primero en la plataforma antes
                de ser agregados
              </li>
              <li>
                • Los campos position, department y startDate son opcionales
              </li>
            </ul>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Descargar plantilla */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Descargar Plantilla
            </Button>
            <span className="text-sm text-muted-foreground">
              Descarga la plantilla Excel con el formato correcto
            </span>
          </div>

          {/* Área de subida */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isUploading
                ? "Subiendo archivo..."
                : "Arrastra tu archivo Excel aquí o haz clic para seleccionar"}
            </p>
            <p className="text-sm text-muted-foreground">
              Solo archivos .xlsx o .xls (máximo 5MB)
            </p>
            {isUploading && (
              <div className="mt-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            )}
          </div>

          {/* Errores */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Resultados */}
          {uploadResult && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">
                    Resultados de la Carga
                  </h4>
                  <Button variant="ghost" size="sm" onClick={clearResults}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResult.totalProcessed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Procesados
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.successful}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Exitosos
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Con Errores
                    </div>
                  </div>
                </div>

                {/* Empleados creados */}
                {uploadResult.createdEmployees.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Empleados Creados Exitosamente
                    </h4>
                    <div className="space-y-2">
                      {uploadResult.createdEmployees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-2 bg-green-50 rounded"
                        >
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {employee.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errores detallados */}
                {uploadResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Errores Encontrados - Ningún empleado fue registrado
                    </h4>
                    <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-800">
                        <strong>⚠️ Importante:</strong> Debido a errores en los
                        datos, ningún empleado fue registrado. Verifica que
                        todos los emails estén registrados en la plataforma y
                        vuelve a intentar.
                      </p>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 border border-red-200 rounded-md text-sm"
                        >
                          <div className="font-medium text-red-800 mb-1">
                            📍 Fila {error.row} - {error.email}
                          </div>
                          <div className="text-red-600 text-xs">
                            {error.error}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
