// components/rating-modal.tsx
"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle, AlertCircle, User } from "lucide-react";
import StarRating from "./star-rating";
import RatingService, { CreateRatingDto, RatingCategory } from "@/services/RatingService";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  revieweeId: number;
  revieweeName: string;
  reviewerId: number;
  workContractId?: string;
  workContractTitle?: string;
  onRatingSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  revieweeId,
  revieweeName,
  reviewerId,
  workContractId,
  workContractTitle,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [category, setCategory] = useState<RatingCategory>(RatingCategory.SERVICE);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ratingData: CreateRatingDto = {
        reviewerId,
        revieweeId,
        stars: rating,
        comment: comment.trim() || undefined,
        category,
        workContractId: workContractId || undefined,
      };

      await RatingService.createRating(ratingData);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onRatingSubmitted) onRatingSubmitted();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar la calificación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setCategory(RatingCategory.SERVICE);
    setError(null);
    setSuccess(false);
    onClose();
  };

  const getCategoryLabel = (cat: RatingCategory) => {
    switch (cat) {
      case RatingCategory.SERVICE:
        return "Calidad del servicio";
      case RatingCategory.EMPLOYER:
        return "Como empleador";
      case RatingCategory.EMPLOYEE:
        return "Como empleado";
      default:
        return cat;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Calificar Usuario</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="bg-green-50 inline-flex rounded-full p-4 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Calificación enviada!
              </h4>
              <p className="text-gray-600">
                Gracias por tu opinión. Esto ayuda a mejorar la comunidad.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="bg-[#097EEC]/10 rounded-full p-2">
                  <User className="h-5 w-5 text-[#097EEC]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{revieweeName}</p>
                  {workContractTitle && (
                    <p className="text-sm text-gray-500">Trabajo: {workContractTitle}</p>
                  )}
                </div>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de calificación
                </label>
                <div className="space-y-2">
                  {Object.values(RatingCategory).map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={cat}
                        checked={category === cat}
                        onChange={(e) => setCategory(e.target.value as RatingCategory)}
                        className="mr-3 text-[#097EEC] focus:ring-[#097EEC]"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-gray-700">
                        {getCategoryLabel(cat)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tu calificación *
                </label>
                <div className="flex items-center gap-3">
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                    showValue
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  1 = Muy malo, 5 = Excelente
                </p>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Comentario (opcional)
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {comment.length}/500 caracteres
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium text-sm">Error</h4>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#097EEC] hover:bg-[#086fcc] text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingModal;
