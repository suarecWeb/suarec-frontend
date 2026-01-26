"use client";

import React, { useState, useCallback } from "react";
import {
  Shield,
  Check,
  X,
  AlertCircle,
  FileText,
  Upload,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SupabaseService from "@/services/supabase.service";
import toast from "react-hot-toast";

interface SocialSecurityItem {
  id: string;
  title: string;
  description: string;
  question: string;
  completed: boolean;
  required: boolean;
  pdfUrl?: string;
  pdfPath?: string;
  uploading?: boolean;
}

interface SeguroSocialProps {
  className?: string;
}

const SeguroSocial: React.FC<SeguroSocialProps> = ({ className = "" }) => {
  const [items, setItems] = useState<SocialSecurityItem[]>([
    {
      id: "eps",
      title: "Afiliación a EPS",
      description: "Entidad Promotora de Salud",
      question:
        "¿Se encuentra afiliado y al día en el Sistema de Seguridad Social Integral (salud, pensión y riesgos laborales)?",
      completed: false,
      required: true,
    },
    {
      id: "pension",
      title: "Afiliación a fondo de pensiones",
      description: "Fondo de pensiones obligatorias",
      question:
        "¿Se encuentra afiliado y al día en el Sistema de Seguridad Social Integral (salud, pensión y riesgos laborales)?",
      completed: false,
      required: true,
    },
    {
      id: "arl",
      title: "Afiliación a ARL",
      description: "Administradora de Riesgos Laborales",
      question:
        "¿Se encuentra afiliado y al día en el Sistema de Seguridad Social Integral (salud, pensión y riesgos laborales)?",
      completed: false,
      required: true,
    },
    {
      id: "aportes",
      title: "Aportes al día",
      description: "Aportes de seguridad social actualizados",
      question:
        "¿Se encuentra afiliado y al día en el Sistema de Seguridad Social Integral (salud, pensión y riesgos laborales)?",
      completed: false,
      required: true,
    },
  ]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(id)) {
        newExpanded.delete(id);
      } else {
        newExpanded.add(id);
      }
      return newExpanded;
    });
  }, []);

  const handleFileUpload = useCallback(async (id: string, file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Solo se permiten archivos PDF");
      return;
    }

    // Update uploading state
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, uploading: true } : item,
      ),
    );

    try {
      const result = await SupabaseService.uploadImage(
        file,
        "social-security-docs",
      );

      if (result.error) {
        throw new Error(result.error);
      }

      // Update item with PDF info and mark as completed
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                completed: true,
                pdfUrl: result.url,
                pdfPath: result.path,
                uploading: false,
              }
            : item,
        ),
      );

      toast.success("Documento subido correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al subir el documento");
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, uploading: false } : item,
        ),
      );
    }
  }, []);

  const handleFileInputChange = useCallback(
    (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(id, file);
      }
    },
    [handleFileUpload],
  );

  const removeDocument = useCallback(async (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.pdfPath) {
        SupabaseService.deleteImage(item.pdfPath).catch((error) => {
          console.error("Error deleting file:", error);
        });
      }

      return prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: false,
              pdfUrl: undefined,
              pdfPath: undefined,
            }
          : item,
      );
    });

    toast.success("Documento eliminado");
  }, []);

  const completedItems = items.filter((item) => item.completed).length;
  const requiredItems = items.filter((item) => item.required).length;
  const completedRequiredItems = items.filter(
    (item) => item.required && item.completed,
  ).length;
  const progressPercentage = (completedItems / items.length) * 100;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Shield className="h-6 w-6 text-[#097EEC]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-eras-bold text-gray-900">
            Sistema de Seguridad Social Integral
          </h3>
          <p className="text-sm text-gray-600 font-eras">
            Completa tu documentación de seguridad social colombiana
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-eras-medium text-gray-700">
            Progreso: {completedItems} de {items.length} documentos
          </span>
          <span className="text-sm font-eras-medium text-[#097EEC]">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#097EEC] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {completedRequiredItems < requiredItems && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-600 font-eras">
              {requiredItems - completedRequiredItems} documentos requeridos
              pendientes
            </span>
          </div>
        )}
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg transition-all duration-200 ${
              item.completed
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            {/* Main Item Header */}
            <div className="flex items-center gap-4 p-4">
              {/* Checkbox */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  item.completed
                    ? "bg-[#097EEC] border-[#097EEC]"
                    : "border-gray-300"
                }`}
              >
                {item.completed && <Check className="h-4 w-4 text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-eras-semibold text-gray-900 text-sm">
                    {item.title}
                  </h4>
                  {item.required && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-eras-medium">
                      Requerido
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 font-eras">
                  {item.description}
                </p>
              </div>

              {/* Expand Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpanded(item.id)}
                className="flex-shrink-0"
              >
                {expandedItems.has(item.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Expanded Content */}
            {expandedItems.has(item.id) && (
              <div className="px-4 pb-4 border-t border-gray-200/50">
                <div className="pt-4">
                  <p className="text-sm text-gray-700 font-eras-medium mb-4">
                    {item.question}
                  </p>

                  {/* File Upload Section */}
                  <div className="space-y-3">
                    {!item.completed ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#097EEC] transition-colors">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileInputChange(item.id, e)}
                          className="hidden"
                          id={`file-${item.id}`}
                          disabled={item.uploading}
                        />
                        <label
                          htmlFor={`file-${item.id}`}
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              {item.uploading
                                ? "Subiendo..."
                                : "Subir documento PDF"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Solo archivos PDF (máx. 10MB)
                            </p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[#097EEC]" />
                            <div>
                              <p className="text-sm font-eras-medium text-blue-800">
                                Documento subido correctamente
                              </p>
                              <p className="text-xs text-blue-600">
                                PDF verificado y almacenado
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.pdfUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(item.pdfUrl, "_blank")
                                }
                                className="text-[#097EEC] border-blue-300 hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeDocument(item.id)}
                              className="text-gray-600 border-gray-300 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Message */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertCircle className="h-4 w-4 text-[#097EEC]" />
          <p className="font-eras">
            Los cambios se guardarán cuando hagas clic en GUARDAR CAMBIOS en la
            parte inferior de la página.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeguroSocial;
