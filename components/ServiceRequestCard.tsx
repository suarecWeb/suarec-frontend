"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Publication } from "@/interfaces/publication.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import { Calendar, MapPin, Clock, AlertTriangle, User } from "lucide-react";
import Link from "next/link";

interface ServiceRequestCardProps {
  publication: Publication;
  onApply?: (publicationId: string) => void;
  showApplyButton?: boolean;
}

export default function ServiceRequestCard({ 
  publication, 
  onApply, 
  showApplyButton = true 
}: ServiceRequestCardProps) {
  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyText = (urgency?: string) => {
    switch (urgency) {
      case "HIGH":
        return "Urgente";
      case "MEDIUM":
        return "Normal";
      case "LOW":
        return "Flexible";
      default:
        return "No especificada";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {publication.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>{publication.user?.name || "Usuario"}</span>
            </div>
          </div>
          <Badge className={getUrgencyColor(publication.urgency)}>
            {getUrgencyText(publication.urgency)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {publication.description && (
          <p className="text-gray-700 line-clamp-3">
            {publication.description}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {publication.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{publication.location}</span>
            </div>
          )}
          
          {publication.preferredSchedule && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{publication.preferredSchedule}</span>
            </div>
          )}
        </div>

        {publication.requirements && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Requisitos</span>
            </div>
            <p className="text-sm text-blue-700">{publication.requirements}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {publication.price && (
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(publication.price)}
                {publication.priceUnit && (
                  <span className="text-sm text-gray-500 ml-1">
                    /{publication.priceUnit}
                  </span>
                )}
              </div>
            )}
            
            <Badge variant="secondary">
              {publication.category}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Link href={`/publications/${publication.id}`}>
              <Button variant="outline" size="sm">
                Ver detalles
              </Button>
            </Link>
            
            {showApplyButton && onApply && (
              <Button 
                size="sm" 
                onClick={() => onApply(publication.id!)}
              >
                Aplicar
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>
            Publicado el {new Date(publication.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 