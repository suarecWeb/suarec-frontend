"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  DollarSign,
  Calendar,
  Tag,
  ChevronDown,
  RotateCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PublicationType } from "@/interfaces/publication.interface";
import PublicationService from "@/services/PublicationsService";
import { toast } from "react-hot-toast";

interface AdvancedFiltersProps {
  filters: PaginationParams;
  onFiltersChange: (filters: PaginationParams) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<PublicationType[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar opciones de filtros disponibles
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, typesResponse] = await Promise.all([
          PublicationService.getAvailableCategories(),
          PublicationService.getAvailableTypes(),
        ]);

        setAvailableCategories(categoriesResponse.data);
        setAvailableTypes(typesResponse.data);
      } catch (error) {
        console.error("Error loading filter options:", error);
        toast.error("Error al cargar opciones de filtros");
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof PaginationParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 }); // Reset to page 1 when filters change
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    handleFilterChange(
      "categories",
      newCategories.length > 0 ? newCategories : undefined,
    );
  };

  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    handleFilterChange("minPrice", min > 0 ? min : undefined);
    handleFilterChange("maxPrice", max < 10000 ? max : undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.category) count++;
    if (filters.categories && filters.categories.length > 0) count++;
    if (filters.search) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.sortBy && filters.sortBy !== "created_at") count++;
    if (filters.sortOrder && filters.sortOrder !== "DESC") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-white hover:bg-gray-50 border-gray-200 hover:border-[#097EEC] transition-all duration-200"
            disabled={loading}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-[#097EEC]/10">
                <Filter className="h-4 w-4 text-[#097EEC]" />
              </div>
              <span className="font-eras-medium text-gray-900">
                Filtros Avanzados
              </span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-[#097EEC] text-white text-xs px-2 py-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-96 overflow-y-auto">
            {/* Búsqueda */}
            <div className="mb-4">
              <label className="text-sm font-eras-medium text-gray-700 mb-2 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Título, descripción o categoría..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    handleFilterChange("search", e.target.value || undefined)
                  }
                  className="pl-10 h-10 border-gray-200 focus:border-[#097EEC] focus:ring-[#097EEC]/20"
                />
              </div>
            </div>

            {/* Filtros Principales */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              {/* Tipo de publicación */}
              <div>
                <label className="text-sm font-eras-medium text-gray-700 mb-1 block">
                  Tipo
                </label>
                <select
                  value={filters.type || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "type",
                      e.target.value === "" ? undefined : e.target.value,
                    )
                  }
                  className="h-10 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-[#097EEC] focus:ring-[#097EEC]/20 focus:outline-none text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === PublicationType.SERVICE && "Servicios (Oferta)"}
                      {type === PublicationType.SERVICE_REQUEST &&
                        "Solicitudes de Servicios"}
                      {type === PublicationType.JOB && "Empleos"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría única */}
              <div>
                <label className="text-sm font-eras-medium text-gray-700 mb-1 block">
                  Categoría
                </label>
                <select
                  value={filters.category || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "category",
                      e.target.value === "" ? undefined : e.target.value,
                    )
                  }
                  className="h-10 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-[#097EEC] focus:ring-[#097EEC]/20 focus:outline-none text-sm"
                >
                  <option value="">Seleccionar categoría</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Categorías Múltiples - Compacto - COMENTADO */}
            {/* <div className="mb-4">
              <label className="text-sm font-eras-medium text-gray-700 mb-2 block">
                Categorías Múltiples
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2 p-1.5 rounded hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories?.includes(category) || false}
                      onCheckedChange={() => handleCategoryToggle(category)}
                      className="border-gray-300 data-[state=checked]:bg-[#097EEC] data-[state=checked]:border-[#097EEC]"
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-xs font-eras text-gray-700 cursor-pointer flex-1 truncate"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Rango de Precios - Compacto - COMENTADO */}
            {/* <div className="mb-4">
              <label className="text-sm font-eras-medium text-gray-700 mb-2 block">
                Rango de Precios
              </label>
              <div className="space-y-2">
                <div className="px-1">
                  <Slider
                    value={[
                      filters.minPrice || 0,
                      filters.maxPrice || 10000
                    ]}
                    onValueChange={handlePriceRangeChange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">${filters.minPrice || 0}</span>
                  <span className="text-gray-600">${filters.maxPrice || 10000}</span>
                </div>
              </div>
            </div> */}

            {/* Ordenamiento - Compacto */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-sm font-eras-medium text-gray-700 mb-1 block">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy || "created_at"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="h-10 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-[#097EEC] focus:ring-[#097EEC]/20 focus:outline-none text-sm"
                >
                  <option value="created_at">Fecha</option>
                  <option value="modified_at">Modificación</option>
                  <option value="price">Precio</option>
                  <option value="visitors">Visitas</option>
                  <option value="title">Título</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-eras-medium text-gray-700 mb-1 block">
                  Dirección
                </label>
                <select
                  value={filters.sortOrder || "DESC"}
                  onChange={(e) =>
                    handleFilterChange(
                      "sortOrder",
                      e.target.value as "ASC" | "DESC",
                    )
                  }
                  className="h-10 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-[#097EEC] focus:ring-[#097EEC]/20 focus:outline-none text-sm"
                >
                  <option value="DESC">Descendente</option>
                  <option value="ASC">Ascendente</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button
                onClick={onApplyFilters}
                className="flex-1 h-10 bg-[#097EEC] hover:bg-[#097EEC]/90 text-white font-eras-medium text-sm"
              >
                <Check className="h-3 w-3 mr-1" />
                Aplicar
              </Button>
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={activeFiltersCount === 0}
                className="h-10 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 font-eras-medium text-sm"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
