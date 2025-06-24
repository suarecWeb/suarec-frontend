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
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Publication } from "@/interfaces/publication.interface";
import { TokenPayload } from "@/interfaces/auth.interface";
import { User } from "@/interfaces/user.interface";
import { Comment } from "@/interfaces/comment.interface";
import CommentService from "@/services/CommentsService";
import MessageService from "@/services/MessageService";
import ContractModal from "@/components/contract-modal";
import { ContractService } from "@/services/ContractService";
import { Contract } from "@/interfaces/contract.interface";
import { translatePriceUnit } from '@/lib/utils';

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

  // Estados para contratación
  const [showContractModal, setShowContractModal] = useState(false);
  
  // Estados para ofertas
  const [publicationBids, setPublicationBids] = useState<{ contracts: Contract[], totalBids: number }>({ contracts: [], totalBids: 0 });
  const [isLoadingBids, setIsLoadingBids] = useState(false);

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

  // Cargar ofertas cuando la publicación esté disponible
  useEffect(() => {
    if (publication?.id) {
      loadPublicationBids();
    }
  }, [publication?.id]);

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

  // Función para manejar contratar (nuevo sistema de contrataciones)
  const handleHire = () => {
    setShowContractModal(true);
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

  // Función para cargar ofertas de la publicación
  const loadPublicationBids = async () => {
    if (!publication?.id) return;
    
    try {
      setIsLoadingBids(true);
      const bidsData = await ContractService.getPublicationBids(publication.id);
      setPublicationBids(bidsData);
    } catch (error) {
      console.error('Error loading publication bids:', error);
    } finally {
      setIsLoadingBids(false);
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
                  Feed
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
                          {publication.price && (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                              <span className="font-semibold">${publication.price}</span>
                              <span className="ml-1">{translatePriceUnit(publication.priceUnit || '')}</span>
                            </span>
                          )}
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
                              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">Ya aplicaste a esta publicación</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowApplicationModal(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
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
                              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                            >
                              <HandHeart className="h-5 w-5" />
                              Contratar este servicio
                            </button>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-500 mt-3">
                          {isCompanyPublication() 
                            ? "Al aplicar, la empresa podrá ver tu perfil y decidir si contactarte."
                            : "Inicia el proceso de contratación con negociación de precios."
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
                        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50">
                          <img
                            src={publication.image_url}
                            alt={publication.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {/* Publication description */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                          <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                          Descripción
                        </h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {publication.description || "No hay descripción disponible."}
                          </p>
                        </div>
                      </div>

                      {/* Ofertas recibidas - Solo mostrar si es el autor de la publicación */}
                      {currentUserId && publication.userId === currentUserId && !isCompanyPublication() && (
                        <div className="border-t border-gray-200 pt-6 mt-8">
                          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                            <TrendingUp className="h-5 w-5 text-[#097EEC]" />
                            Ofertas Recibidas
                            {publicationBids.totalBids > 0 && (
                              <span className="bg-[#097EEC] text-white text-sm px-2 py-1 rounded-full">
                                {publicationBids.totalBids}
                              </span>
                            )}
                          </h3>
                          
                          {isLoadingBids ? (
                            <div className="space-y-4">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <Skeleton className="h-4 w-32 mb-2" />
                                  <Skeleton className="h-3 w-48" />
                                </div>
                              ))}
                            </div>
                          ) : publicationBids.contracts.length > 0 ? (
                            <div className="space-y-4">
                              {publicationBids.contracts.map((contract) => (
                                <div key={contract.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-[#097EEC] rounded-full flex items-center justify-center">
                                        <UserIcon className="h-5 w-5 text-white" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{contract.client?.name || 'Usuario'}</p>
                                        <p className="text-sm text-gray-500">{formatDate(contract.createdAt)}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-green-600">
                                        ${contract.currentPrice?.toLocaleString()} {translatePriceUnit(contract.priceUnit)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {contract.status === 'pending' ? 'Pendiente' : 
                                         contract.status === 'negotiating' ? 'En negociación' : 
                                         contract.status === 'accepted' ? 'Aceptado' : contract.status}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {contract.clientMessage && (
                                    <p className="text-sm text-gray-600 mb-3">{contract.clientMessage}</p>
                                  )}
                                  
                                  {contract.bids && contract.bids.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-xs font-medium text-gray-700 mb-2">
                                        Ofertas en esta contratación:
                                      </p>
                                      <div className="space-y-2">
                                        {contract.bids.map((bid) => (
                                          <div key={bid.id} className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">
                                              {bid.bidder?.name || 'Usuario'}: ${bid.amount?.toLocaleString()}
                                            </span>
                                            {bid.isAccepted && (
                                              <span className="text-green-600 text-xs font-medium">✓ Aceptada</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2 mt-3">
                                    <Link href={`/contracts`}>
                                      <button className="px-4 py-2 bg-[#097EEC] text-white text-sm rounded-lg hover:bg-[#097EEC]/90 transition-colors">
                                        Ver detalles
                                      </button>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No hay ofertas aún. ¡Las ofertas aparecerán aquí cuando alguien contrate tu servicio!</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Comments section */}
                      <div className="border-t border-gray-200 pt-6 mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                          <span className="w-1 h-6 bg-[#097EEC] rounded-full"></span>
                          <MessageSquare className="h-5 w-5 text-[#097EEC]" />
                          Comentarios
                        </h3>
                        
                        {/* Comment form */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                          <textarea
                            placeholder="Deja un comentario..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none"
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={!currentUserId || isSubmittingComment}
                          ></textarea>
                          <div className="flex justify-between items-center mt-4">
                            <p className="text-sm text-gray-500">
                              {!currentUserId && (
                                <span>
                                  <Link href="/auth/login" className="text-[#097EEC] hover:underline font-medium">
                                    Inicia sesión
                                  </Link>{" "}
                                  para comentar
                                </span>
                              )}
                            </p>
                            <button
                              className="px-6 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#097EEC]/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                              <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-4">
                                    <div className="bg-[#097EEC] rounded-full p-3 text-white">
                                      <UserIcon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-800">
                                        {comment.user?.name || "Usuario"}
                                      </p>
                                      <p className="text-sm text-gray-500 mb-2">
                                        {formatDate(comment.created_at)} a las {formatTime(comment.created_at)}
                                      </p>
                                      <p className="text-gray-700 leading-relaxed">
                                        {comment.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column - Author info and pricing */}
                    <div className="space-y-6">
                      {/* Pricing Card */}
                      {publication.price && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                            Tarifa del Servicio
                          </h3>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              ${publication.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                              por {translatePriceUnit(publication.priceUnit || '')}
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-gray-600">
                                💡 Esta es la tarifa base. Puedes negociar durante el proceso de contratación.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Author info */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-[#097EEC] rounded-full"></span>
                          Información del Proveedor
                        </h3>
                        
                        {author ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#097EEC] rounded-full p-3 text-white">
                                <UserIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{author.name}</p>
                                {author.profession && (
                                  <p className="text-sm text-gray-600">{author.profession}</p>
                                )}
                              </div>
                            </div>

                            {author.skills && author.skills.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Habilidades:</p>
                                <div className="flex flex-wrap gap-2">
                                  {author.skills.slice(0, 5).map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {author.skills.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                                      +{author.skills.length - 5} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              {author.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Mail className="h-4 w-4" />
                                  <span>{author.email}</span>
                                </div>
                              )}
                              {author.cellphone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  <span>{author.cellphone}</span>
                                </div>
                              )}
                            </div>

                            {/* Rating section - solo mostrar si las propiedades existen */}
                            {/* 
                            {(author as any).average_rating > 0 && (
                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={`text-lg ${
                                          star <= (author as any).average_rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    ({(author as any).average_rating.toFixed(1)})
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {(author as any).total_ratings} calificaciones
                                </p>
                              </div>
                            )}
                            */}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>Información del proveedor no disponible</p>
                          </div>
                        )}
                      </div>

                      {/* Publication stats */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                          Estadísticas
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Visitas:</span>
                            <span className="font-semibold text-gray-800">{publication.visitors || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Comentarios:</span>
                            <span className="font-semibold text-gray-800">{comments.length}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Categoría:</span>
                            <span className="font-semibold text-gray-800">{publication.category}</span>
                          </div>
                          {publicationBids.totalBids > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Ofertas activas:</span>
                              <span className="font-semibold text-[#097EEC]">{publicationBids.totalBids}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            )}
          </div>

          {/* Contract Modal */}
          {showContractModal && publication && (
            <ContractModal
              publication={publication}
              isOpen={showContractModal}
              onClose={() => setShowContractModal(false)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default PublicationDetailPage;