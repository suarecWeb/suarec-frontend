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

  // Estados para dropdowns personalizados
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSortByDropdownOpen, setIsSortByDropdownOpen] = useState(false);
  const [isSortOrderDropdownOpen, setIsSortOrderDropdownOpen] = useState(false);

  // Cargar opciones de filtros disponibles
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, typesResponse] = await Promise.all([
          PublicationService.getAvailableCategories(),
          PublicationService.getAvailableTypes(),
        ]);

        // El backend ya devuelve categorías normalizadas y sin duplicados
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

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".dropdown-container")) {
        setIsTypeDropdownOpen(false);
        setIsSortByDropdownOpen(false);
        setIsSortOrderDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFilterChange = (key: keyof PaginationParams, value: any) => {
    // Normalizar categorías para evitar problemas de case sensitivity
    if (key === "category" && value && typeof value === "string") {
      value = value.toUpperCase();
    }
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
    // El campo de búsqueda ya no se cuenta aquí porque está en el navbar
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
            className="w-full justify-between h-10 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-[#097EEC] hover:shadow-md transition-all duration-200"
            disabled={loading}
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-[#097EEC]/10">
                <Filter className="h-3.5 w-3.5 text-[#097EEC]" />
              </div>
              <span className="font-eras-medium text-sm text-gray-900">
                Filtros Avanzados
              </span>
              {activeFiltersCount > 0 && (
                <Badge className="bg-[#097EEC] text-white text-xs px-1.5 py-0.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-blue-200/60 p-3 relative shadow-sm">
            {/* Filtros Principales */}
            <div className="grid grid-cols-1 gap-3 mb-3">
              {/* Tipo de publicación - Custom dropdown */}
              <div>
                <label className="text-xs font-eras-medium text-gray-700 mb-1 block">
                  Tipo
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="h-9 w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-left focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-all outline-none text-xs flex items-center justify-between hover:border-gray-300"
                  >
                    <span
                      className={
                        filters.type ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {filters.type === PublicationType.SERVICE
                        ? "Servicios (Oferta)"
                        : filters.type === PublicationType.SERVICE_REQUEST
                          ? "Solicitudes de Servicios"
                          : filters.type === PublicationType.JOB
                            ? "Empleos"
                            : "Seleccionar tipo"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isTypeDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          handleFilterChange("type", undefined);
                          setIsTypeDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-xs border-b border-gray-100"
                      >
                        <div className="font-medium text-gray-900 text-xs">
                          Todos los tipos
                        </div>
                      </button>
                      {availableTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            handleFilterChange("type", type);
                            setIsTypeDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-xs border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 text-xs">
                            {type === PublicationType.SERVICE &&
                              "Servicios (Oferta)"}
                            {type === PublicationType.SERVICE_REQUEST &&
                              "Solicitudes de Servicios"}
                            {type === PublicationType.JOB && "Empleos"}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

            {/* Ordenamiento - Custom dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-eras-medium text-gray-700 mb-1 block">
                  Ordenar por
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() =>
                      setIsSortByDropdownOpen(!isSortByDropdownOpen)
                    }
                    className="h-9 w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-left focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-all outline-none text-xs flex items-center justify-between hover:border-gray-300"
                  >
                    <span className="text-gray-900">
                      {filters.sortBy === "created_at"
                        ? "Fecha"
                        : filters.sortBy === "modified_at"
                          ? "Modificación"
                          : filters.sortBy === "price"
                            ? "Precio"
                            : filters.sortBy === "visitors"
                              ? "Visitas"
                              : filters.sortBy === "title"
                                ? "Título"
                                : "Fecha"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isSortByDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isSortByDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {[
                        { value: "created_at", label: "Fecha" },
                        { value: "modified_at", label: "Modificación" },
                        { value: "price", label: "Precio" },
                        { value: "visitors", label: "Visitas" },
                        { value: "title", label: "Título" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleFilterChange("sortBy", option.value);
                            setIsSortByDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-xs border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 text-xs">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-eras-medium text-gray-700 mb-1 block">
                  Dirección
                </label>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() =>
                      setIsSortOrderDropdownOpen(!isSortOrderDropdownOpen)
                    }
                    className="h-9 w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-left focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-all outline-none text-xs flex items-center justify-between hover:border-gray-300"
                  >
                    <span className="text-gray-900">
                      {filters.sortOrder === "ASC"
                        ? "Ascendente"
                        : "Descendente"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isSortOrderDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isSortOrderDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {[
                        { value: "DESC", label: "Descendente" },
                        { value: "ASC", label: "Ascendente" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleFilterChange(
                              "sortOrder",
                              option.value as "ASC" | "DESC",
                            );
                            setIsSortOrderDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-xs border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 text-xs">
                            {option.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-2.5 border-t border-gray-100">
              <Button
                onClick={onApplyFilters}
                className="flex-1 h-9 bg-[#097EEC] hover:bg-[#097EEC]/90 text-white font-eras-medium text-xs"
              >
                <Check className="h-3 w-3 mr-1.5" />
                Aplicar
              </Button>
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={activeFiltersCount === 0}
                className="h-9 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50 font-eras-medium text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Limpiar
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
