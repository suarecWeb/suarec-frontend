"use client";
import { useEffect, useState } from "react";
import type React from "react";

import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserService } from "@/services/UsersService";
import {
  User as UserType,
  Reference,
  SocialLink,
  Education,
} from "@/interfaces/user.interface";
import ProfessionAutocomplete from "@/components/ProfessionAutocomplete";
import toast from "react-hot-toast";

// Interfaces para el token
interface TokenPayload {
  id: string;
  email: string;
  roles: { id: string; name: string }[];
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
  "Otra",
];

const ProfileEditPage = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

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
    bio: "",
    education: [] as Education[],
    references: [] as Reference[],
    socialLinks: [] as SocialLink[],
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Decodificar el token para obtener el ID del usuario
        const decoded = jwtDecode<TokenPayload>(token);

        // Obtener los datos del usuario desde el backend
        const response = await UserService.getUserById(+decoded.id);
        const userData = response.data;

        // Establecer los datos del usuario
        setUser(userData);

        // Inicializar el formulario con los datos del usuario
        setFormData({
          name: userData.name,
          email: userData.email,
          genre: userData.genre || "",
          cellphone: userData.cellphone || "",
          born_at: userData.born_at
            ? formatDateForInput(new Date(userData.born_at))
            : "",
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
                born_at: userData.company.born_at
                  ? formatDateForInput(new Date(userData.company.born_at))
                  : "",
              }
            : {
                name: "",
                nit: "",
                email: "",
                cellphone: "",
                born_at: "",
              },
          bio: userData.bio || "",
          education: Array.isArray(userData.education)
            ? userData.education.map((edu: any) => ({
                ...edu,
                startDate: edu.startDate
                  ? typeof edu.startDate === "string"
                    ? edu.startDate
                    : new Date(edu.startDate).toISOString().split("T")[0]
                  : "",
                endDate: edu.endDate
                  ? typeof edu.endDate === "string"
                    ? edu.endDate
                    : new Date(edu.endDate).toISOString().split("T")[0]
                  : "",
              }))
            : [],
          references: Array.isArray(userData.references)
            ? userData.references
            : [],
          socialLinks: Array.isArray(userData.socialLinks)
            ? userData.socialLinks
            : [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        toast.error("No se pudo cargar la información del perfil");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const formatDateForInput = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("company.")) {
      const companyField = name.split(".")[1];
      setFormData({
        ...formData,
        company: {
          ...formData.company,
          [companyField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleProfessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      profession: value,
      customProfession: value === "Otra" ? prev.customProfession : "",
    }));
  };

  const handleCustomProfessionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      customProfession: e.target.value,
      profession: "Otra",
    }));
  };

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, skillInput: e.target.value }));
  };

  const handleSkillInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
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

      // Filtrar educación válida (con campos requeridos)
      const validEducation = formData.education
        .filter((edu) => edu.institution && edu.degree && edu.startDate)
        .map((edu) => ({
          ...edu,
          startDate: edu.startDate
            ? typeof edu.startDate === "string"
              ? edu.startDate
              : new Date(edu.startDate).toISOString().split("T")[0]
            : "",
          endDate: edu.endDate
            ? typeof edu.endDate === "string"
              ? edu.endDate
              : new Date(edu.endDate).toISOString().split("T")[0]
            : undefined,
        }));

      // Filtrar referencias válidas (con campos requeridos)
      const validReferences = formData.references.filter(
        (ref) => ref.name && ref.relationship && ref.contact,
      );

      // Filtrar redes sociales válidas (con campos requeridos)
      const validSocialLinks = formData.socialLinks.filter(
        (link) => link.type && link.url,
      );

      // Convertir born_at a Date antes de enviarlo y limpiar el payload
      const userData: Partial<UserType> = {
        name: formData.name || undefined,
        email: formData.email ? formData.email.toLowerCase() : undefined,
        genre: formData.genre || undefined,
        cellphone: formData.cellphone || undefined,
        born_at: formData.born_at ? new Date(formData.born_at) : undefined,
        cv_url: formData.cv_url || undefined,
        profession: finalProfession || undefined,
        skills:
          Array.isArray(formData.skills) && formData.skills.length > 0
            ? formData.skills
            : undefined,
        bio: formData.bio || undefined,
        education: validEducation.length > 0 ? validEducation : undefined,
        references: validReferences.length > 0 ? validReferences : undefined,
        socialLinks: validSocialLinks.length > 0 ? validSocialLinks : undefined,
      };

      await UserService.updateUser(user.id, userData);
      toast.success("Perfil actualizado correctamente");

      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      toast.error("No se pudo actualizar la información del perfil");
    } finally {
      setSaving(false);
    }
  };

  // Función para extraer los nombres de los roles
  const getRoleNames = (roles: any[] | undefined): string[] => {
    if (!roles) return [];

    return roles.map((role) => {
      if (typeof role === "string") return role;
      if (typeof role === "object" && role.name) return role.name;
      return "Unknown";
    });
  };

  const hasBusinessRole = user?.roles
    ? getRoleNames(user.roles).includes("BUSINESS")
    : false;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Editar perfil</h1>
            <p className="mt-2 text-blue-100">
              Actualiza tu información personal
            </p>
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
                      Información personal
                    </TabsTrigger>
                    {hasBusinessRole && (
                      <TabsTrigger value="company" className="flex-1">
                        Información de empresa
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="personal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                        <label
                          htmlFor="cellphone"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                        <label
                          htmlFor="genre"
                          className="block text-sm font-medium text-gray-700"
                        >
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
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="O">Otro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="born_at"
                          className="block text-sm font-medium text-gray-700"
                        >
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

                      {/* PROFESIÓN Y HABILIDADES SOLO PARA NO-EMPRESAS */}
                      {!hasBusinessRole && (
                        <>
                          <div className="space-y-2">
                            <label
                              htmlFor="profession"
                              className="block text-sm font-medium text-gray-700"
                            ></label>
                            <ProfessionAutocomplete
                              value={formData.profession}
                              onChange={(val) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  profession: val,
                                }))
                              }
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
                            <label
                              htmlFor="skills"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Habilidades
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {formData.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="bg-[#097EEC]/10 text-[#097EEC] px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="ml-1 text-red-500 hover:text-red-700"
                                  >
                                    &times;
                                  </button>
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
                            <p className="text-xs text-gray-500 mt-1">
                              Ejemplo: Comunicación, Liderazgo, Creatividad...
                            </p>
                          </div>
                        </>
                      )}

                      {/* SOBRE MÍ */}
                      <div className="space-y-2">
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Sobre mí
                        </label>
                        <textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none min-h-[80px]"
                          placeholder="Cuéntanos sobre ti, tu experiencia, intereses, etc."
                        />
                      </div>

                      {/* EDUCACIÓN */}
                      <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Educación
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Los campos marcados con * son obligatorios
                        </p>
                        {formData.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="border p-3 rounded-lg mb-2 relative"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  education: prev.education.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }))
                              }
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              &times;
                            </button>
                            <input
                              type="text"
                              placeholder="Institución *"
                              className={`w-full mb-1 px-2 py-1 border rounded ${!edu.institution ? "border-red-300" : ""}`}
                              value={edu.institution || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.education.map((item, i) =>
                                    i === idx
                                      ? { ...item, institution: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, education: arr };
                                })
                              }
                            />
                            <input
                              type="text"
                              placeholder="Título *"
                              className={`w-full mb-1 px-2 py-1 border rounded ${!edu.degree ? "border-red-300" : ""}`}
                              value={edu.degree || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.education.map((item, i) =>
                                    i === idx
                                      ? { ...item, degree: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, education: arr };
                                })
                              }
                            />
                            <input
                              type="text"
                              placeholder="Campo de estudio"
                              className="w-full mb-1 px-2 py-1 border rounded"
                              value={edu.fieldOfStudy || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.education.map((item, i) =>
                                    i === idx
                                      ? {
                                          ...item,
                                          fieldOfStudy: e.target.value,
                                        }
                                      : item,
                                  );
                                  return { ...prev, education: arr };
                                })
                              }
                            />
                            <div className="flex gap-2 mb-1">
                              <input
                                type="date"
                                className={`flex-1 px-2 py-1 border rounded ${!edu.startDate ? "border-red-300" : ""}`}
                                value={
                                  typeof edu.startDate === "string"
                                    ? edu.startDate
                                    : edu.startDate
                                      ? new Date(edu.startDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : ""
                                }
                                onChange={(e) =>
                                  setFormData((prev) => {
                                    const arr = prev.education.map((item, i) =>
                                      i === idx
                                        ? { ...item, startDate: e.target.value }
                                        : item,
                                    );
                                    return { ...prev, education: arr };
                                  })
                                }
                              />
                              <input
                                type="date"
                                className="flex-1 px-2 py-1 border rounded"
                                value={
                                  typeof edu.endDate === "string"
                                    ? edu.endDate
                                    : edu.endDate
                                      ? new Date(edu.endDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : ""
                                }
                                onChange={(e) =>
                                  setFormData((prev) => {
                                    const arr = prev.education.map((item, i) =>
                                      i === idx
                                        ? { ...item, endDate: e.target.value }
                                        : item,
                                    );
                                    return { ...prev, education: arr };
                                  })
                                }
                              />
                            </div>
                            <textarea
                              placeholder="Descripción"
                              className="w-full px-2 py-1 border rounded"
                              value={edu.description || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.education.map((item, i) =>
                                    i === idx
                                      ? { ...item, description: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, education: arr };
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              education: [
                                ...prev.education,
                                {
                                  institution: "",
                                  degree: "",
                                  startDate: "",
                                  endDate: "",
                                  description: "",
                                },
                              ],
                            }))
                          }
                          className="mt-1 px-3 py-1 bg-[#097EEC] text-white rounded hover:bg-[#0A6BC7]"
                        >
                          Agregar educación
                        </button>
                      </div>

                      {/* REFERENCIAS */}
                      <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Referencias
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Los campos marcados con * son obligatorios
                        </p>
                        {formData.references.map((ref, idx) => (
                          <div
                            key={idx}
                            className="border p-3 rounded-lg mb-2 relative"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  references: prev.references.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }))
                              }
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              &times;
                            </button>
                            <input
                              type="text"
                              placeholder="Nombre *"
                              className={`w-full mb-1 px-2 py-1 border rounded ${!ref.name ? "border-red-300" : ""}`}
                              value={ref.name || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.references.map((item, i) =>
                                    i === idx
                                      ? { ...item, name: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, references: arr };
                                })
                              }
                            />
                            <input
                              type="text"
                              placeholder="Relación *"
                              className={`w-full mb-1 px-2 py-1 border rounded ${!ref.relationship ? "border-red-300" : ""}`}
                              value={ref.relationship || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.references.map((item, i) =>
                                    i === idx
                                      ? {
                                          ...item,
                                          relationship: e.target.value,
                                        }
                                      : item,
                                  );
                                  return { ...prev, references: arr };
                                })
                              }
                            />
                            <input
                              type="text"
                              placeholder="Contacto *"
                              className={`w-full mb-1 px-2 py-1 border rounded ${!ref.contact ? "border-red-300" : ""}`}
                              value={ref.contact || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.references.map((item, i) =>
                                    i === idx
                                      ? { ...item, contact: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, references: arr };
                                })
                              }
                            />
                            <textarea
                              placeholder="Comentario"
                              className="w-full px-2 py-1 border rounded"
                              value={ref.comment || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.references.map((item, i) =>
                                    i === idx
                                      ? { ...item, comment: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, references: arr };
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              references: [
                                ...prev.references,
                                {
                                  name: "",
                                  relationship: "",
                                  contact: "",
                                  comment: "",
                                },
                              ],
                            }))
                          }
                          className="mt-1 px-3 py-1 bg-[#097EEC] text-white rounded hover:bg-[#0A6BC7]"
                        >
                          Agregar referencia
                        </button>
                      </div>

                      {/* REDES SOCIALES */}
                      <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Redes
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Los campos marcados con * son obligatorios
                        </p>
                        {formData.socialLinks.map((link, idx) => (
                          <div
                            key={idx}
                            className="border p-3 rounded-lg mb-2 relative"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  socialLinks: prev.socialLinks.filter(
                                    (_, i) => i !== idx,
                                  ),
                                }))
                              }
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              &times;
                            </button>
                            <select
                              className={`w-full mb-1 px-2 py-1 border rounded ${!link.type ? "border-red-300" : ""}`}
                              value={link.type || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.socialLinks.map((item, i) =>
                                    i === idx
                                      ? { ...item, type: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, socialLinks: arr };
                                })
                              }
                            >
                              <option value="">Selecciona una red *</option>
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="GitHub">GitHub</option>
                              <option value="Twitter">Twitter</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Website">Website</option>
                              <option value="Otra">Otra</option>
                            </select>
                            <input
                              type="url"
                              placeholder="URL *"
                              className={`w-full mb-1 px-2 py-1 border rounded ${!link.url ? "border-red-300" : ""}`}
                              value={link.url || ""}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const arr = prev.socialLinks.map((item, i) =>
                                    i === idx
                                      ? { ...item, url: e.target.value }
                                      : item,
                                  );
                                  return { ...prev, socialLinks: arr };
                                })
                              }
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              socialLinks: [
                                ...prev.socialLinks,
                                { type: "", url: "" },
                              ],
                            }))
                          }
                          className="mt-1 px-3 py-1 bg-[#097EEC] text-white rounded hover:bg-[#0A6BC7]"
                        >
                          Agregar red
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  {hasBusinessRole && (
                    <TabsContent value="company">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="company.name"
                            className="block text-sm font-medium text-gray-700"
                          >
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
                          <label
                            htmlFor="company.nit"
                            className="block text-sm font-medium text-gray-700"
                          >
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
                          <label
                            htmlFor="company.email"
                            className="block text-sm font-medium text-gray-700"
                          >
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
                          <label
                            htmlFor="company.cellphone"
                            className="block text-sm font-medium text-gray-700"
                          >
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
                          <label
                            htmlFor="company.born_at"
                            className="block text-sm font-medium text-gray-700"
                          >
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
  );
};

export default ProfileEditPage;
