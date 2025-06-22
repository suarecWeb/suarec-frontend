/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PublicationService from "@/services/PublicationsService";
import ApplicationService from "@/services/ApplicationService";
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
  Briefcase,
  HandHeart,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/interfaces/publication.interface";
import { TokenPayload } from "@/interfaces/auth.interface";
import { User } from "@/interfaces/user.interface";
import { Comment } from "@/interfaces/comment.interface";
import CommentService from "@/services/CommentsService";
import MessageService from "@/services/MessageService";

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
  
  // Estados para aplicaciones
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [showApplicationModal, setShowApplicationModal] = useState(false);

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
        let decoded: TokenPayload | null = null;
        
        if (token) {
          decoded = jwtDecode<TokenPayload>(token);
          setCurrentUserId(decoded.id);
          setUserRoles(decoded.roles.map(role => role.name));
        }
        
        // Obtener detalles de la publicación
        const publicationId = Array.isArray(params.id) ? params.id[0] : params.id;
        const response = await PublicationService.getPublicationById(publicationId);
        const publicationData = response.data;
        
        setPublication(publicationData);
        console.log(response.data.user?.id + " pub data")
        // Obtener información del autor
        if (publicationData.user?.id) {
          const authorResponse = await UserService.getUserById(parseInt(publicationData.user.id));
          console.log(authorResponse + " obtener user by id")
          setAuthor(authorResponse.data);
        }
        
        // Obtener comentarios
        if (publicationData.comments) {
          setComments(publicationData.comments);
        }

        // Verificar si el usuario ya aplicó (solo si no es el autor y está logueado)
        if (publicationData.user?.id) {
          if (decoded && parseInt(publicationData.user.id) !== decoded.id) {
            try {
              const applicationCheck = await ApplicationService.checkUserApplication(
                decoded.id.toString(), 
                publicationId
              );
              setHasApplied(applicationCheck.data.hasApplied);
              if (applicationCheck.data.application) {
                setApplicationId(applicationCheck.data.application.id || null);
              }
            } catch (err) {
              // Si hay error, asumimos que no ha aplicado
              setHasApplied(false);
            }
          }
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
    if (!publication.user?.id) return false;
    return parseInt(publication.user?.id) === currentUserId || userRoles.includes("ADMIN");
  };

  // Función para determinar si la publicación es de una empresa
  const isCompanyPublication = () => {
    console.log(author + " autoroorrr")
    return author?.company !== undefined && author?.company !== null;
  };

  // Función para manejar la aplicación a una publicación
  const handleApply = async () => {
    if (!currentUserId || !publication?.id) return;
    
    setIsApplying(true);
    
    try {
      const applicationData = {
        userId: currentUserId,
        publicationId: publication.id,
        message: applicationMessage.trim() || undefined,
      };
      
      const response = await ApplicationService.createApplication(applicationData);
      
      setHasApplied(true);
      setApplicationId(response.data.id || null);
      setShowApplicationModal(false);
      setApplicationMessage("");
      
      // Mostrar mensaje de éxito
      setError(null);
      // Podrías mostrar un toast de éxito aquí
      
    } catch (err: any) {
      console.error("Error al aplicar:", err);
      setError(err.response?.data?.message || "No se pudo enviar la aplicación. Inténtalo de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsApplying(false);
    }
  };

  // Función para manejar contratar (redirigir a mensajes)
  const handleHire = async () => {
    if (!author?.id) return;

    try {
      const res = await MessageService.createMessage({
        content: 'Hola! Quiero contratar tu servicio de ' + publication?.title,
        senderId: currentUserId ? currentUserId : 0,
        recipientId: parseInt(author.id)
      })

      router.push(`/chat`);
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error);
      setError("No se pudo enviar el mensaje. Inténtalo de nuevo.");
      setTimeout(() => setError(null), 3000);
    }
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
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert("Enlace copiado al portapapeles"))
        .catch((error) => console.error("Error al copiar enlace:", error));
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUserId || !publication?.id) return;
    
    setIsSubmittingComment(true);
    
    try {
      const commentData = {
        description: commentText,
        created_at: new Date(),
        publicationId: publication.id,
        userId: currentUserId,
      };
      
      const response = await CommentService.createComment(commentData);
      const newComment = response.data;
      
      const commentForUI = {
        ...newComment,
        user: {
          id: currentUserId,
          name: "Tú",
        }
      };
      
      setComments([commentForUI, ...comments]);
      setCommentText("");
      
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      setError("No se pudo enviar el comentario. Inténtalo de nuevo.");
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

          {/* Modal de aplicación */}
          {showApplicationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Aplicar a esta publicación</h3>
                <p className="text-gray-600 mb-4">
                  ¿Estás interesado en esta oportunidad? Puedes enviar un mensaje opcional junto con tu aplicación.
                </p>
                
                <textarea
                  placeholder="Escribe un mensaje opcional..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  rows={4}
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  disabled={isApplying}
                />
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      setApplicationMessage("");
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                    disabled={isApplying}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-[#097EEC] hover:bg-[#0A6BC7] text-white rounded-lg transition-colors flex items-center gap-2"
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4" />
                        Aplicar
                      </>
                    )}
                  </button>
                </div>
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
                <Link href="/feed" className="hover:text-[#097EEC] transition-colors">
                  Encontrar
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

                    {/* Botones de Aplicar/Contratar */}
                    {currentUserId && publication.userId !== currentUserId && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        {isCompanyPublication() ? (
                          // Botón para aplicar a empresa
                          <div className="flex flex-col sm:flex-row gap-4">
                            {hasApplied ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">Ya aplicaste a esta publicación</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowApplicationModal(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                disabled={isApplying}
                              >
                                <Briefcase className="h-5 w-5" />
                                Aplicar a esta oportunidad
                              </button>
                            )}
                          </div>
                        ) : (
                          // Botón para contratar persona
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button
                              onClick={handleHire}
                              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <HandHeart className="h-5 w-5" />
                              Contratar este servicio
                            </button>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-500 mt-2">
                          {isCompanyPublication() 
                            ? "Al aplicar, la empresa podrá ver tu perfil y decidir si contactarte."
                            : "Serás redirigido a los mensajes para coordinar los detalles del servicio."
                          }
                        </p>
                      </div>
                    )}
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

                      {/* Comments section */}
                      <div className="border-t border-gray-200 pt-6 mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#097EEC]" />
                          Comentarios
                        </h3>
                        
                        {/* Comment form */}
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