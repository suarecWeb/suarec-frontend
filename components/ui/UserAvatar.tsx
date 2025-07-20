"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Camera, Loader2 } from 'lucide-react';
import SupabaseService from '@/services/supabase.service';
import { ImageWithFallback } from './ImageWithFallback';

interface UserAvatarProps {
  user: {
    id: number;
    name: string;
    profile_image?: string;
    email?: string;
  };
  size?: "sm" | "md" | "lg" | "xl";
  showUpload?: boolean;
  onImageUploaded?: (imageUrl: string) => void;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export function UserAvatar({
  user,
  size = "md",
  showUpload = false,
  onImageUploaded,
  className = "",
  clickable = false,
  onClick,
}: UserAvatarProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setUploadError("Solo se permiten archivos de imagen");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no debe superar los 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const result = await SupabaseService.uploadImage(file, "profile-images");

      if (result.error) {
        throw new Error(result.error);
      }

      if (onImageUploaded) {
        onImageUploaded(result.url);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setUploadError(error.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar */}
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          bg-gradient-to-br from-blue-500 to-blue-600 
          text-white font-semibold 
          overflow-hidden
          ${clickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
          ${isUploading ? "opacity-50" : ""}
        `}
        onClick={handleClick}
      >
        {user.profile_image ? (
          <ImageWithFallback
            src={user.profile_image}
            alt={`${user.name} avatar`}
            width={96}
            height={96}
            className="w-full h-full object-cover"
            fallbackIcon={<span className="text-white font-semibold">{getInitials(user.name)}</span>}
            fallbackText=""
          />
        ) : (
          <User className={iconSizes[size]} />
        )}
      </div>

      {/* Upload Button */}
      {showUpload && (
        <div className="absolute -bottom-1 -right-1">
          <label className="cursor-pointer">
            <div
              className={`
              ${size === "sm" ? "w-6 h-6" : "w-8 h-8"} 
              bg-blue-600 
              rounded-full 
              flex items-center justify-center 
              text-white 
              hover:bg-blue-700 
              transition-colors
              shadow-lg
            `}
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 max-w-xs z-10">
          {uploadError}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar solo la imagen sin funcionalidad de upload
export function UserAvatarDisplay({
  user,
  size = "md",
  className = "",
  clickable = false,
  onClick,
}: Omit<UserAvatarProps, "showUpload" | "onImageUploaded">) {
  return (
    <UserAvatar
      user={user}
      size={size}
      showUpload={false}
      className={className}
      clickable={clickable}
      onClick={onClick}
    />
  );
}

// Componente para mostrar con funcionalidad de upload
export function UserAvatarEditable({
  user,
  size = "md",
  onImageUploaded,
  className = "",
}: Omit<UserAvatarProps, "showUpload" | "clickable" | "onClick">) {
  return (
    <UserAvatar
      user={user}
      size={size}
      showUpload={true}
      onImageUploaded={onImageUploaded}
      className={className}
    />
  );
}
