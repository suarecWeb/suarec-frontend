"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { GalleryService, GalleryImage } from "@/services/gallery.service";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";

interface GallerySectionProps {
  isCompany?: boolean;
  className?: string;
}

export function GallerySection({
  isCompany = false,
  className = "",
}: GallerySectionProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const loadGallery = useCallback(async () => {
    try {
      setIsLoading(true);
      const galleryImages = isCompany
        ? await GalleryService.getCompanyGallery()
        : await GalleryService.getUserGallery();
      setImages(galleryImages);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isCompany]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleImagesUploaded = async (
    results: { url: string; path: string }[],
  ) => {
    try {
      setIsUploading(true);

      const uploadData = {
        image_urls: results.map((r) => r.url),
        image_paths: results.map((r) => r.path),
      };

      const newImages = isCompany
        ? await GalleryService.uploadMultipleImagesToCompanyGallery(uploadData)
        : await GalleryService.uploadMultipleImagesToUserGallery(uploadData);

      setImages([...images, ...newImages]);
      setShowUpload(false);
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      if (isCompany) {
        await GalleryService.deleteCompanyGalleryImage(imageId);
      } else {
        await GalleryService.deleteUserGalleryImage(imageId);
      }

      setImages(images.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleEditImage = async (imageId: number, description: string) => {
    try {
      const updateData = { description };
      const updatedImage = isCompany
        ? await GalleryService.updateCompanyGalleryImage(imageId, updateData)
        : await GalleryService.updateUserGalleryImage(imageId, updateData);

      setImages(images.map((img) => (img.id === imageId ? updatedImage : img)));
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

  const handleReorderImages = async (imageIds: number[]) => {
    try {
      const reorderedImages = isCompany
        ? await GalleryService.reorderCompanyGalleryImages(imageIds)
        : await GalleryService.reorderUserGalleryImages(imageIds);

      setImages(reorderedImages);
    } catch (error) {
      console.error("Error reordering images:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando galería...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Galería de Fotos</h2>
        {images.length < 20 && (
          <Button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Fotos
          </Button>
        )}
      </div>

      {showUpload && (
        <div className="mb-6">
          <ImageUpload
            onImagesUploaded={handleImagesUploaded}
            multiple={true}
            maxFiles={20 - images.length}
            folder={isCompany ? "company-gallery" : "gallery-images"}
            title="Subir Fotos a la Galería"
            description={`Puedes subir hasta ${20 - images.length} foto${20 - images.length > 1 ? "s" : ""} más`}
            className="mb-4"
          />
          {isUploading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="ml-2 text-blue-600">Subiendo imágenes...</span>
            </div>
          )}
        </div>
      )}

      <ImageGallery
        images={images}
        onDelete={handleDeleteImage}
        onEdit={handleEditImage}
        onReorder={handleReorderImages}
        maxImages={20}
        title="Mis Fotos"
        showActions={true}
      />

      {images.length >= 20 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Has alcanzado el límite de 20 imágenes en tu galería. Elimina
            algunas fotos para poder agregar más.
          </p>
        </div>
      )}
    </div>
  );
}
