"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  FileText,
  Building2,
  Shield,
  Edit,
  AlertCircle,
  MessageSquare,
  FileTextIcon as FileText2,
  Clock,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { UserService } from "@/services/UsersService"
import { User } from "@/interfaces/user.interface";
import { TokenPayload } from "@/interfaces/auth.interface"

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token")

        if (!token) {
          router.push("/auth/login")
          return
        }

        // Decodificar el token para obtener el ID del usuario
        const decoded = jwtDecode<TokenPayload>(token)

        // Obtener los datos del usuario desde el backend
        const response = await UserService.getUserById(decoded.id)
        const userData = response.data

        // Establecer los datos del usuario
        setUser(userData)
        setLoading(false)
      } catch (err) {
        console.error("Error al obtener perfil:", err)
        setError("No se pudo cargar la información del perfil")
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Función para obtener el color de fondo según el rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      case "BUSINESS":
        return "bg-blue-100 text-blue-800"
      case "PERSON":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Función para extraer los nombres de los roles
  const getRoleNames = (roles: any[] | undefined): string[] => {
    if (!roles) return []

    return roles.map((role) => {
      if (typeof role === "string") return role
      if (typeof role === "object" && role.name) return role.name
      return "Unknown"
    })
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Mi perfil</h1>
            <p className="mt-2 text-blue-100">Gestiona tu información personal y revisa tu actividad</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <Skeleton className="h-40 w-40 rounded-full mx-auto" />
                  <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                  <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <Skeleton className="h-10 w-full mb-6" />
                  <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            user && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#097EEC] to-[#2171BC] p-6 text-white">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="h-32 w-32 bg-white/20 rounded-full flex items-center justify-center text-white">
                        <UserIcon className="h-16 w-16" />
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md text-[#097EEC] hover:bg-gray-100 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                        {getRoleNames(user.roles).map((roleName, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {roleName}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-auto hidden md:block">
                      <Link href="/profile/edit">
                        <button className="bg-white text-[#097EEC] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>Editar perfil</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                  <div className="md:hidden mb-6">
                    <Link href="/profile/edit">
                      <button className="w-full bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2">
                        <Edit className="h-4 w-4" />
                        <span>Editar perfil</span>
                      </button>
                    </Link>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column - Personal Info */}
                    <div className="md:w-1/3">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Información personal</h3>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="text-gray-800">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Teléfono</p>
                              <p className="text-gray-800">{user.cellphone}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                              <p className="text-gray-800">{formatDate(user.born_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <UserIcon className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Género</p>
                              <p className="text-gray-800">{user.genre}</p>
                            </div>
                          </div>

                          {/* Profesión */}
                          {user.profession && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Profesión</p>
                                <p className="text-gray-800">{user.profession}</p>
                              </div>
                            </div>
                          )}

                          {/* Habilidades */}
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Habilidades</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.skills.map((skill, idx) => (
                                    <span key={idx} className="bg-[#097EEC]/10 text-[#097EEC] px-2 py-0.5 rounded-full text-xs font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Miembro desde</p>
                              <p className="text-gray-800">{user.created_at ? formatDate(user.created_at) : "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Company Info (if BUSINESS role) */}
                      {user.company && (
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de empresa</h3>

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Building2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="text-gray-800">{user.company.name}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">NIT</p>
                                <p className="text-gray-800">{user.company.nit}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-800">{user.company.email}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Phone className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Teléfono</p>
                                <p className="text-gray-800">{user.company.cellphone}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Fecha de Fundación</p>
                                <p className="text-gray-800">{formatDate(user.company.born_at)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Activity */}
                    <div className="md:w-2/3">
                      <Tabs defaultValue="publications">
                        <TabsList className="w-full mb-6">
                          <TabsTrigger value="publications" className="flex-1">
                            Publicaciones
                          </TabsTrigger>
                          <TabsTrigger value="comments" className="flex-1">
                            Comentarios
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="publications">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis publicaciones</h3>

                          {user.publications && user.publications.length > 0 ? (
                            <div className="space-y-4">
                              {user.publications.map((pub: any) => (
                                <div
                                  key={pub.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between">
                                    <h4 className="text-lg font-medium text-gray-800">{pub.title}</h4>
                                    <span className="text-xs font-medium text-[#097EEC] bg-blue-50 px-2 py-0.5 rounded-full">
                                      {pub.category}
                                    </span>
                                  </div>

                                  {pub.description && <p className="text-gray-600 mt-2">{pub.description}</p>}

                                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(pub.created_at)}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Eye className="h-4 w-4" />
                                      <span>{pub.visitors || 0} visitas</span>
                                    </div>

                                    <Link href={`/publications/${pub.id}/edit`}>
                                      <button className="text-[#097EEC] hover:text-[#0A6BC7] transition-colors flex items-center gap-1">
                                        <Edit className="h-4 w-4" />
                                        <span>Editar</span>
                                      </button>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <h4 className="text-lg font-medium text-gray-800">No hay publicaciones</h4>
                              <p className="text-gray-500 mt-2">Aún no has creado ninguna publicación</p>
                              <Link href="/publications/create">
                                <button className="mt-4 bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors">
                                  Crear publicación
                                </button>
                              </Link>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="comments">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mis comentarios</h3>

                          {user.comments && user.comments.length > 0 ? (
                            <div className="space-y-4">
                              {user.comments.map((comment: any) => (
                                <div
                                  key={comment.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="bg-[#097EEC]/10 rounded-full p-2 flex-shrink-0">
                                      <MessageSquare className="h-5 w-5 text-[#097EEC]" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-gray-600">{comment.content}</p>

                                      {comment.publication && (
                                        <Link href={`/publications/${comment.publication.id}`}>
                                          <p className="text-sm text-[#097EEC] hover:underline mt-2">
                                            En: {comment.publication.title}
                                          </p>
                                        </Link>
                                      )}

                                      <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>{formatDate(comment.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <h4 className="text-lg font-medium text-gray-800">No hay comentarios</h4>
                              <p className="text-gray-500 mt-2">Aún no has realizado ningún comentario</p>
                              <Link href="/publications">
                                <button className="mt-4 bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors">
                                  Ver Publicaciones
                                </button>
                              </Link>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}

export default ProfilePage

