"use client"
import { useState } from 'react';
import { Star, X } from 'lucide-react';
import RatingService, { CreateRatingDto } from '@/services/RatingService';
import toast from 'react-hot-toast';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  contractTitle: string;
  otherUser: {
    id: number;
    name: string;
    profile_image?: string;
  };
  userRole: 'CLIENT' | 'PROVIDER';
  currentUserId: number;
}

export default function RatingModal({
  isOpen,
  onClose,
  contractId,
  contractTitle,
  otherUser,
  userRole,
  currentUserId
}: RatingModalProps) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (starNumber: number) => {
    setStars(starNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stars === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData: CreateRatingDto = {
        reviewerId: currentUserId,
        revieweeId: otherUser.id,
        workContractId: undefined, // No requerimos workContractId
        stars,
        comment: comment.trim() || undefined,
        category: userRole === 'CLIENT' ? 'SERVICE' : 'EMPLOYER'
      };

      await RatingService.createRating(ratingData);
      toast.success('Calificación enviada exitosamente');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar la calificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Calificar usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">Contrato: {contractTitle}</p>
          <p className="text-gray-600 mb-2">
            Calificando a: <span className="font-medium">{otherUser.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Tu rol: {userRole === 'CLIENT' ? 'Cliente' : 'Proveedor'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starNumber) => (
                <button
                  key={starNumber}
                  type="button"
                  onClick={() => handleStarClick(starNumber)}
                  className={`p-1 transition-colors ${
                    starNumber <= stars
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {stars > 0 ? `${stars} estrella${stars > 1 ? 's' : ''}` : 'Selecciona una calificación'}
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors"
              rows={3}
              placeholder="Comparte tu experiencia con este usuario..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || stars === 0}
              className="flex-1 px-4 py-2 bg-[#097EEC] text-white rounded-md hover:bg-[#0A6BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 