"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { GalleryService, GalleryImage } from '@/services/gallery.service';
import { ImageUpload } from './ImageUpload';
import { ImageGallery } from "./ImageGallery";

interface UserGalleryProps {
  userId: number;
  className?: string;
  onImagesSelected?: (selectedImages: string[]) => void;
  maxSelection?: number;
  showSelection?: boolean;
}

export function UserGallery({
  userId,
  className = "",
  onImagesSelected,
  maxSelection = 5,
  showSelection = false,
}: UserGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadGallery();
  }, [userId]);

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const galleryImages = await GalleryService.getUserGallery();
      setImages(galleryImages);
    } catch (error) {
      console.error("Error loading gallery:", error);
      setError("Error al cargar la galería");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagesUploaded = async (
    results: { url: string; path: string }[],
  ) => {
    try {
      setIsUploading(true);
      setError(null);

      const uploadData = {
        image_urls: results.map((r) => r.url),
        image_paths: results.map((r) => r.path),
      };

      const newImages =
        await GalleryService.uploadMultipleImagesToUserGallery(uploadData);
      setImages([...images, ...newImages]);
      setShowUpload(false);
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Error al subir las imágenes");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    try {
      await GalleryService.deleteUserGalleryImage(imageId);
      setImages(images.filter((img) => img.id !== imageId));
      // También remover de seleccionados si estaba seleccionada
      const imageToDelete = images.find((img) => img.id === imageId);
      if (imageToDelete) {
        setSelectedImages(
          selectedImages.filter((url) => url !== imageToDelete.image_url),
        );
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Error al eliminar la imagen");
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (!showSelection) return;

    setSelectedImages((prev) => {
      if (prev.includes(imageUrl)) {
        // Deseleccionar
        const newSelection = prev.filter((url) => url !== imageUrl);
        onImagesSelected?.(newSelection);
        return newSelection;
      } else {
        // Seleccionar (verificar límite)
        if (prev.length >= maxSelection) {
          setError(`Puedes seleccionar máximo ${maxSelection} imágenes`);
          return prev;
        }
        const newSelection = [...prev, imageUrl];
        onImagesSelected?.(newSelection);
        return newSelection;
      }
    });
    setError(null);
  };

  const handleImageDeselect = (imageUrl: string) => {
    setSelectedImages((prev) => {
      const newSelection = prev.filter((url) => url !== imageUrl);
      onImagesSelected?.(newSelection);
      return newSelection;
    });
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Mi Galería</h3>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Mi Galería</h3>
          <p className="text-sm text-gray-600">
            {images.length}/10 imágenes •{" "}
            {showSelection &&
              `${selectedImages.length}/${maxSelection} seleccionadas`}
          </p>
        </div>

        {images.length < 10 && (
          <Button
            onClick={() => setShowUpload(!showUpload)}
            disabled={isUploading}
            className="flex items-center gap-2 bg-[#097EEC] hover:bg-[#0A6BC7] text-white"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Agregar Fotos
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      )}

      {/* Upload Section */}
      {showUpload && (
        <ImageUpload
          onImagesUploaded={handleImagesUploaded}
          multiple={true}
          maxFiles={10 - images.length}
          folder="user-gallery"
          title="Agregar a mi galería"
          description={`Puedes subir hasta ${10 - images.length} imágenes más`}
        />
      )}

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                showSelection && selectedImages.includes(image.image_url)
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={image.image_url}
                alt={image.description || 'Imagen de galería'}
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {showSelection ? (
                    <Button
                      size="sm"
                      variant={
                        selectedImages.includes(image.image_url)
                          ? "destructive"
                          : "default"
                      }
                      onClick={() => handleImageSelect(image.image_url)}
                      className="text-xs"
                    >
                      {selectedImages.includes(image.image_url)
                        ? "Quitar"
                        : "Seleccionar"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                      className="text-xs"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>

              {/* Badge de seleccionado */}
              {showSelection && selectedImages.includes(image.image_url) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">No tienes imágenes en tu galería</p>
          <p className="text-sm text-gray-500">
            Agrega hasta 10 fotos para usar en tus publicaciones
          </p>
        </div>
      )}

      {/* Selected Images Summary */}
      {showSelection && selectedImages.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">
            Imágenes seleccionadas ({selectedImages.length}/{maxSelection})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="relative">
                <Image
                  src={imageUrl}
                  alt={`Seleccionada ${index + 1}`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded border-2 border-blue-300"
                />
                <button
                  onClick={() => handleImageDeselect(imageUrl)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
