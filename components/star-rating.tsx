// components/star-rating.tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  onRatingChange,
  readonly = false,
  size = "md",
  showValue = false,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [currentRating, setCurrentRating] = useState<number>(rating);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = (starRating: number) => {
    if (readonly) return;

    setCurrentRating(starRating);
    if (onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (readonly) return;
    setHoverRating(starRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const getStarColor = (starIndex: number) => {
    const effectiveRating = hoverRating || currentRating;

    if (starIndex <= effectiveRating) {
      return "text-yellow-400 fill-current";
    }
    return "text-gray-300";
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <button
            key={starIndex}
            type="button"
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
              transition-transform duration-150 focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:ring-offset-1 rounded
              ${readonly ? "" : "hover:opacity-80"}
            `}
            aria-label={`${starIndex} ${starIndex === 1 ? "estrella" : "estrellas"}`}
          >
            <Star
              className={`
                ${sizeClasses[size]} 
                ${getStarColor(starIndex)}
                transition-colors duration-150
              `}
            />
          </button>
        ))}
      </div>

      {showValue && (
        <span className="ml-2 text-sm text-gray-600 font-medium">
          {(hoverRating || currentRating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
