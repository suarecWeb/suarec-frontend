"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import {
  Publication,
  PublicationType,
} from "@/interfaces/publication.interface";
import PublicationService from "@/services/PublicationsService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ServiceRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceRequestForm({
  onSuccess,
  onCancel,
}: ServiceRequestFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    priceUnit: "",
    requirements: "",
    location: "",
    urgency: "MEDIUM",
    preferredSchedule: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes estar autenticado para crear una solicitud");
      return;
    }

    setIsLoading(true);

    try {
      const publicationData: Publication = {
        title: formData.title,
        description: formData.description || "",
        category: formData.category.toUpperCase(),
        type: PublicationType.SERVICE_REQUEST,
        image_url: undefined,
        gallery_images: undefined,
        visitors: 0,
        price: formData.price ? parseFloat(formData.price) : undefined,
        priceUnit: undefined,
        userId: user.id,
        created_at: new Date().toISOString(),
        modified_at: new Date(),
        requirements: formData.requirements || "",
        location: formData.location || "",
        urgency: formData.urgency,
        preferredSchedule: formData.preferredSchedule,
      };

      await PublicationService.createPublication(publicationData);
      toast.success("Solicitud de servicio creada exitosamente");
      onSuccess?.();
    } catch (error) {
      console.error("Error creating service request:", error);
      toast.error("Error al crear la solicitud de servicio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-white via-green-50/20 to-blue-50/30 border-0 shadow-2xl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-500/10 to-blue-500/10 rounded-full -translate-y-24 translate-x-24"></div>
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full translate-y-18 -translate-x-18"></div>

      <CardHeader className="relative z-10 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-2xl">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">✨</div>
          <div>
            <h2>Crear Solicitud de Servicio</h2>
            <p className="text-blue-100 text-sm font-normal mt-1">
              Describe lo que necesitas y conecta con profesionales
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📝 Información Básica
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-700"
                >
                  🎯 Título del servicio que necesitas
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Necesito un plomero para arreglar una fuga urgente"
                  required
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-700"
                >
                  💭 Descripción detallada
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe en detalle qué necesitas, cuándo lo necesitas, y cualquier información relevante..."
                  rows={4}
                  required
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Categorización */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🏷️ Categorización y Prioridad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-semibold text-gray-700"
                >
                  📂 Categoría del servicio
                </Label>
                <SimpleSelect
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                  placeholder="Selecciona una categoría"
                >
                  <SimpleSelectItem value="plomeria">
                    🔧 Plomería
                  </SimpleSelectItem>
                  <SimpleSelectItem value="electricidad">
                    ⚡ Electricidad
                  </SimpleSelectItem>
                  <SimpleSelectItem value="carpinteria">
                    🪚 Carpintería
                  </SimpleSelectItem>
                  <SimpleSelectItem value="limpieza">
                    🧽 Limpieza
                  </SimpleSelectItem>
                  <SimpleSelectItem value="jardineria">
                    🌱 Jardinería
                  </SimpleSelectItem>
                  <SimpleSelectItem value="pintura">
                    🎨 Pintura
                  </SimpleSelectItem>
                  <SimpleSelectItem value="albañileria">
                    🧱 Albañilería
                  </SimpleSelectItem>
                  <SimpleSelectItem value="tecnologia">
                    💻 Tecnología
                  </SimpleSelectItem>
                  <SimpleSelectItem value="otros">📋 Otros</SimpleSelectItem>
                </SimpleSelect>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="urgency"
                  className="text-sm font-semibold text-gray-700"
                >
                  ⚡ Nivel de urgencia
                </Label>
                <SimpleSelect
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange("urgency", value)}
                >
                  <SimpleSelectItem value="LOW">
                    🟢 Baja - Tengo tiempo
                  </SimpleSelectItem>
                  <SimpleSelectItem value="MEDIUM">
                    🟡 Media - En unos días
                  </SimpleSelectItem>
                  <SimpleSelectItem value="HIGH">
                    🔴 Alta - Lo antes posible
                  </SimpleSelectItem>
                </SimpleSelect>
              </div>
            </div>
          </div>

          {/* Presupuesto */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              💰 Presupuesto (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-sm font-semibold text-gray-700"
                >
                  💵 Presupuesto estimado
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="Ej: 150000"
                  className="border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priceUnit"
                  className="text-sm font-semibold text-gray-700"
                >
                  📊 Unidad de precio
                </Label>
                <SimpleSelect
                  value={formData.priceUnit}
                  onValueChange={(value) =>
                    handleInputChange("priceUnit", value)
                  }
                  placeholder="¿Cómo quieres pagar?"
                >
                  <SimpleSelectItem value="hour">⏰ Por hora</SimpleSelectItem>
                  <SimpleSelectItem value="project">
                    📦 Por proyecto completo
                  </SimpleSelectItem>
                  <SimpleSelectItem value="day">📅 Por día</SimpleSelectItem>
                  <SimpleSelectItem value="monthly">
                    📆 Mensual
                  </SimpleSelectItem>
                </SimpleSelect>
              </div>
            </div>
          </div>

          {/* Detalles adicionales */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              📍 Detalles Adicionales
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-semibold text-gray-700"
                >
                  🗺️ Ubicación del servicio
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Ej: Bogotá, Chapinero, Zona Rosa"
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="preferredSchedule"
                  className="text-sm font-semibold text-gray-700"
                >
                  ⏰ Horario preferido
                </Label>
                <Input
                  id="preferredSchedule"
                  value={formData.preferredSchedule}
                  onChange={(e) =>
                    handleInputChange("preferredSchedule", e.target.value)
                  }
                  placeholder="Ej: Lunes a viernes por la mañana, fines de semana"
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="requirements"
                  className="text-sm font-semibold text-gray-700"
                >
                  📋 Requisitos específicos
                </Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  placeholder="Ej: Experiencia mínima de 2 años, debe traer herramientas propias, certificaciones específicas..."
                  rows={3}
                  className="border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creando solicitud...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  ✨ Crear Solicitud
                </div>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-200 text-lg"
              >
                ❌ Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
