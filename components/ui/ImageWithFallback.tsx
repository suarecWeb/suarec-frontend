import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackIcon,
  fallbackText = "Imagen no disponible",
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}
        style={{ width, height }}
      >
        {fallbackIcon || <ImageIcon className="w-8 h-8" />}
        <span className="text-xs ml-2">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100"}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}
