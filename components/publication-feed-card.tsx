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
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Publication } from '@/interfaces/publication.interface';

interface PublicationFeedCardProps {
  publication: Publication;
  userRole?: string;
}

const PublicationFeedCard = ({ publication, userRole }: PublicationFeedCardProps) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {publication.user?.cv_url ? (
              <Image
                src={publication.user.cv_url}
                alt={publication.user.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-[#097EEC] rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-eras-bold text-gray-900">
                {publication.user?.name || 'Usuario'}
              </h3>
              {/* Badge según el rol */}
              {publication.user?.roles && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-eras-medium bg-blue-100 text-blue-800">
                  {Array.isArray(publication.user.roles) && publication.user.roles.length > 0 ? (
                    typeof publication.user.roles[0] === 'string' ? 
                      (publication.user.roles[0] === 'PERSON' ? 'Ofrece servicios/productos' : 'Solicita personal/productos') :
                      (publication.user.roles[0].name === 'PERSON' ? 'Ofrece servicios/productos' : 'Solicita personal/productos')
                  ) : 'Usuario'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{publication.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(publication.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h2 className="text-xl font-eras-bold text-gray-900 mb-2">
          {publication.title}
        </h2>
        
        {publication.description && (
          <p className="text-gray-700 leading-relaxed mb-4">
            {publication.description}
          </p>
        )}
        
        {publication.image_url && (
          <div className="mb-4">
            <img 
              src={publication.image_url} 
              alt={publication.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
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
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white"
          >
            <Send className="h-4 w-4" />
            Mensaje
          </Button>
          
          <Link href={`/publications/${publication.id}`}>
            <Button
              size="sm"
              className="bg-[#097EEC] hover:bg-[#097EEC]/90"
            >
              Ver más
            </Button>
          </Link>
        </div>
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
                        <span className="text-sm font-eras-medium text-gray-900">
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
              <p className="text-sm text-gray-500 text-center py-4">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            )}
          </div>
          
          {/* Add Comment */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Escribe un comentario..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#097EEC]/30 focus:border-[#097EEC]"
            />
            <Button size="sm" className="bg-[#097EEC] hover:bg-[#097EEC]/90">
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicationFeedCard; 