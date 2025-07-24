/* eslint-disable */
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UsersService";
import CompanyService from "@/services/CompanyService";
import EmailVerificationService from "@/services/EmailVerificationService";
import SupabaseService from "@/services/supabase.service";
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
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import TermsModal from "./terms-modal";
import Image from "next/image";
import toast from "react-hot-toast";

// Interfaces para los DTOs
interface CreateUserDto {
  name: string;
  password: string;
  cv_url?: string;
  profile_image?: string;
  genre: string;
  cellphone: string;
  email: string;
  born_at: Date;
  roles?: string[];
  companyId?: string;
  profession: string;
  skills: string[];
  cedula: string;
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
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(
    "",
  );
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const router = useRouter();

  // Revisar el tipo de usuario almacenado en localStorage
  useEffect(() => {
    const storedUserType = localStorage.getItem("user-type");
    console.log("user type: " + storedUserType);
    setUserType(storedUserType);
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (file) {
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Subir a Supabase
      try {
        setIsUploadingImage(true);
        const folder =
          userType === "PERSON" ? "profile-images" : "company-logos";
        const result = await SupabaseService.uploadImage(file, folder);

        if (result.error) {
          toast.error("Error al subir la imagen. Inténtalo de nuevo.");
          return;
        }

        setUploadedImageUrl(result.url);
      } catch (error) {
        toast.error("Error al subir la imagen. Inténtalo de nuevo.");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    setUploadedImageUrl("");
    // También resetear el input de archivo
    const fileInput = document.getElementById(
      userType === "PERSON" ? "profile_image" : "company_logo",
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordStrength({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
    });
  };

  const validateForm = (formData: FormData) => {
    const errors: any = {};

    if (userType === "PERSON") {
      // Validación nombre
      if (!formData.get("fullname"))
        errors.fullname = "El nombre es obligatorio";

      // Validación email
      const email = formData.get("email") as string;
      if (!email) errors.email = "El correo es obligatorio";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        errors.email = "Correo inválido";

      // Validación teléfono
      if (!formData.get("cellphone"))
        errors.cellphone = "El teléfono es obligatorio";

      // Validación fecha de nacimiento y mayor de 18 años
      const bornAt = formData.get("born_at") as string;
      if (!bornAt) errors.born_at = "La fecha de nacimiento es obligatoria";
      else {
        const birthDate = new Date(bornAt);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          if (age - 1 < 18) errors.born_at = "Debes ser mayor de 18 años";
        } else {
          if (age < 18) errors.born_at = "Debes ser mayor de 18 años";
        }
      }

      // Validación género
      if (!formData.get("genre")) errors.genre = "El sexo es obligatorio";

      // Validación cédula
      const cedula = formData.get("cedula") as string;
      if (!cedula) errors.cedula = "La cédula es obligatoria";
      else if (!/^[0-9]{6,15}$/.test(cedula))
        errors.cedula = "La cédula debe ser solo números (6-15 dígitos)";
    } else if (userType === "BUSINESS") {
      // Validaciones para empresas

      // Validación NIT simple
      const nit = formData.get("nit") as string;
      if (!nit) {
        errors.nit = "El NIT es obligatorio";
      } else if (!nit.includes("-")) {
        errors.nit =
          "El NIT debe incluir el dígito de verificación después del guión (ejemplo: 123456789-0)";
      } else {
        const parts = nit.split("-");
        if (
          parts.length !== 2 ||
          parts[1].length !== 1 ||
          !/^\d+$/.test(parts[1])
        ) {
          errors.nit =
            "El dígito de verificación debe ser un solo número después del guión";
        }
      }

      if (!formData.get("company_name"))
        errors.company_name = "El nombre de la empresa es obligatorio";

      const email = formData.get("company_email") as string;
      if (!email) errors.company_email = "El correo es obligatorio";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        errors.company_email = "Correo inválido";

      if (!formData.get("company_cellphone"))
        errors.company_cellphone = "El teléfono es obligatorio";
      if (!formData.get("company_born_at"))
        errors.company_born_at = "La fecha de fundación es obligatoria";
    }

    // Validación contraseña
    const password = formData.get("password") as string;
    if (!password) errors.password = "La contraseña es obligatoria";
    else if (
      !/^.*(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]).*$/.test(
        password,
      )
    ) {
      errors.password =
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial";
    }

    // Confirmación de contraseña
    if (!confirmPassword) errors.confirmPassword = "Confirma tu contraseña";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Las contraseñas no coinciden";

    // Validación términos
    if (!acceptedTerms)
      errors.terms = "Debes aceptar los términos y condiciones";

    return errors;
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

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
            roles: ["PERSON"],
            profession: "Profesional independiente",
            skills: ["Ninguna"],
            cedula: formData.get("cedula") as string,
            profile_image: uploadedImageUrl, // Agregar la URL de la imagen subida
          };

          userEmail = userData.email;

          // Para usuarios tipo PERSON, simplemente creamos el usuario
          const response = await UserService.createUser(userData);
          createdUserId = response.data.id ? Number(response.data.id) : null;
          toast.success("Usuario creado correctamente");
        } else if (userType === "BUSINESS") {
          // Para empresas, usamos el nombre y email de la empresa para el usuario
          const companyName = formData.get("company_name") as string;
          const companyEmail = (
            formData.get("company_email") as string
          )?.toLowerCase();
          const companyPhone = formData.get("company_cellphone") as string;
          const companyBornAtDate = new Date(
            formData.get("company_born_at") as string,
          );
          const companyNit = formData.get("nit") as string;

          // Validar el formato del teléfono
          const phoneRegex = /^\+\d{1,3}\s?\d{1,14}$/;
          if (!phoneRegex.test(companyPhone)) {
            toast.error(
              "El formato del teléfono debe ser: +código país número (Ej: +57 3001234567)",
            );
            return;
          }

          // Validar formato del NIT (debe tener guión y número de verificación)
          if (!companyNit.includes("-")) {
            toast.error(
              "El NIT debe incluir el número de verificación después del guión. Ejemplo: 123456789-0",
            );
            return;
          }

          const nitParts = companyNit.split("-");
          if (
            nitParts.length !== 2 ||
            nitParts[1].length !== 1 ||
            !/^\d$/.test(nitParts[1])
          ) {
            toast.error(
              "El número de verificación debe ser un solo dígito después del guión. Ejemplo: 123456789-0",
            );
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
            roles: ["BUSINESS"],
            profession: "Profesional independiente",
            skills: ["Ninguna"],
            cedula: "", // Cedula vacía para empresas
            profile_image: uploadedImageUrl, // Agregar la URL de la imagen subida
          };

          userEmail = userData.email;

          try {
            // Creamos primero el usuario
            console.log("Enviando datos de usuario:", userData);
            const userResponse = await UserService.createUser(userData);
            console.log(
              "👤 Respuesta de creación de usuario BUSINESS:",
              userResponse,
            );
            console.log(
              "🆔 ID del usuario BUSINESS creado:",
              userResponse.data.id,
            );
            createdUserId = userResponse.data.id
              ? Number(userResponse.data.id)
              : null;
            console.log(
              "🆔 createdUserId BUSINESS después de conversión:",
              createdUserId,
            );

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
                const companyResponse =
                  await CompanyService.createCompany(companyData);

                toast.success("Usuario y empresa creados correctamente");
              } catch (error: any) {
                const res = UserService.deleteUser(createdUserId.toString());
                console.error("Error específico:", error);
                if (error.response?.data?.message) {
                  // Si el backend devuelve un mensaje específico
                  toast.error(error.response.data.message);
                } else if (error.message) {
                  // Si es un error generado en el frontend
                  toast.error(error.message);
                } else {
                  // Mensaje genérico
                  toast.error("Error al crear la empresa");
                }
                return;
              }
            }
          } catch (error: any) {
            console.error("Error específico:", error);
            if (error.response?.data?.message) {
              // Si el backend devuelve un mensaje específico
              toast.error(error.response.data.message);
            } else if (error.message) {
              // Si es un error generado en el frontend
              toast.error(error.message);
            } else {
              // Mensaje genérico
              toast.error("Error al crear la empresa");
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
            await EmailVerificationService.sendVerificationEmail(
              createdUserId,
              userEmail,
            );
            console.log("✅ Email de verificación enviado exitosamente");
            setSuccess(
              "Cuenta creada exitosamente. Se ha enviado un email de verificación a tu correo.",
            );

            // Redirigir a la página de verificación de email después de 2 segundos
            setTimeout(() => {
              console.log("🔄 Redirigiendo a página de verificación...");
              router.push(
                `/auth/verify-email?email=${encodeURIComponent(userEmail)}`,
              );
            }, 2000);
          } catch (error: any) {
            console.error("❌ Error al enviar email de verificación:", error);
            console.error("📋 Detalles del error:", error.response?.data);
            setSuccess(
              "Cuenta creada exitosamente, pero hubo un problema al enviar el email de verificación. Puedes solicitarlo más tarde.",
            );

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
        toast.error(
          error.response?.data?.message || "Error al crear el usuario",
        );
      }
    });
  };

  // Validación en tiempo real de coincidencia de contraseñas
  const showPasswordMismatch =
    confirmPasswordTouched &&
    confirmPassword &&
    confirmPassword !==
      (document.getElementById("password") as HTMLInputElement)?.value;

  // Calcular la fecha máxima permitida para ser mayor de 18 años
  const today = new Date();
  const maxBirthDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );
  const maxBirthDateStr = maxBirthDate.toISOString().split("T")[0];

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
                {userType === "PERSON"
                  ? "Registro Personal"
                  : "Registro Empresarial"}
              </h2>
            </div>

            {/* Campos específicos por tipo de usuario */}
            {userType === "PERSON" ? (
              // Campos solo para PERSON
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="fullname"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    {formErrors.fullname && (
                      <p className="text-red-600 text-sm">
                        {formErrors.fullname}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    {formErrors.email && (
                      <p className="text-red-600 text-sm">{formErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="genre"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    {formErrors.genre && (
                      <p className="text-red-600 text-sm">{formErrors.genre}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                        className="pl-10 pr-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                        onChange={handlePasswordChange}
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
                    {/* Indicador de fortaleza de contraseña */}
                    <ul className="text-xs mt-1 space-y-0.5">
                      <li
                        className={
                          passwordStrength.length
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Mínimo 8 caracteres
                      </li>
                      <li
                        className={
                          passwordStrength.upper
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos una mayúscula
                      </li>
                      <li
                        className={
                          passwordStrength.lower
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos una minúscula
                      </li>
                      <li
                        className={
                          passwordStrength.number
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos un número
                      </li>
                      <li
                        className={
                          passwordStrength.special
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos un carácter especial
                      </li>
                    </ul>
                    {formErrors.password && (
                      <p className="text-red-600 text-sm">
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirmar contraseña{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="*******"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmPasswordTouched(true);
                        }}
                        onBlur={() => setConfirmPasswordTouched(true)}
                      />
                    </div>
                    {(showPasswordMismatch || formErrors.confirmPassword) && (
                      <p className="text-red-600 text-sm">
                        {showPasswordMismatch
                          ? "Las contraseñas no coinciden"
                          : formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="cedula"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="cedula"
                        name="cedula"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="1234567890"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                    {formErrors.cedula && (
                      <p className="text-red-600 text-sm">
                        {formErrors.cedula}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="cellphone"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    {formErrors.cellphone && (
                      <p className="text-red-600 text-sm">
                        {formErrors.cellphone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="born_at"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fecha de nacimiento{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="born_at"
                        name="born_at"
                        type="date"
                        max={maxBirthDateStr}
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                    {formErrors.born_at && (
                      <p className="text-red-600 text-sm">
                        {formErrors.born_at}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="profile_image"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Imagen de perfil (opcional)
                    </label>
                    <div className="relative">
                      <input
                        id="profile_image"
                        name="profile_image"
                        type="file"
                        accept="image/*"
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        onChange={handleFileChange}
                        disabled={isPending || isUploadingImage}
                      />
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">Subiendo imagen...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadedImageUrl && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✅ Imagen subida correctamente
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Campos solo para BUSINESS
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="nit"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                        placeholder="123456789-0"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Incluye el dígito de verificación después del guión (ej:
                      900123456-7)
                    </p>
                    {formErrors.nit && (
                      <p className="text-red-600 text-sm">{formErrors.nit}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre de la compañía{" "}
                      <span className="text-red-500">*</span>
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
                    {formErrors.company_name && (
                      <p className="text-red-600 text-sm">
                        {formErrors.company_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company_email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Correo electrónico de la compañía{" "}
                      <span className="text-red-500">*</span>
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
                    {formErrors.company_email && (
                      <p className="text-red-600 text-sm">
                        {formErrors.company_email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                        className="pl-10 pr-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                        onChange={handlePasswordChange}
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
                    {/* Indicador de fortaleza de contraseña */}
                    <ul className="text-xs mt-1 space-y-0.5">
                      <li
                        className={
                          passwordStrength.length
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Mínimo 8 caracteres
                      </li>
                      <li
                        className={
                          passwordStrength.upper
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos una mayúscula
                      </li>
                      <li
                        className={
                          passwordStrength.lower
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos una minúscula
                      </li>
                      <li
                        className={
                          passwordStrength.number
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos un número
                      </li>
                      <li
                        className={
                          passwordStrength.special
                            ? "text-green-600"
                            : "text-gray-500"
                        }
                      >
                        • Al menos un carácter especial
                      </li>
                    </ul>
                    {formErrors.password && (
                      <p className="text-red-600 text-sm">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="company_cellphone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Teléfono de la compañía{" "}
                      <span className="text-red-500">*</span>
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
                    {formErrors.company_cellphone && (
                      <p className="text-red-600 text-sm">
                        {formErrors.company_cellphone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company_born_at"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    {formErrors.company_born_at && (
                      <p className="text-red-600 text-sm">
                        {formErrors.company_born_at}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirmar contraseña{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={passwordVisible ? "text" : "password"}
                        placeholder="*******"
                        className="pl-10 w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                        disabled={isPending}
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmPasswordTouched(true);
                        }}
                        onBlur={() => setConfirmPasswordTouched(true)}
                      />
                    </div>
                    {(showPasswordMismatch || formErrors.confirmPassword) && (
                      <p className="text-red-600 text-sm">
                        {showPasswordMismatch
                          ? "Las contraseñas no coinciden"
                          : formErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="company_logo"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                        disabled={isPending || isUploadingImage}
                      />
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm">Subiendo imagen...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadedImageUrl && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✅ Imagen subida correctamente
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Previsualización de imagen */}
            {imagePreview && (
              <div className="mt-4 flex justify-center">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-[#097EEC]">
                  <Image
                    src={imagePreview.toString()}
                    alt="Vista previa"
                    width={128}
                    height={128}
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
              {formErrors.terms && (
                <p className="text-sm text-red-600">{formErrors.terms}</p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-8 space-y-3">
              <button
                type="submit"
                className="w-full bg-[#097EEC] text-white py-3 px-6 rounded-lg hover:bg-[#0A6BC7] transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPending || !acceptedTerms}
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No se ha seleccionado un tipo de usuario
            </h3>
            <p className="text-gray-600 mb-6">
              Debes seleccionar si eres una persona o una empresa para continuar
              con el registro.
            </p>
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
