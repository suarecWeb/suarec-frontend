/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PublicationService from "@/services/PublicationsService";
import { UserService } from "@/services/UsersService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Edit,
  Trash2,
  Share2,
  ChevronRight,
  Eye,
  Tag,
  Building2,
  Send,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/interfaces/publication.interface";
import { TokenPayload } from "@/interfaces/auth.interface";
import { User } from "@/interfaces/user.interface";
import { Comment } from "@/interfaces/comment.interface";
import CommentService from "@/services/CommentsService";

const PublicationDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchPublicationDetails = async () => {
      try {
        setIsLoading(true);
        
        if (!params.id) {
          setError("ID de publicación no encontrado");
          setIsLoading(false);
          return;
        }

        // Obtener el token y decodificarlo
        const token = Cookies.get("token");
        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);
          setCurrentUserId(decoded.id);
          setUserRoles(decoded.roles.map(role => role.name));
        }
        
        // Obtener detalles de la publicación
        const publicationId = Array.isArray(params.id) ? params.id[0] : params.id;
        const response = await PublicationService.getPublicationById(publicationId);
        const publicationData = response.data;
        
        setPublication(publicationData);
        
        // Obtener información del autor
        if (publicationData.userId) {
          const authorResponse = await UserService.getUserById(publicationData.userId);
          setAuthor(authorResponse.data);
        }
        
        // Obtener comentarios
        if (publicationData.comments) {
          setComments(publicationData.comments);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error al cargar los detalles de la publicación:", err);
        setError("No se pudo cargar la publicación");
        setIsLoading(false);
      }
    };

    fetchPublicationDetails();
  }, [params.id]);

  const handleDeletePublication = async () => {
    if (!publication?.id) return;
    
    try {
      await PublicationService.deletePublication(publication.id);
      router.push("/publications");
    } catch (err) {
      console.error("Error al eliminar la publicación:", err);
      setError("No se pudo eliminar la publicación");
    }
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEditPublication = () => {
    if (!publication || !currentUserId) return false;
    return publication.userId === currentUserId || userRoles.includes("ADMIN");
  };

  // Función para compartir la publicación
  const handleShare = () => {
    if (navigator.share && window) {
      navigator.share({
        title: publication?.title || "Publicación en SUAREC",
        text: publication?.description || "Mira esta publicación en SUAREC",
        url: window.location.href,
      })
        .catch((error) => console.log("Error al compartir:", error));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Enlace copiado al portapapeles"))
        .catch((error) => console.error("Error al copiar enlace:", error));
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUserId || !publication?.id) return;
    
    setIsSubmittingComment(true);
    
    try {
      // Crear el objeto de comentario según el DTO del backend
      const commentData = {
        description: commentText,
        created_at: new Date(),
        publicationId: publication.id,
        userId: currentUserId,
      };
      
      // Llamar al servicio para crear el comentario
      const response = await CommentService.createComment(commentData);
      const newComment = response.data;
      
      // Para la UI, creamos un objeto de comentario con la información mínima necesaria
      const commentForUI = {
        ...newComment,
        user: {
          id: currentUserId,
          name: "Tú", // Esto se actualizará al recargar la página
        }
      };
      
      // Actualizar la interfaz con el nuevo comentario
      setComments([commentForUI, ...comments]);
      setCommentText("");
      
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      setError("No se pudo enviar el comentario. Inténtalo de nuevo.");
      // Mostrar el error por 3 segundos
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Detalles de Publicación</h1>
            <p className="mt-2 text-blue-100">
              Información completa sobre la publicación
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
                <Link href="/publications" className="text-red-600 hover:underline mt-2 inline-block">
                  <ArrowLeft className="h-4 w-4 inline mr-1" />
                  Volver a publicaciones
                </Link>
              </div>
            </div>
          )}

          {/* Confirm delete modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">¿Confirmar eliminación?</h3>
                <p className="text-gray-600 mb-6">
                  Esta acción eliminará permanentemente la publicación "{publication?.title}" y no podrá ser recuperada.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletePublication}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Navigation breadcrumbs */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Link href="/" className="hover:text-[#097EEC] transition-colors">
                  Inicio
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href="/publications" className="hover:text-[#097EEC] transition-colors">
                  Publicaciones
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-gray-800 font-medium">Detalles</span>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-64 w-full" />
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <Skeleton className="h-32 w-full" />
                    </div>
                    <div>
                      <Skeleton className="h-48 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              publication && (
                <>
                  {/* Publication Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{publication.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Publicado el {formatDate(publication.created_at)}
                          </span>
                          <span className="inline-flex items-center text-sm text-gray-500">
                            <Eye className="h-4 w-4 mr-1" />
                            {publication.visitors || 0} visitas
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-[#097EEC] rounded-full text-xs font-medium">
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            {publication.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleShare}
                          className="p-2 text-gray-500 hover:text-[#097EEC] hover:bg-blue-50 rounded-full transition-colors"
                          aria-label="Compartir"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                        
                        {canEditPublication() && (
                          <>
                            <Link href={`/publications/${publication.id}/edit`}>
                              <button
                                className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                                aria-label="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="grid md:grid-cols-3 gap-6 p-6">
                    {/* Left column - Publication details */}
                    <div className="md:col-span-2 space-y-6">
                      {/* Publication image */}
                      {publication.image_url && (
                        <div className="rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                          <img
                            src={publication.image_url}
                            alt={publication.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Publication description */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Descripción</h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line">
                            {publication.description || "No hay descripción disponible."}
                          </p>
                        </div>
                      </div>

                      {/* Comments section placeholder */}
                      <div className="border-t border-gray-200 pt-6 mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#097EEC]" />
                          Comentarios
                        </h3>
                        
                        {/* Comment form placeholder */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <textarea
                            placeholder="Deja un comentario..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={!currentUserId || isSubmittingComment}
                          ></textarea>
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-sm text-gray-500">
                              {!currentUserId && (
                                <span>
                                  <Link href="/auth/login" className="text-[#097EEC] hover:underline">
                                    Inicia sesión
                                  </Link>{" "}
                                  para comentar
                                </span>
                              )}
                            </p>
                            <button
                              className="px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!commentText.trim() || !currentUserId || isSubmittingComment}
                              onClick={handleSubmitComment}
                            >
                              {isSubmittingComment ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" />
                                  Comentar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        
                        {/* Comments list */}
                        <div className="space-y-4">
                          {comments.length > 0 ? (
                            comments.map((comment) => (
                              <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 rounded-full p-2 text-gray-500">
                                      <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {comment.user?.name || "Usuario"}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {formatDate(comment.created_at)} a las {formatTime(comment.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {currentUserId === comment.userId && (
                                    <button
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                      aria-label="Eliminar comentario"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                                <p className="mt-3 text-gray-700">{comment.description}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column - Author info */}
                    <div>
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del publicador</h3>
                        
                        {author ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#097EEC]/10 rounded-full p-3">
                                <UserIcon className="h-6 w-6 text-[#097EEC]" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{author.name}</p>
                                {author.company && (
                                  <span className="text-sm text-gray-500 flex items-center mt-1">
                                    <Building2 className="h-3.5 w-3.5 mr-1" />
                                    {author.company.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                              <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <p className="text-gray-800">{author.email}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-500">Teléfono</p>
                                  <p className="text-gray-800">{author.cellphone}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-500">Miembro desde</p>
                                  <p className="text-gray-800">{author.created_at ? formatDate(author.created_at) : "N/A"}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-200 mt-4">
                              <button
                                className="w-full bg-[#097EEC] text-white py-2 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                Contactar
                              </button>
                              
                              <Link href={`/profile/${author.id}`}>
                                <button className="w-full mt-2 border border-[#097EEC] text-[#097EEC] py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                                  Ver perfil completo
                                </button>
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-500">Información no disponible</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Related publications */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Publicaciones relacionadas</h3>
                        
                        <div className="space-y-3">
                          {/* Aquí irían las publicaciones relacionadas */}
                          <div className="text-center py-4">
                            <p className="text-gray-500">No hay publicaciones relacionadas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicationDetailPage;