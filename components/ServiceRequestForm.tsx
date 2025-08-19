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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Solicitud de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del servicio que necesitas</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ej: Necesito un plomero para arreglar una fuga"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción detallada</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe en detalle qué necesitas..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <SimpleSelect
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                placeholder="Selecciona una categoría"
              >
                <SimpleSelectItem value="plomeria">Plomería</SimpleSelectItem>
                <SimpleSelectItem value="electricidad">
                  Electricidad
                </SimpleSelectItem>
                <SimpleSelectItem value="carpinteria">
                  Carpintería
                </SimpleSelectItem>
                <SimpleSelectItem value="limpieza">Limpieza</SimpleSelectItem>
                <SimpleSelectItem value="jardineria">
                  Jardinería
                </SimpleSelectItem>
                <SimpleSelectItem value="pintura">Pintura</SimpleSelectItem>
                <SimpleSelectItem value="albañileria">
                  Albañilería
                </SimpleSelectItem>
                <SimpleSelectItem value="tecnologia">
                  Tecnología
                </SimpleSelectItem>
                <SimpleSelectItem value="otros">Otros</SimpleSelectItem>
              </SimpleSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgencia</Label>
              <SimpleSelect
                value={formData.urgency}
                onValueChange={(value) => handleInputChange("urgency", value)}
              >
                <SimpleSelectItem value="LOW">Baja</SimpleSelectItem>
                <SimpleSelectItem value="MEDIUM">Media</SimpleSelectItem>
                <SimpleSelectItem value="HIGH">Alta</SimpleSelectItem>
              </SimpleSelect>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Presupuesto (opcional)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceUnit">Unidad de precio</Label>
              <SimpleSelect
                value={formData.priceUnit}
                onValueChange={(value) => handleInputChange("priceUnit", value)}
                placeholder="Selecciona unidad"
              >
                <SimpleSelectItem value="hour">Por hora</SimpleSelectItem>
                <SimpleSelectItem value="project">
                  Por proyecto
                </SimpleSelectItem>
                <SimpleSelectItem value="day">Por día</SimpleSelectItem>
                <SimpleSelectItem value="monthly">Mensual</SimpleSelectItem>
              </SimpleSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Ciudad, barrio o dirección aproximada"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredSchedule">Horario preferido</Label>
            <Input
              id="preferredSchedule"
              value={formData.preferredSchedule}
              onChange={(e) =>
                handleInputChange("preferredSchedule", e.target.value)
              }
              placeholder="Ej: Lunes a viernes por la mañana"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requisitos específicos</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) =>
                handleInputChange("requirements", e.target.value)
              }
              placeholder="Experiencia requerida, herramientas necesarias, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creando..." : "Crear Solicitud"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
