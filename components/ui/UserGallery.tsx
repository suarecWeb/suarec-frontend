"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { GalleryService, GalleryImage } from "@/services/gallery.service";
import { ImageUpload } from "./ImageUpload";
import { ImageGallery } from "./ImageGallery";
import toast from "react-hot-toast";
import { IconCancel } from "@tabler/icons-react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface UserGalleryProps {
  userId: number;
  className?: string;
  onImagesSelected?: (selectedImages: string[]) => void;
  maxSelection?: number;
  showSelection?: boolean;
  isVisit?: boolean;
}

export function UserGallery({
  userId,
  className = "",
  onImagesSelected,
  maxSelection = 5,
  showSelection = false,
  isVisit = false,
}: UserGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    if (isVisit) {
      loadGalleryVisit();
    } else {
      loadGallery();
    }
  }, [userId]);

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const galleryImages = await GalleryService.getUserGallery();
      setImages(galleryImages);
    } catch (error) {
      toast.error("Error al cargar la galería");
    } finally {
      setIsLoading(false);
    }
  };

  const loadGalleryVisit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const galleryImages = await GalleryService.getUserGalleryVisit(
        userId.toString(),
      );
      setImages(galleryImages);
    } catch (error) {
      toast.error("Error al cargar la galería");
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
      toast.error("Error al subir las imágenes");
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
      toast.error("Error al eliminar la imagen");
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
          toast.error(`Puedes seleccionar máximo ${maxSelection} imágenes`);
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
          <h3 className="text-lg font-semibold">
            {!isVisit ? "Mi Galería" : "Galería de Imágenes"}
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-800">
            {!isVisit ? "Mi Galería" : "Galería de Imágenes"}
          </h3>
          <p className="text-sm text-gray-600">
            {images.length}/10 imágenes •{" "}
            {showSelection &&
              `${selectedImages.length}/${maxSelection} seleccionadas`}
          </p>
        </div>
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
          {/* Botón + funcional cuando hay imágenes */}
          {images.length < 10 && !isVisit && (
            <div className="aspect-square flex items-center justify-center">
              <button
                onClick={() => setShowUpload(!showUpload)}
                disabled={isUploading}
                className="group relative w-16 h-16 bg-white/85 backdrop-blur-md rounded-full border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:rotate-1 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                <div className="relative z-10">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#097EEC]" />
                  ) : (
                    <Plus className="h-6 w-6 text-[#097EEC] group-hover:scale-110 transition-transform duration-300" />
                  )}
                </div>
              </button>
            </div>
          )}
          {images.map((image) => (
            <div
              key={image.id}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                showSelection && selectedImages.includes(image.image_url)
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Zoom>
                <Image
                  src={image.image_url}
                  alt={image.description || "Imagen de galería"}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </Zoom>

              {!isVisit && (
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
                    ) : !isVisit ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-xs"
                      >
                        Eliminar
                      </Button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Badge de seleccionado */}
              {!isVisit &&
                showSelection &&
                selectedImages.includes(image.image_url) && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <button
            onClick={() => !isVisit && setShowUpload(!showUpload)}
            disabled={isUploading || isVisit}
            className={`group relative w-16 h-16 ${!isVisit ? "bg-white/85 backdrop-blur-md hover:shadow-2xl hover:-translate-y-1 hover:rotate-1 cursor-pointer" : "bg-gray-100"} rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 overflow-hidden border border-gray-200/50 shadow-lg`}
          >
            {!isVisit && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
              </>
            )}
            <div className="relative z-10">
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-[#097EEC]" />
              ) : !isVisit ? (
                <Plus className="h-8 w-8 text-[#097EEC] group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <IconCancel className="h-8 w-8 text-gray-400" />
              )}
            </div>
          </button>
          <p className="text-gray-600 mb-2">
            {!isVisit
              ? "No tienes imágenes en tu galería"
              : "Este usuario no tiene imágenes en la Galería"}
          </p>
          {!isVisit && (
            <p className="text-sm text-gray-500">
              Agrega hasta 10 fotos para usar en tus publicaciones
            </p>
          )}
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
