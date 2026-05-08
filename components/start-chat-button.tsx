"use client";
//para el saludo y enviar un mensaje, para cualquier persona en cualquier parte de la app
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import MessageService from "@/services/MessageService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  ChevronDown,
  X,
  User,
  Briefcase,
  FileText,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";

interface StartChatButtonProps {
  recipientId: number;
  recipientName: string;
  recipientType?: "person" | "business"; // Para personalizar los mensajes
  context?: "profile" | "job" | "application" | "general"; // Contexto de donde se usa
  className?: string;
  buttonClassName?: string;
  variant?: "primary" | "outline"; // Para estilos adicionales si es necesario
}

interface MessageTemplate {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  description: string;
}

const StartChatButton = ({
  recipientId,
  recipientName,
  recipientType = "person",
  context = "general",
  className = "",
  buttonClassName = "",
  variant = "primary",
}: StartChatButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const router = useRouter();

  // Generar templates basados en el contexto y tipo de destinatario
  const getMessageTemplates = (): MessageTemplate[] => {
    const baseTemplates: MessageTemplate[] = [];

    if (context === "profile" && recipientType === "person") {
      baseTemplates.push(
        {
          id: "service_request",
          title: "Solicitar servicio",
          message: `¡Hola ${recipientName}! He visto tu perfil y me interesa contratar tus servicios. ¿Podrías contarme más sobre lo que ofreces?`,
          icon: <Briefcase className="h-4 w-4" />,
          description: "Contratar servicios profesionales",
        },
        {
          id: "service_offer",
          title: "Ofrecer trabajo",
          message: `Hola ${recipientName}, tengo un proyecto que creo sería perfecto para tus habilidades. ¿Te interesaría conocer los detalles?`,
          icon: <FileText className="h-4 w-4" />,
          description: "Proponer un proyecto o trabajo",
        },
        {
          id: "networking",
          title: "Networking profesional",
          message: `¡Hola ${recipientName}! Me parece muy interesante tu perfil profesional. Me gustaría conectar contigo para posibles colaboraciones futuras.`,
          icon: <User className="h-4 w-4" />,
          description: "Establecer contacto profesional",
        },
      );
    } else if (context === "application") {
      baseTemplates.push(
        {
          id: "application_interest",
          title: "Interés en postulación",
          message: `Hola ${recipientName}, he visto que te postulaste para nuestra oferta laboral. Me gustaría conocer más sobre tu experiencia y motivación.`,
          icon: <Briefcase className="h-4 w-4" />,
          description: "Seguimiento de postulación",
        },
        {
          id: "interview_invitation",
          title: "Invitación a entrevista",
          message: `¡Hola ${recipientName}! Tu perfil nos ha llamado mucho la atención. ¿Estarías disponible para una entrevista sobre la posición?`,
          icon: <User className="h-4 w-4" />,
          description: "Invitar a proceso de selección",
        },
        {
          id: "job_details",
          title: "Detalles del puesto",
          message: `Hola ${recipientName}, me gustaría contarte más detalles sobre la posición y el proceso de selección. ¿Tienes tiempo para conversar?`,
          icon: <FileText className="h-4 w-4" />,
          description: "Información adicional del trabajo",
        },
      );
    } else if (recipientType === "business") {
      baseTemplates.push(
        {
          id: "job_inquiry",
          title: "Consulta sobre empleo",
          message: `Hola ${recipientName}, estoy interesado/a en las oportunidades laborales disponibles en su empresa. ¿Podrían proporcionarme más información?`,
          icon: <Briefcase className="h-4 w-4" />,
          description: "Preguntar sobre vacantes",
        },
        {
          id: "service_proposal",
          title: "Propuesta de servicios",
          message: `¡Hola ${recipientName}! Ofrezco servicios que podrían ser de interés para su empresa. Me gustaría presentarles mi propuesta.`,
          icon: <FileText className="h-4 w-4" />,
          description: "Ofrecer servicios profesionales",
        },
      );
    }

    // Mensaje general siempre disponible
    baseTemplates.push({
      id: "general",
      title: "Saludo profesional",
      message: `¡Hola ${recipientName}! ¿Cómo estás? Me gustaría conversar contigo cuando tengas un momento libre. ¿Te parece bien?`,
      icon: <MessageSquare className="h-4 w-4" />,
      description: "Mensaje de presentación general",
    });

    return baseTemplates;
  };

  const messageTemplates = getMessageTemplates();

  const handleStartChat = async (messageContent?: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const decoded = jwtDecode<TokenPayload>(token);
      const currentUserId = decoded.id;

      if (currentUserId === recipientId) {
        toast.error("No puedes iniciar un chat contigo mismo");
        return;
      }

      if (!recipientId || isNaN(recipientId)) {
        toast.error("ID de destinatario inválido");
        return;
      }

      const finalMessage =
        messageContent ||
        customMessage ||
        `¡Hola ${recipientName}! Me interesa conocer más información.`;

      const messageData = {
        content: finalMessage,
        senderId: currentUserId,
        recipientId: recipientId,
      };

      console.log(
        "🔍 Datos que se van a enviar:",
        JSON.stringify(messageData, null, 2),
      );

      await MessageService.createMessage(messageData);

      // Forzar recarga de conversaciones después de enviar el mensaje
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      router.push("/chat");
    } catch (error: any) {
      console.error("Error al iniciar chat:", error);

      let errorMessage = "Error al enviar mensaje. Inténtalo de nuevo.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMessage = (template: MessageTemplate) => {
    setSelectedMessage(template.message);
    setShowOptions(false);
    handleStartChat(template.message);
  };

  return (
    <div className={`relative flex flex-col gap-2 ${className}`}>
      {/* Botón principal */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium
            ${variant === "primary" ? "bg-[#097EEC] text-white hover:bg-[#0A6BC7]" : "border border-gray-300 bg-white text-black hover:bg-gray-50"} 
            disabled:opacity-50 disabled:cursor-not-allowed ${loading ? "cursor-not-allowed" : ""} ${buttonClassName}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          <span>{loading ? "Enviando..." : "Enviar mensaje"}</span>
        </button>
      </div>

      {/* Modal de opciones */}
      {showOptions &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              style={{ zIndex: 9999 }}
              onClick={() => setShowOptions(false)}
              aria-hidden="true"
            />

            {/* Modal */}
            <div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 10000 }}
            >
              <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-medium text-gray-800">
                    Elige cómo iniciar la conversación
                  </h3>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Templates predefinidos */}
                  {messageTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleQuickMessage(template)}
                      disabled={loading}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-[#097EEC] hover:bg-blue-50 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-[#097EEC]/10 rounded-lg group-hover:bg-[#097EEC]/20 transition-colors">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm mb-1">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            {template.description}
                          </p>
                          <p className="text-sm text-gray-600 italic leading-relaxed">
                            {template.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Mensaje personalizado */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      O escribe un mensaje personalizado:
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder={`Escribe tu mensaje para ${recipientName}...`}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none resize-none text-sm"
                        rows={4}
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {customMessage.length}/500 caracteres
                        </span>
                        <button
                          onClick={() => handleStartChat()}
                          disabled={loading || !customMessage.trim()}
                          className="px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          <Send className="h-3 w-3" />
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StartChatButton;
