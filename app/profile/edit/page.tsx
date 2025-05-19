"use client"
import { useEffect, useState } from "react"
import type React from "react"

import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"
import { Save, AlertCircle, CheckCircle, ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserService } from "@/services/UsersService"
import { User as UserType } from "@/interfaces/user.interface"
import ProfessionAutocomplete from "@/components/ProfessionAutocomplete"

// Interfaces para el token
interface TokenPayload {
  id: string
  email: string
  roles: { id: string; name: string }[]
}

// Lista de profesiones sugeridas
const profesionesSugeridas = [
  // TRABAJOS OPERATIVOS Y DE CAMPO
  "Obrero de construcción",
  "Electricista",
  "Plomero",
  "Carpintero",
  "Albañil",
  "Jardinero",
  "Pintor",
  "Soldador",
  "Mecánico automotriz",
  "Técnico de mantenimiento industrial",
  "Operador de maquinaria pesada",
  "Conductor (camión, taxi, plataforma)",
  "Instalador de paneles solares",
  "Técnico de aire acondicionado",
  "Personal de mudanza",
  "Guardia de seguridad",
  "Aseador / Personal de limpieza",
  // PROFESIONALES ACADÉMICOS
  "Abogado",
  "Contador",
  "Ingeniero civil",
  "Ingeniero industrial",
  "Ingeniero de sistemas",
  "Arquitecto",
  "Médico general",
  "Enfermero",
  "Psicólogo",
  "Nutricionista",
  "Profesor / Tutor (colegio o universidad)",
  "Investigador",
  "Ingeniero ambiental",
  "Economista",
  "Administrador de empresas",
  "Consultor empresarial",
  // CREATIVOS Y ARTÍSTICOS
  "Diseñador gráfico",
  "Fotógrafo",
  "Videógrafo",
  "Editor de video",
  "Community Manager",
  "Creador de contenido digital",
  "Animador 2D/3D",
  "Modelador 3D",
  "Ilustrador",
  "Músico (guitarrista, pianista, baterista, etc.)",
  "Cantante",
  "Actor / Actriz",
  "Artista plástico",
  "Decorador de interiores",
  "Organizador de eventos",
  // TECNOLOGÍA Y DIGITAL
  "Desarrollador web",
  "Desarrollador de apps móviles",
  "Programador backend/frontend",
  "Ingeniero en inteligencia artificial",
  "Científico de datos",
  "Analista de ciberseguridad",
  "Experto en blockchain",
  "Administrador de bases de datos",
  "Especialista en SEO/SEM",
  "Growth hacker",
  "UX/UI designer",
  "Project manager IT",
  "Tester de software (QA)",
  // SERVICIOS TÉCNICOS ESPECIALIZADOS
  "Técnico de redes y telecomunicaciones",
  "Técnico electrónico",
  "Técnico de sistemas",
  "Reparador de electrodomésticos",
  "Instalador de cámaras de seguridad",
  "Asesor en energías renovables",
  "Especialista en domótica (casas inteligentes)",
  "Operador de drones",
  // VENTAS, FINANZAS Y ADMINISTRACIÓN
  "Asesor comercial",
  "Ejecutivo de ventas",
  "Telemercaderista",
  "Agente de seguros",
  "Broker inmobiliario",
  "Asistente administrativo",
  "Secretaria",
  "Personal de servicio al cliente",
  "Recepcionista",
  "Auxiliar contable",
  "Asistente de recursos humanos",
  // GASTRONOMÍA Y TURISMO
  "Chef",
  "Cocinero",
  "Repostero",
  "Bartender",
  "Mesero",
  "Guía turístico",
  "Agente de viajes",
  "Organizador de bodas (wedding planner)",
  "Barista",
  // SALUD, BIENESTAR Y DEPORTE
  "Entrenador personal",
  "Instructor de yoga",
  "Fisioterapeuta",
  "Terapeuta ocupacional",
  "Masajista",
  "Esteticista",
  "Cosmetólogo",
  "Barbero",
  "Peluquero",
  "Maquillador profesional",
  "Podólogo",
  // SERVICIOS PARA MASCOTAS
  "Paseador de perros",
  "Entrenador de mascotas",
  "Veterinario",
  "Peluquero canino",
  "Cuidador de mascotas",
  // LOGÍSTICA Y TRANSPORTE
  "Mensajero",
  "Domiciliario",
  "Transportador de carga",
  "Coordinador logístico",
  "Auxiliar de bodega",
  "Operador de montacargas",
  // OTROS TALENTOS Y OFICIOS VARIOS
  "Artesano",
  "Costurero",
  "Modista",
  "Reparador de calzado",
  "Zapatero",
  "Cuidador de personas mayores",
  "Niñera",
  "Asistente de hogar",
  "Especialista en permacultura/agricultura sostenible",
  // Opción personalizada
  "Otra"
];

const ProfileEditPage = () => {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    genre: "",
    cellphone: "",
    born_at: "",
    cv_url: "",
    profession: "",
    customProfession: "",
    skills: [] as string[],
    skillInput: "",
    company: {
      name: "",
      nit: "",
      email: "",
      cellphone: "",
      born_at: "",
    },
  })

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
        const response = await UserService.getUserById(+decoded.id)
        const userData = response.data

        // Establecer los datos del usuario
        setUser(userData)

        // Inicializar el formulario con los datos del usuario
        setFormData({
            name: userData.name,
            email: userData.email,
            genre: userData.genre || "",
            cellphone: userData.cellphone || "",
            born_at: userData.born_at ? formatDateForInput(new Date(userData.born_at)) : "",
            cv_url: userData.cv_url || "",
            profession: userData.profession || "",
            customProfession: "",
            skills: userData.skills || [],
            skillInput: "",
            company: userData.company
              ? {
                  name: userData.company.name,
                  nit: userData.company.nit,
                  email: userData.company.email,
                  cellphone: userData.company.cellphone,
                  born_at: userData.company.born_at ? formatDateForInput(new Date(userData.company.born_at)) : "",
                }
              : {
                  name: "",
                  nit: "",
                  email: "",
                  cellphone: "",
                  born_at: "",
                },
          })          

        setLoading(false)
      } catch (err) {
        console.error("Error al obtener perfil:", err)
        setError("No se pudo cargar la información del perfil")
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [router])

  const formatDateForInput = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith("company.")) {
      const companyField = name.split(".")[1]
      setFormData({
        ...formData,
        company: {
          ...formData.company,
          [companyField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleProfessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      profession: value,
      customProfession: value === "Otra" ? prev.customProfession : "",
    }));
  };

  const handleCustomProfessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      customProfession: e.target.value,
      profession: "Otra",
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, skillInput: e.target.value }));
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && formData.skillInput.trim()) {
      e.preventDefault();
      const newSkill = formData.skillInput.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill],
          skillInput: "",
        }));
      }
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
  
    try {
      if (!user?.id) {
        throw new Error("ID de usuario no disponible");
      }
  
      // Determinar la profesión final
      let finalProfession = formData.profession;
      if (formData.profession === "Otra") {
        finalProfession = formData.customProfession.trim() || "Otra";
      }
  
      // Convertir born_at a Date antes de enviarlo
      const userData: Partial<UserType> = {
        name: formData.name,
        email: formData.email,
        genre: formData.genre,
        cellphone: formData.cellphone,
        born_at: formData.born_at ? new Date(formData.born_at) : undefined,
        cv_url: formData.cv_url,
        profession: finalProfession,
        skills: formData.skills,
      };
  
      if (hasBusinessRole && user.company) {
        userData.company = {
          ...formData.company,
          userId: user.id,
          user: user,
          id: user.company.id,
          created_at: user.company.created_at,
          born_at: formData.company.born_at ? new Date(formData.company.born_at) : new Date(),
        };
      }
  
      await UserService.updateUser(user.id, userData);
      setSuccess("Perfil actualizado correctamente");
  
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setError("No se pudo actualizar la información del perfil");
    } finally {
      setSaving(false);
    }
  };  

  // Función para extraer los nombres de los roles
  const getRoleNames = (roles: any[] | undefined): string[] => {
    if (!roles) return []

    return roles.map((role) => {
      if (typeof role === "string") return role
      if (typeof role === "object" && role.name) return role.name
      return "Unknown"
    })
  }

  const hasBusinessRole = user?.roles ? getRoleNames(user.roles).includes("BUSINESS") : false

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Editar Perfil</h1>
            <p className="mt-2 text-blue-100">Actualiza tu información personal</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/profile">
                <button className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver al perfil</span>
                </button>
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-medium">Éxito</h3>
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-32 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Tabs defaultValue="personal">
                  <TabsList className="w-full mb-6">
                    <TabsTrigger value="personal" className="flex-1">
                      Información Personal
                    </TabsTrigger>
                    {hasBusinessRole && (
                      <TabsTrigger value="company" className="flex-1">
                        Información de Empresa
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="personal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cellphone" className="block text-sm font-medium text-gray-700">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="cellphone"
                          name="cellphone"
                          value={formData.cellphone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                          Género
                        </label>
                        <select
                          id="genre"
                          name="genre"
                          value={formData.genre}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          required
                        >
                          <option value="">Seleccionar género</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="born_at" className="block text-sm font-medium text-gray-700">
                          Fecha de nacimiento
                        </label>
                        <input
                          type="date"
                          id="born_at"
                          name="born_at"
                          value={formData.born_at}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="cv_url" className="block text-sm font-medium text-gray-700">
                          CV / Hoja de vida
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            id="cv_url"
                            name="cv_url"
                            value={formData.cv_url}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            placeholder="URL de tu CV"
                          />
                          <button
                            type="button"
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-r-lg border border-gray-300 border-l-0 hover:bg-gray-200 transition-colors"
                          >
                            <Upload className="h-5 w-5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">Sube tu CV en formato PDF o proporciona una URL</p>
                      </div>

                      {/* PROFESIÓN Y HABILIDADES SOLO PARA NO-EMPRESAS */}
                      {!hasBusinessRole && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
                              Profesión
                            </label>
                            <ProfessionAutocomplete
                              value={formData.profession}
                              onChange={(val) => setFormData((prev) => ({ ...prev, profession: val }))}
                              suggestions={profesionesSugeridas}
                            />
                            {formData.profession === "Otra" && (
                              <input
                                type="text"
                                placeholder="Escribe tu profesión"
                                value={formData.customProfession}
                                onChange={handleCustomProfessionChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none mt-2"
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                              Habilidades
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {formData.skills.map((skill) => (
                                <span key={skill} className="bg-[#097EEC]/10 text-[#097EEC] px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                  {skill}
                                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 text-red-500 hover:text-red-700">&times;</button>
                                </span>
                              ))}
                            </div>
                            <input
                              id="skills"
                              name="skills"
                              type="text"
                              placeholder="Agrega una habilidad y presiona Enter o coma"
                              value={formData.skillInput}
                              onChange={handleSkillInputChange}
                              onKeyDown={handleSkillInputKeyDown}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ejemplo: Comunicación, Liderazgo, Creatividad...</p>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {hasBusinessRole && (
                    <TabsContent value="company">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="company.name" className="block text-sm font-medium text-gray-700">
                            Nombre de la empresa
                          </label>
                          <input
                            type="text"
                            id="company.name"
                            name="company.name"
                            value={formData.company.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="company.nit" className="block text-sm font-medium text-gray-700">
                            NIT
                          </label>
                          <input
                            type="text"
                            id="company.nit"
                            name="company.nit"
                            value={formData.company.nit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="company.email" className="block text-sm font-medium text-gray-700">
                            Email de la empresa
                          </label>
                          <input
                            type="email"
                            id="company.email"
                            name="company.email"
                            value={formData.company.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="company.cellphone" className="block text-sm font-medium text-gray-700">
                            Teléfono de la empresa
                          </label>
                          <input
                            type="tel"
                            id="company.cellphone"
                            name="company.cellphone"
                            value={formData.company.cellphone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="company.born_at" className="block text-sm font-medium text-gray-700">
                            Fecha de fundación
                          </label>
                          <input
                            type="date"
                            id="company.born_at"
                            name="company.born_at"
                            value={formData.company.born_at}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            required
                          />
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#097EEC] text-white px-6 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          <span>Guardar cambios</span>
                        </>
                      )}
                    </button>
                  </div>
                </Tabs>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileEditPage

