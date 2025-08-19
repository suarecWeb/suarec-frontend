"use client";
import { useEffect, useState, useRef } from "react";
import type React from "react";
import {
  IdPhotosService,
  type IdPhoto,
  type CreateIdPhotoRequest,
} from "@/services/IdPhotosService";
import { Trash2, Eye, XCircle, Clock, FileImage } from "lucide-react";
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
import AuthService from "@/services/AuthService";
import {
  User as UserType,
  Reference,
  SocialLink,
  Education,
} from "@/interfaces/user.interface";
import ProfessionAutocomplete from "@/components/ProfessionAutocomplete";
import toast from "react-hot-toast";
import SupabaseService from "@/services/supabase.service";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

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
  const [idPhotos, setIdPhotos] = useState<IdPhoto[]>([]);
  const [uploadingIdPhoto, setUploadingIdPhoto] = useState(false);
  const [loadingIdPhotos, setLoadingIdPhotos] = useState(true);
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

  // Estados para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchIdPhotos = async () => {
    try {
      setLoadingIdPhotos(true);
      const photos = await IdPhotosService.getMyIdPhotos();
      setIdPhotos(photos);
    } catch (err) {
      toast.error("No se pudieron cargar las fotos de cédula");
    } finally {
      setLoadingIdPhotos(false);
    }
  };

  const handleUploadIdPhoto = async (
    photoType: "front" | "back",
    file: File,
  ) => {
    try {
      setUploadingIdPhoto(true);

      // Validar el archivo antes de subirlo
      if (!file) {
        toast.error("No se ha seleccionado ningún archivo");
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato de archivo no válido. Use JPG, PNG o WebP");
        return;
      }

      // Validar tamaño de archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("El archivo es muy grande. Máximo 5MB permitido");
        return;
      }

      // Toast informativo mientras se sube
      toast.loading("Subiendo foto de cédula...", { id: "uploadIdPhoto" });

      // Subir imagen a Supabase Storage
      const uploadResult = await SupabaseService.uploadImage(
        file,
        "id-photos", // Carpeta específica para fotos de cédula
      );

      // Verificar si hubo error en la subida
      if (uploadResult.error || !uploadResult.url) {
        throw new Error(uploadResult.error || "Error al subir la imagen");
      }

      // Crear objeto con datos de la foto para enviar al backend
      const photoData: CreateIdPhotoRequest = {
        image_url: uploadResult.url,
        image_path: uploadResult.path,
        photo_type: photoType,
        description: `Foto de cédula - ${photoType === "front" ? "frontal" : "posterior"}`,
      };

      // Guardar en la base de datos a través del backend
      await IdPhotosService.addIdPhoto(photoData);

      // Toast de éxito
      toast.success(
        `Foto ${photoType === "front" ? "frontal" : "posterior"} subida exitosamente`,
        { id: "uploadIdPhoto" },
      );

      // Recargar las fotos para mostrar la nueva
      await fetchIdPhotos();
    } catch (err: any) {
      // Manejo específico de errores
      if (err.response?.status === 400) {
        toast.error(
          "Ya existe una foto de este tipo. Use la opción de actualizar.",
          { id: "uploadIdPhoto" },
        );
      } else if (err.message?.includes("subir imagen")) {
        toast.error(`Error de almacenamiento: ${err.message}`, {
          id: "uploadIdPhoto",
        });
      } else if (err.response?.data?.message) {
        toast.error(`Error: ${err.response.data.message}`, {
          id: "uploadIdPhoto",
        });
      } else {
        toast.error("Error al subir la foto de cédula. Intenta nuevamente", {
          id: "uploadIdPhoto",
        });
      }
    } finally {
      setUploadingIdPhoto(false);
    }
  };

  const handleDeleteIdPhoto = async (photoId: number) => {
    try {
      // Primero obtener la información de la foto para conseguir el image_path
      const photoToDelete = idPhotos.find((photo) => photo.id === photoId);

      if (!photoToDelete) {
        toast.error("No se encontró la foto a eliminar");
        return;
      }

      // Toast informativo
      toast.loading("Eliminando foto...", { id: "deleteIdPhoto" });

      // Eliminar la foto del backend
      await IdPhotosService.deleteIdPhoto(photoId);

      // Si hay un image_path, eliminar también del storage de Supabase
      if (photoToDelete.image_path) {
        await SupabaseService.deleteIdPhotoFromStorage(
          photoToDelete.image_path,
        );
      }

      toast.success("Foto eliminada exitosamente", { id: "deleteIdPhoto" });
      await fetchIdPhotos();
    } catch (err: any) {
      toast.error("Error al eliminar la foto", { id: "deleteIdPhoto" });
    }
  };

  const handleUpdateIdPhoto = async (photoId: number, file: File) => {
    try {
      setUploadingIdPhoto(true);

      // Validar el archivo antes de subirlo
      if (!file) {
        toast.error("No se ha seleccionado ningún archivo");
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato de archivo no válido. Use JPG, PNG o WebP");
        return;
      }

      // Validar tamaño de archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("El archivo es muy grande. Máximo 5MB permitido");
        return;
      }

      // Obtener la foto actual para eliminar la imagen anterior
      const currentPhoto = idPhotos.find((photo) => photo.id === photoId);

      // Toast informativo
      toast.loading("Actualizando foto de cédula...", { id: "updateIdPhoto" });

      // Subir nueva imagen a Supabase Storage
      const uploadResult = await SupabaseService.uploadImage(
        file,
        "id-photos", // Carpeta específica para fotos de cédula
      );

      // Verificar si hubo error en la subida
      if (uploadResult.error || !uploadResult.url) {
        throw new Error(uploadResult.error || "Error al subir la imagen");
      }

      // Actualizar la foto existente en el backend
      await IdPhotosService.updateIdPhoto(photoId, {
        image_url: uploadResult.url,
        image_path: uploadResult.path,
      });

      // Si había una imagen anterior y se actualizó exitosamente, eliminar la anterior del storage
      if (currentPhoto?.image_path) {
        await SupabaseService.deleteIdPhotoFromStorage(currentPhoto.image_path);
      }

      toast.success("Foto actualizada exitosamente", { id: "updateIdPhoto" });

      // Recargar las fotos
      await fetchIdPhotos();
    } catch (err: any) {
      // Manejo específico de errores
      if (err.message?.includes("subir imagen")) {
        toast.error(`❌ Error de almacenamiento: ${err.message}`, {
          id: "updateIdPhoto",
        });
      } else if (err.response?.data?.message) {
        toast.error(`❌ Error: ${err.response.data.message}`, {
          id: "updateIdPhoto",
        });
      } else {
        toast.error("❌ Error al actualizar la foto. Intenta nuevamente", {
          id: "updateIdPhoto",
        });
      }
    } finally {
      setUploadingIdPhoto(false);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "pending":
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  // Función para obtener el icono del estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

      // Función auxiliar para crear fecha sin problemas de zona horaria
      const createLocalDate = (dateString: string): Date => {
        const date = new Date(dateString + "T12:00:00");
        return date;
      };

      // Convertir born_at a Date antes de enviarlo y limpiar el payload
      const userData: Partial<UserType> = {
        name: formData.name || undefined,
        email: formData.email ? formData.email.toLowerCase() : undefined,
        genre: formData.genre || undefined,
        cellphone: formData.cellphone || undefined,
        born_at: createLocalDate(formData.born_at) || undefined,
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

  const hasPersonRole = user?.roles
    ? getRoleNames(user.roles).includes("PERSON")
    : false;

  // Función para manejar cambios en los campos de contraseña
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para cambiar contraseña
  const handleChangePassword = async () => {
    // Validaciones
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setChangingPassword(true);
    try {
      // Toast informativo al iniciar el proceso
      toast.loading("🔄 Cambiando contraseña...", { id: "changePassword" });

      // Llamada a la API para cambiar la contraseña
      const response = await AuthService.changePassword(
        user?.id?.toString() || "",
        passwordData.newPassword,
      );

      // Verificar si la respuesta fue exitosa
      if (response.status === 200 || response.status === 201) {
        toast.success("✅ Contraseña cambiada exitosamente", {
          id: "changePassword",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error("❌ No se pudo cambiar la contraseña", {
          id: "changePassword",
        });
      }
    } catch (err: any) {
      // Manejar diferentes tipos de errores
      if (err.response?.status === 400) {
        toast.error(
          "❌ Error: Verifica que la nueva contraseña cumpla con los requisitos",
          { id: "changePassword" },
        );
      } else if (err.response?.status === 401) {
        toast.error("❌ Error: No tienes permisos para cambiar la contraseña", {
          id: "changePassword",
        });
      } else if (err.response?.status === 404) {
        toast.error("❌ Error: Usuario no encontrado", {
          id: "changePassword",
        });
      } else if (err.response?.data?.message) {
        toast.error(`❌ Error: ${err.response.data.message}`, {
          id: "changePassword",
        });
      } else {
        toast.error(
          "❌ Error: No se pudo cambiar la contraseña. Intenta nuevamente",
          { id: "changePassword" },
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIdPhotos();
    }
  }, [user]);

  const IdPhotoUploadButton = ({
    photoType,
    existingPhoto,
  }: {
    photoType: "front" | "back";
    existingPhoto?: IdPhoto;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (existingPhoto) {
          handleUpdateIdPhoto(existingPhoto.id, file);
        } else {
          handleUploadIdPhoto(photoType, file);
        }
      }
    };

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {existingPhoto ? (
          <div className="space-y-4">
            <div className="relative">
              <Zoom>
                <img
                  src={existingPhoto.image_url}
                  alt={`Cédula ${photoType === "front" ? "frontal" : "posterior"}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </Zoom>
              <div
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(existingPhoto.status)}`}
              >
                {getStatusIcon(existingPhoto.status)}
                {existingPhoto.status === "approved" && "Aprobada"}
                {existingPhoto.status === "rejected" && "Rechazada"}
                {existingPhoto.status === "pending" && "Pendiente"}
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingIdPhoto}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploadingIdPhoto ? "Subiendo..." : "Cambiar"}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteIdPhoto(existingPhoto.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>

            {existingPhoto.description &&
              existingPhoto.status === "rejected" && (
                <p className="text-sm text-gray-600">
                  Motivo rechazo: {existingPhoto.description}
                </p>
              )}
          </div>
        ) : (
          <div className="space-y-4">
            <FileImage className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Foto {photoType === "front" ? "frontal" : "posterior"} de cédula
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Sube la foto{" "}
                {photoType === "front" ? "del frente" : "de la parte posterior"}{" "}
                de tu cédula de ciudadanía
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingIdPhoto}
                className="px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploadingIdPhoto ? "Subiendo..." : "Subir foto"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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

            {/* Formulario principal solo para información personal y empresa */}
            {user && (
              <form onSubmit={handleSubmit}>
                <Tabs defaultValue="personal">
                  <TabsList className="w-full mb-10 flex flex-wrap sm:mb-6">
                    <TabsTrigger value="personal" className="flex-1">
                      Información personal
                    </TabsTrigger>
                    {hasBusinessRole && (
                      <TabsTrigger value="company" className="flex-1">
                        Información de empresa
                      </TabsTrigger>
                    )}
                    {hasPersonRole && (
                      <TabsTrigger value="id-photos" className="flex-1">
                        Fotos de cédula
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="security" className="flex-1">
                      Seguridad
                    </TabsTrigger>
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

                  {/* Tab de Seguridad - Formulario independiente */}
                  <TabsContent value="security">
                    <div className="max-w-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Cambiar contraseña
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Actualiza tu contraseña para mantener tu cuenta segura
                      </p>

                      {/* Formulario simplificado sin onSubmit */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Contraseña actual
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            placeholder="Ingresa tu contraseña actual"
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Nueva contraseña
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Confirmar nueva contraseña
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                            placeholder="Repite la nueva contraseña"
                          />
                        </div>

                        <div className="pt-4 space-y-3">
                          {/* Botón principal */}
                          <button
                            type="button"
                            onClick={handleChangePassword}
                            className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            disabled={changingPassword}
                          >
                            {changingPassword ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Cambiando contraseña...</span>
                              </>
                            ) : (
                              <>
                                <Save className="h-5 w-5" />
                                <span>Cambiar contraseña</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {hasPersonRole && (
                    <TabsContent value="id-photos">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Verificación de identidad
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Sube las fotos de tu cédula de ciudadanía para
                            verificar tu identidad. Las fotos serán revisadas
                            por nuestro equipo.
                          </p>
                        </div>

                        {loadingIdPhotos ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-[#097EEC]" />
                            <span className="ml-2">
                              Cargando fotos de cédula...
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <IdPhotoUploadButton
                              photoType="front"
                              existingPhoto={idPhotos.find(
                                (photo) => photo.photo_type === "front",
                              )}
                            />
                            <IdPhotoUploadButton
                              photoType="back"
                              existingPhoto={idPhotos.find(
                                (photo) => photo.photo_type === "back",
                              )}
                            />
                          </div>
                        )}

                        {idPhotos.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">
                              Estado de verificación
                            </h4>
                            <div className="space-y-2">
                              {idPhotos.map((photo) => (
                                <div
                                  key={photo.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-blue-800">
                                    Foto{" "}
                                    {photo.photo_type === "front"
                                      ? "frontal"
                                      : "posterior"}
                                  </span>
                                  <div
                                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(photo.status)}`}
                                  >
                                    {getStatusIcon(photo.status)}
                                    {photo.status === "approved" && "Aprobada"}
                                    {photo.status === "rejected" && "Rechazada"}
                                    {photo.status === "pending" &&
                                      "En revisión"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Recomendaciones
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Las fotos deben ser claras y legibles</li>
                            <li>
                              • Asegúrate de que toda la información sea visible
                            </li>
                            <li>• Evita reflejos y sombras</li>
                            <li>• Usa buena iluminación</li>
                            <li>
                              • Los archivos deben ser en formato JPG, PNG o
                              WebP
                            </li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {/* Botón de guardar solo para información personal y empresa */}
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
