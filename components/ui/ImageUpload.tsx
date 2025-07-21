"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "./button";
import { Input } from "./input";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import SupabaseService from "@/services/supabase.service";

interface ImageUploadProps {
  onImagesUploaded: (results: { url: string; path: string }[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  className?: string;
  title?: string;
  description?: string;
}

export function ImageUpload({
  onImagesUploaded,
  multiple = false,
  maxFiles = 1,
  folder = "profile-images",
  className = "",
  title = "Subir Imágenes",
  description = "Selecciona una o más imágenes para subir",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // Validar número máximo de archivos
    if (files.length > maxFiles) {
      setError(
        `Puedes subir máximo ${maxFiles} archivo${maxFiles > 1 ? "s" : ""}`,
      );
      return;
    }

    // Validar tipos de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      setError("Solo se permiten archivos JPG, PNG y WebP");
      return;
    }

    // Validar tamaño (máximo 5MB por archivo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError("Cada archivo debe tener un tamaño máximo de 5MB");
      return;
    }

    setError(null);

    // Crear previews
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Subir archivos
    uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const results = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await SupabaseService.uploadImage(file, folder);

        if (result.error) {
          throw new Error(result.error);
        }

        results.push({ url: result.url, path: result.path });
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      onImagesUploaded(results);
      setPreviewUrls([]);

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      setError(error.message || "Error al subir las imágenes");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removePreview = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);

    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        input.files = event.dataTransfer.files as any;
        handleFileSelect({
          target: { files: event.dataTransfer.files },
        } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className={`border rounded-lg p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-4">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />

          <div>
            <p className="text-sm text-gray-600">
              Arrastra y suelta imágenes aquí, o{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-500 font-medium"
                disabled={isUploading}
              >
                haz clic para seleccionar
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WebP hasta 5MB cada uno
              {multiple && maxFiles > 1 && ` • Máximo ${maxFiles} archivos`}
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Vista previa:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
