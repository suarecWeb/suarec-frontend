'use client'

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  MapPin,
  Clock,
  DollarSign,
  User,
  Building2,
  Star,
  Send,
  Briefcase,
  Calendar,
  Eye,
  Tag,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Publication } from '@/interfaces/publication.interface';
import { translatePriceUnit } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatCurrency';
import StartChatButton from './start-chat-button';

interface PublicationFeedCardProps {
  publication: Publication;
  userRole?: string;
  publicationBids?: { contracts: any[], totalBids: number };
}

const PublicationFeedCard = ({ publication, userRole, publicationBids }: PublicationFeedCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {publication.user?.cv_url ? (
              <Image
                src={publication.user.cv_url}
                alt={publication.user.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-[#097EEC] rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">
              {publication.user?.name || 'Usuario'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tag className="h-3 w-3" />
              <span>{publication.category}</span>
              <Calendar className="h-3 w-3 ml-2" />
              <span>{formatDate(publication.created_at)}</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* NUEVO LAYOUT: Imagen a la izquierda, contenido a la derecha */}
      <div className="flex gap-4">
        {/* Imagen cuadrada a la izquierda */}
        <div className="flex-shrink-0">
          {publication.image_url ? (
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={publication.image_url}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <Building2 className="h-8 w-8 mx-auto mb-1" />
                <p className="text-xs">Sin imagen</p>
              </div>
            </div>
          )}
        </div>

        {/* Contenido principal a la derecha */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {publication.title}
          </h2>

          <div className="flex items-center gap-2 mb-2">
            {/* <DollarSign className="h-4 w-4 text-green-600" /> */}
            <span className="text-green-700 font-semibold text-base">
              {publication.price ? `${formatCurrency(publication.price.toLocaleString(), {
                showCurrency: true,
              })} ${translatePriceUnit(publication.priceUnit || '')}` : 'Precio a convenir'}
            </span>
          </div>

          {publication.description && (
            <p className="text-gray-700 text-sm mb-3" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {publication.description}
            </p>
          )}

          {/* Información de ofertas activas */}
          {publicationBids && publicationBids.totalBids > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
              <div className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium text-xs">
                  {publicationBids.totalBids} oferta{publicationBids.totalBids > 1 ? 's' : ''} activa{publicationBids.totalBids > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Link href={`/publications/${publication.id}`}>
              <Button size="sm" className="bg-[#097EEC] hover:bg-[#097EEC]/90 text-xs px-3 py-1">
                Ver más
              </Button>
            </Link>
            {/* <Button
              variant="outline"
              size="sm"
              className="border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white text-xs px-3 py-1"
            >
              <Send className="h-3 w-3 mr-1" />
              Mensaje
            </Button> */}
            <StartChatButton
              recipientId={parseInt(publication.user?.id || '0')}
              recipientName={publication.user?.name || ''}
              className="flex-shrink-0 text-sm"
              variant='outline'
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{publication.comments?.length || 0}</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors">
          <Share2 className="h-4 w-4" />
          <span>Compartir</span>
        </button>
      </div>

      {/* Comments Section (Collapsible) */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="space-y-3">
            {publication.comments && publication.comments.length > 0 ? (
              publication.comments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user?.name || 'Usuario'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {comment.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No hay comentarios aún.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationFeedCard; 