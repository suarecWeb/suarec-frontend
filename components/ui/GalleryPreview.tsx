import React from 'react';
import Image from 'next/image';
import { Building2 } from 'lucide-react';

interface GalleryPreviewProps {
  images: string[];
  title?: string;
  maxDisplay?: number;
  className?: string;
  showTitle?: boolean;
}

const GalleryPreview: React.FC<GalleryPreviewProps> = ({
  images,
  title,
  maxDisplay = 6,
  className = '',
  showTitle = false
}) => {
  if (!images || images.length === 0) {
    return null;
  }

  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  return (
    <div className={className}>
      {showTitle && title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      )}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
        {displayImages.map((imageUrl, index) => (
          <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
            <Image
              src={imageUrl}
              alt={`${title || 'Imagen'} ${index + 1}`}
              width={200}
              height={200}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="aspect-square bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <span className="text-lg font-bold text-gray-500">+{remainingCount}</span>
              <p className="text-xs text-gray-500">más</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPreview; 