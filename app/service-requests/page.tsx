"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import { Publication, PublicationType } from "@/interfaces/publication.interface";
import PublicationService from "@/services/PublicationsService";
import ServiceRequestCard from "@/components/ServiceRequestCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";

export default function ServiceRequestsPage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");

  const categories = [
    { value: "", label: "Todas las categorías" },
    { value: "plomeria", label: "Plomería" },
    { value: "electricidad", label: "Electricidad" },
    { value: "carpinteria", label: "Carpintería" },
    { value: "limpieza", label: "Limpieza" },
    { value: "jardineria", label: "Jardinería" },
    { value: "pintura", label: "Pintura" },
    { value: "albañileria", label: "Albañilería" },
    { value: "tecnologia", label: "Tecnología" },
    { value: "otros", label: "Otros" },
  ];

  const urgencyOptions = [
    { value: "", label: "Todas las urgencias" },
    { value: "HIGH", label: "Urgente" },
    { value: "MEDIUM", label: "Normal" },
    { value: "LOW", label: "Flexible" },
  ];

  const fetchServiceRequests = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await PublicationService.getServiceRequests({
        page,
        limit: 10,
      });

      const data = response.data;
      setPublications(data.data);
      setPagination({
        page: data.meta.page,
        limit: data.meta.limit,
        total: data.meta.total,
        totalPages: data.meta.totalPages,
        hasNextPage: data.meta.hasNextPage,
        hasPrevPage: data.meta.hasPrevPage,
      });
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast.error("Error al cargar las solicitudes de servicios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchServiceRequests(newPage);
  };

  const handleApply = async (publicationId: string) => {
    if (!user) {
      toast.error("Debes estar autenticado para aplicar");
      return;
    }

    try {
      // Aquí deberías implementar la lógica para aplicar a la solicitud
      // Por ahora solo mostramos un mensaje
      toast.success("Aplicación enviada exitosamente");
    } catch (error) {
      console.error("Error applying to service request:", error);
      toast.error("Error al aplicar a la solicitud");
    }
  };

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || pub.category === categoryFilter;
    const matchesUrgency = !urgencyFilter || pub.urgency === urgencyFilter;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Solicitudes de Servicios
          </h1>
          <p className="text-gray-600 mt-2">
            Encuentra trabajos que necesitan ser realizados
          </p>
        </div>
        
        <Link href="/service-requests/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Crear Solicitud
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar solicitudes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <SimpleSelect 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
              placeholder="Categoría"
            >
              {categories.map((category) => (
                <SimpleSelectItem key={category.value} value={category.value}>
                  {category.label}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>
            
            <SimpleSelect 
              value={urgencyFilter} 
              onValueChange={setUrgencyFilter}
              placeholder="Urgencia"
            >
              {urgencyOptions.map((urgency) => (
                <SimpleSelectItem key={urgency.value} value={urgency.value}>
                  {urgency.label}
                </SimpleSelectItem>
              ))}
            </SimpleSelect>
          </div>
        </CardContent>
      </Card>

      {/* Lista de solicitudes */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPublications.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication) => (
              <ServiceRequestCard
                key={publication.id}
                publication={publication}
                onApply={handleApply}
                showApplyButton={user?.id !== publication.userId}
              />
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No se encontraron solicitudes</p>
              <p className="text-sm">
                {searchTerm || categoryFilter || urgencyFilter
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay solicitudes de servicios disponibles en este momento"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 