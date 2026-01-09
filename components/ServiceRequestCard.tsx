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
  showApplyButton = true,
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
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-orange-50/20 to-yellow-50/30 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-orange-500/10 to-yellow-500/10 rounded-full -translate-y-14 translate-x-14"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/10 to-green-500/10 rounded-full translate-y-10 -translate-x-10"></div>

      <CardHeader className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
              🎯 {publication.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/40">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">
                {publication.user?.name || "Usuario"}
              </span>
            </div>
          </div>
          <Badge
            className={`${getUrgencyColor(publication.urgency)} px-3 py-1.5 rounded-xl font-semibold border-2 shadow-sm`}
          >
            {getUrgencyText(publication.urgency)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {publication.description && (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
            <p className="text-gray-700 line-clamp-3 leading-relaxed">
              💭 {publication.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {publication.location && (
            <div className="flex items-center gap-3 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-blue-700">
                📍 {publication.location}
              </span>
            </div>
          )}

          {publication.preferredSchedule && (
            <div className="flex items-center gap-3 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
              <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-green-700">
                ⏰ {publication.preferredSchedule}
              </span>
            </div>
          )}
        </div>

        {publication.requirements && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border-l-4 border-amber-500 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-amber-800">
                📋 Requisitos Especiales
              </span>
            </div>
            <p className="text-sm text-amber-700 leading-relaxed pl-9">
              {publication.requirements}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-blue-50/50 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            {publication.price && (
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-green-200">
                <div className="text-xl font-bold text-green-600">
                  💰 {formatCurrency(publication.price)}
                  {publication.priceUnit && (
                    <span className="text-sm text-gray-500 ml-1 font-normal">
                      /{publication.priceUnit}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-xl font-medium border border-purple-200"
            >
              🏷️ {publication.category}
            </Badge>
          </div>

          <div className="flex gap-3">
            <Link href={`/publications/${publication.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 hover:bg-white border-gray-200 rounded-xl"
              >
                👁️ Ver detalles
              </Button>
            </Link>

            {showApplyButton && onApply && (
              <Button
                size="sm"
                onClick={() => onApply(publication.id!)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                ✨ Aplicar
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
          <Calendar className="w-3 h-3" />
          <span>
            📅 Publicado el{" "}
            {new Date(publication.created_at).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
