"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "../interfaces/auth.interface";
import CreateServiceModal from "./create-service-modal";
import CreateJobOfferModal from "./create-job-offer-modal";
import { Briefcase, Wrench, X } from "lucide-react";

interface PublicationModalManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPublicationCreated?: () => void;
}

export default function PublicationModalManager({
  isOpen,
  onClose,
  onPublicationCreated,
}: PublicationModalManagerProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"service" | "job" | null>(
    null,
  );
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Obtener rol del usuario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const token = Cookies.get("token");
      if (token) {
        try {
          const decoded = jwtDecode<TokenPayload>(token);
          const roles = decoded.roles.map((role) => role.name);
          const primaryRole = roles[0]; // Tomar el primer rol
          setUserRole(primaryRole);

          // Si es BUSINESS, mostrar selector de tipo
          if (primaryRole === "BUSINESS") {
            setShowTypeSelector(true);
            setSelectedType(null);
          } else {
            // Si es PERSON, ir directo a servicio
            setShowTypeSelector(false);
            setSelectedType("service");
          }
        } catch (error) {
          console.error("Error al decodificar token:", error);
          setUserRole(null);
        }
      }
    }
  }, [isOpen]);

  // Función para manejar el cierre del modal
  const handleClose = () => {
    setSelectedType(null);
    setShowTypeSelector(false);
    onClose();
  };

  // Función para manejar selección de tipo
  const handleTypeSelection = (type: "service" | "job") => {
    setSelectedType(type);
    setShowTypeSelector(false);
  };

  // Función para volver al selector
  const handleBackToSelector = () => {
    setSelectedType(null);
    setShowTypeSelector(true);
  };

  if (!isOpen) return null;

  // Mostrar selector de tipo para usuarios Business
  if (showTypeSelector && userRole === "BUSINESS") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="bg-[#097EEC] text-white p-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">¿Qué deseas publicar?</h2>
              <button
                onClick={handleClose}
                className="text-blue-100 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="p-6 space-y-4">
            <button
              onClick={() => handleTypeSelection("job")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#097EEC] hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-[#097EEC] group-hover:text-white transition-colors">
                  <Briefcase className="h-6 w-6 text-[#097EEC] group-hover:text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#097EEC]">
                    Oferta de Empleo
                  </h3>
                  <p className="text-sm text-gray-600">
                    Busca candidatos para una posición en tu empresa
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelection("service")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#097EEC] hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full group-hover:bg-[#097EEC] group-hover:text-white transition-colors">
                  <Wrench className="h-6 w-6 text-green-600 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#097EEC]">
                    Servicio Empresarial
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ofrece un servicio que tu empresa puede proporcionar
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar modal correspondiente según el tipo seleccionado
  if (selectedType === "job") {
    return (
      <CreateJobOfferModal
        isOpen={true}
        onClose={handleClose}
        onPublicationCreated={onPublicationCreated}
      />
    );
  }

  if (selectedType === "service") {
    return (
      <CreateServiceModal
        isOpen={true}
        onClose={handleClose}
        onPublicationCreated={onPublicationCreated}
      />
    );
  }

  // Si no hay tipo seleccionado y no es Business, mostrar modal de servicio por defecto
  return (
    <CreateServiceModal
      isOpen={true}
      onClose={handleClose}
      onPublicationCreated={onPublicationCreated}
    />
  );
}
