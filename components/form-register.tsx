/* eslint-disable */
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UsersService";
import CompanyService from "@/services/CompanyService";
import EmailVerificationService from "@/services/EmailVerificationService";
import {
  AlertCircle,
  Check,
  ArrowLeft,
  Loader2,
  User,
  Building2,
  Calendar,
  Mail,
  Phone,
  FileText,
  Key,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import TermsModal from "./terms-modal";

// Interfaces para los DTOs
interface CreateUserDto {
  name: string;
  password: string;
  cv_url?: string;
  genre: string;
  cellphone: string;
  email: string;
  born_at: Date;
  roles?: string[];
  companyId?: string;
  profession: string;
  skills: string[];
}

interface CreateCompanyDto {
  nit: string;
  name: string;
  born_at: Date;
  created_at: Date;
  email: string;
  cellphone: string;
  userId: number;
}

const FormRegister = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [userType, setUserType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const router = useRouter();

  // Revisar el tipo de usuario almacenado en localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem("user-type");
    console.log('user type: ' + storedUserType);
    setUserType(storedUserType);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    // También resetear el input de archivo
    const fileInput = document.getElementById(
      userType === "PERSON" ? "profile_image" : "company_logo"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    const formData = new FormData(event.currentTarget);
    
    setError("");
    setSuccess("");
  
    startTransition(async () => {
      try {
        let createdUserId: number | null = null;
        let userEmail: string = "";

        if (userType === "PERSON") {
          // Datos del usuario para PERSON
          const userData: CreateUserDto = {
            name: formData.get("fullname") as string,
            password: formData.get("password") as string,
            genre: formData.get("genre") as string,
            cellphone: formData.get("cellphone") as string,
            email: (formData.get("email") as string)?.toLowerCase(),
            born_at: new Date(formData.get("born_at") as string),
            cv_url: formData.get("cv_url") as string,
            roles: ["PERSON"],
            profession: "Profesional independiente",
            skills: ["Ninguna"],
          };
          
          userEmail = userData.email;
          
          // Para usuarios tipo PERSON, simplemente creamos el usuario
          const response = await UserService.createUser(userData);
          console.log("👤 Respuesta de creación de usuario:", response);
          console.log("🆔 ID del usuario creado:", response.data.id);
          createdUserId = response.data.id ? Number(response.data.id) : null;
          console.log("🆔 createdUserId después de conversión:", createdUserId);
          setSuccess("Usuario creado correctamente");
          
        } else if (userType === "BUSINESS") {
            // Para empresas, usamos el nombre y email de la empresa para el usuario
            const companyName = formData.get("company_name") as string;
            const companyEmail = (formData.get("company_email") as string)?.toLowerCase();
            const companyPhone = formData.get("company_cellphone") as string;
            const companyBornAtDate = new Date(formData.get("company_born_at") as string);
            const companyNit = formData.get("nit") as string;
            
            // Validar el formato del teléfono
            const phoneRegex = /^\+\d{1,3}\s?\d{1,14}$/;
            if (!phoneRegex.test(companyPhone)) {
              setError("El formato del teléfono debe ser: +código país número (Ej: +57 3001234567)");
              return;
            }
            
            // Validar longitud del NIT
            if (companyNit.length < 8 || companyNit.length > 15) {
              setError("El NIT debe tener entre 8 y 15 caracteres");
              return;
            }
            
            // Datos del usuario para BUSINESS con valores predeterminados para campos personales
            const userData: CreateUserDto = {
              // Usamos el nombre de la empresa como nombre de usuario
              name: companyName,
              password: formData.get("password") as string,
              // Campos personales con valores predeterminados
              genre: "O", // Otro
              cellphone: companyPhone, // Usar el teléfono de la empresa
              email: companyEmail, // Usar el email de la empresa
              born_at: companyBornAtDate, // Usar la fecha de fundación
              cv_url: "", // CV vacío
              roles: ["BUSINESS"],
              profession: "Profesional independiente",
              skills: ["Ninguna"],
            };
            
            userEmail = userData.email;
            
            try {
              // Creamos primero el usuario
              console.log("Enviando datos de usuario:", userData);
              const userResponse = await UserService.createUser(userData);
              console.log("👤 Respuesta de creación de usuario BUSINESS:", userResponse);
              console.log("🆔 ID del usuario BUSINESS creado:", userResponse.data.id);
              createdUserId = userResponse.data.id ? Number(userResponse.data.id) : null;
              console.log("🆔 createdUserId BUSINESS después de conversión:", createdUserId);
              
              if (createdUserId) {
                // Asegurarnos de que userId sea un número
                const userIdNumber = Number(createdUserId);
                
                if (isNaN(userIdNumber)) {
                  throw new Error("ID de usuario inválido");
                }
                
                // Creamos los datos de la empresa - NO CONVERTIR fechas a string
                // El backend espera objetos Date
                const companyData: CreateCompanyDto = {
                  nit: companyNit,
                  name: companyName,
                  email: companyEmail,
                  cellphone: companyPhone,
                  born_at: companyBornAtDate, // Mantener como Date
                  created_at: new Date(), // Mantener como Date
                  userId: userIdNumber, // Número
                };
                
                console.log("Enviando datos de empresa:", companyData);
                
                // Creamos la empresa asociada al usuario
                try {
                  const companyResponse = await CompanyService.createCompany(companyData);
                
                  setSuccess("Usuario y empresa creados correctamente");
                } catch (error: any) {
                  const res = UserService.deleteUser(createdUserId.toString())
                  console.error("Error específico:", error);
                  if (error.response?.data?.message) {
                    // Si el backend devuelve un mensaje específico
                    setError(error.response.data.message);
                  } else if (error.message) {
                    // Si es un error generado en el frontend
                    setError(error.message);
                  } else {
                    // Mensaje genérico
                    setError("Error al crear la empresa");
                  }
                  return;
                }
        
              }
            } catch (error: any) {
              console.error("Error específico:", error);
              if (error.response?.data?.message) {
                // Si el backend devuelve un mensaje específico
                setError(error.response.data.message);
              } else if (error.message) {
                // Si es un error generado en el frontend
                setError(error.message);
              } else {
                // Mensaje genérico
                setError("Error al crear la empresa");
              }
              return;
            }
          }

        // Si el usuario se creó exitosamente, enviar email de verificación
        if (createdUserId && userEmail) {
          console.log("🚀 Intentando enviar email de verificación...");
          console.log("📧 Email:", userEmail);
          console.log("🆔 User ID:", createdUserId);
          
          try {
            await EmailVerificationService.sendVerificationEmail(createdUserId, userEmail);
            console.log("✅ Email de verificación enviado exitosamente");
            setSuccess("Cuenta creada exitosamente. Se ha enviado un email de verificación a tu correo.");
            
            // Redirigir a la página de verificación de email después de 2 segundos
            setTimeout(() => {
              console.log("🔄 Redirigiendo a página de verificación...");
              router.push(`/auth/verify-email?email=${encodeURIComponent(userEmail)}`);
            }, 2000);
          } catch (error: any) {
            console.error("❌ Error al enviar email de verificación:", error);
            console.error("📋 Detalles del error:", error.response?.data);
            setSuccess("Cuenta creada exitosamente, pero hubo un problema al enviar el email de verificación. Puedes solicitarlo más tarde.");
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
              router.push("/auth/login");
            }, 3000);
          }
        } else {
          console.log("⚠️ No se pudo obtener ID de usuario o email");
          console.log("🆔 createdUserId:", createdUserId);
          console.log("📧 userEmail:", userEmail);
          // Si no se pudo obtener el ID del usuario, redirigir al login
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      } catch (error: any) {
        console.error("Error durante el registro:", error);
        setError(error.response?.data?.message || "Error al crear el usuario");
      }
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {userType === "PERSON" || userType === "BUSINESS" ? (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#097EEC]/10 flex items-center justify-center">
                {userType === "PERSON" ? (
                  <User className="h-6 w-6 text-[#097EEC]" />
                ) : (
                  <Building2 className="h-6 w-6 text-[#097EEC]" />
                )}
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {userType === "PERSON" ? "Registro Personal" : "Registro Empresarial"}
              </h2>
            </div>

            {/* Campos específicos por tipo de usuario */}
            {userType === "PERSON" ? (
              // Campos solo para PERSON
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fullname"
                        name="fullname"
                        type="text"
                        placeholder="Jhon Doe"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jhonDoe@gmail.com"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                      Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="genre"
                      name="genre"
                      className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                      disabled={isPending}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="*******"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="cellphone" className="block text-sm font-medium text-gray-700">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="cellphone"
                        name="cellphone"
                        type="tel"
                        placeholder="+57 123456789"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="born_at" className="block text-sm font-medium text-gray-700">
                      Fecha de nacimiento <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="born_at"
                        name="born_at"
                        type="date"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              // Campos solo para BUSINESS
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="nit" className="block text-sm font-medium text-gray-700">
                      NIT <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="nit"
                        name="nit"
                        type="text"
                        placeholder="1234567890"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                      Nombre de la compañía <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="company_name"
                        name="company_name"
                        type="text"
                        placeholder="Mi Empresa S.A."
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company_email" className="block text-sm font-medium text-gray-700">
                      Correo electrónico de la compañía <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="company_email"
                        name="company_email"
                        type="email"
                        placeholder="empresa@gmail.com"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="*******"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="company_cellphone" className="block text-sm font-medium text-gray-700">
                      Teléfono de la compañía <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="company_cellphone"
                        name="company_cellphone"
                        type="tel"
                        placeholder="+57 123456789"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company_born_at" className="block text-sm font-medium text-gray-700">
                      Fecha de fundación <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="company_born_at"
                        name="company_born_at"
                        type="date"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="company_logo" className="block text-sm font-medium text-gray-700">
                      Logo de la empresa (opcional)
                    </label>
                    <div className="relative">
                      <input
                        id="company_logo"
                        name="company_logo"
                        type="file"
                        accept="image/*"
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        onChange={handleFileChange}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Previsualización de imagen */}
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-[#097EEC]">
                  <img
                    src={imagePreview.toString()}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearImagePreview}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <Check className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-medium">¡Listo!</h3>
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Add terms and conditions checkbox before the submit button */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-[#097EEC]"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-700">
                    Acepto los{" "}
                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="text-[#097EEC] hover:underline"
                    >
                      términos y condiciones
                    </button>
                  </label>
                </div>
              </div>

              {/* Error message for terms */}
              {error && error.includes("términos y condiciones") && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-8 space-y-3">
              <button
                type="submit"
                className="w-full bg-[#097EEC] text-white py-3 px-6 rounded-lg hover:bg-[#0A6BC7] transition-colors flex justify-center items-center"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push("/auth/select-type")}
                className="w-full border border-[#097EEC] text-[#097EEC] py-3 px-6 rounded-lg hover:bg-[#097EEC]/5 transition-colors flex justify-center items-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No se ha seleccionado un tipo de usuario</h3>
            <p className="text-gray-600 mb-6">Debes seleccionar si eres una persona o una empresa para continuar con el registro.</p>
            <button
              className="bg-[#097EEC] text-white px-6 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors"
              onClick={() => router.push("/auth/select-type")}
              type="button"
            >
              Seleccionar tipo de usuario
            </button>
          </div>
        )}
      </form>

      {/* Terms Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
};

export default FormRegister;