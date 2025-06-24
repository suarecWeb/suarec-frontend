// components/rate-user-modal.tsx
"use client";

import { useState } from 'react';
import { X, Star, Send, Loader2 } from 'lucide-react';
import StarRating from './star-rating';
import RatingService from '@/services/RatingService';
import { RatingCategory } from '@/interfaces/rating.interface';

interface RateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userToRate: {
    id: number;
    name: string;
    email: string;
    profile_image?: string;
  };
  workContractId?: string;
  category?: RatingCategory;
  onRatingSubmitted?: () => void;
}

export default function RateUserModal({
  isOpen,
  onClose,
  userId,
  userToRate,
  workContractId,
  category = RatingCategory.SERVICE,
  onRatingSubmitted
}: RateUserModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await RatingService.createRating({
        reviewerId: userId,
        revieweeId: userToRate.id,
        stars: rating,
        comment: comment.trim() || undefined,
        category,
        workContractId
      });

      onRatingSubmitted?.();
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la calificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  const getCategoryText = () => {
    switch (category) {
      case RatingCategory.SERVICE:
        return 'como proveedor de servicio';
      case RatingCategory.EMPLOYER:
        return 'como empleador';
      case RatingCategory.EMPLOYEE:
        return 'como empleado';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto modal-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Calificar Usuario
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
              {userToRate.profile_image ? (
                <img 
                  src={userToRate.profile_image} 
                  alt={userToRate.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-[#097EEC] font-medium text-lg">
                  {userToRate.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{userToRate.name}</h4>
              <p className="text-sm text-gray-500">
                Calificar {getCategoryText()}
              </p>
            </div>
          </div>

          {/* Rating Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cómo calificarías tu experiencia? *
            </label>
            <div className="flex justify-center">
              <StarRating
                rating={rating}
                readonly={false}
                size="lg"
                onRatingChange={setRating}
                showValue={true}
              />
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte tu experiencia..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Calificación
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}