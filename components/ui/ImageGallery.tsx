"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { X, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { getPublicUrl } from "@/lib/utils";

interface GalleryImage {
  id: number;
  image_url: string;
  image_path: string;
  description?: string;
  order_index: number;
  created_at: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  onDelete?: (imageId: number) => void;
  onEdit?: (imageId: number, description: string) => void;
  onReorder?: (imageIds: number[]) => void;
  maxImages?: number;
  className?: string;
  title?: string;
  showActions?: boolean;
}

export function ImageGallery({
  images,
  onDelete,
  onEdit,
  onReorder,
  maxImages = 20,
  className = "",
  title = "Galería de Imágenes",
  showActions = true,
}: ImageGalleryProps) {
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [editingImage, setEditingImage] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");

  const handleImageClick = (imageId: number) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter((id) => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  const handleDelete = (imageId: number) => {
    if (onDelete) {
      onDelete(imageId);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image.id);
    setEditDescription(image.description || "");
  };

  const handleSaveEdit = () => {
    if (editingImage && onEdit) {
      onEdit(editingImage, editDescription);
      setEditingImage(null);
      setEditDescription("");
    }
  };

  const handleCancelEdit = () => {
    setEditingImage(null);
    setEditDescription("");
  };

  const handleReorder = () => {
    if (onReorder && selectedImages.length > 1) {
      onReorder(selectedImages);
      setSelectedImages([]);
    }
  };

  if (images.length === 0) {
    return (
      <div className={`border rounded-lg p-6 text-center ${className}`}>
        <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">No hay imágenes en la galería</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            {images.length} de {maxImages} imágenes
          </span>
          {selectedImages.length > 0 && (
            <span className="text-blue-600">
              • {selectedImages.length} seleccionada
              {selectedImages.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {selectedImages.length > 1 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedImages.length} imágenes seleccionadas
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleReorder}>
                Reordenar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedImages([])}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative group border rounded-lg overflow-hidden ${
              selectedImages.includes(image.id)
                ? "ring-2 ring-blue-500 border-blue-500"
                : "border-gray-200"
            }`}
          >
            <div className="aspect-square">
              <img
                src={getPublicUrl(image.image_path)}
                alt={image.description || `Imagen ${image.id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
            </div>

            {showActions && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleImageClick(image.id)}
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    {selectedImages.includes(image.id)
                      ? "Deseleccionar"
                      : "Seleccionar"}
                  </Button>

                  {onEdit && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(image)}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {image.description && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2">
                {image.description}
              </div>
            )}

            {editingImage === image.id && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center p-4">
                <div className="w-full space-y-3">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Descripción de la imagen..."
                    className="w-full p-2 border rounded text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="flex-1"
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
