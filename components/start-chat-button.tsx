"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MessageService from "@/services/MessageService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { MessageSquare, Loader2 } from "lucide-react";

interface StartChatButtonProps {
  recipientId: number;
  recipientName: string;
  className?: string;
}

const StartChatButton = ({ recipientId, recipientName, className = "" }: StartChatButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    try {
      setLoading(true);
      
      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const decoded = jwtDecode<TokenPayload>(token);
      const currentUserId = decoded.id;

      if (currentUserId === recipientId) {
        alert("No puedes chatear contigo mismo");
        return;
      }

      // Validar que recipientId sea un número válido
      if (!recipientId || isNaN(recipientId)) {
        console.error("recipientId inválido:", recipientId);
        alert("Error: ID de destinatario inválido");
        return;
      }

      // Crear un mensaje inicial
      const initialMessage = `¡Hola ${recipientName}! Me interesa conocer más información.`;
      
      console.log("Enviando mensaje:", {
        content: initialMessage,
        senderId: currentUserId,
        recipientId: recipientId,
      });

      const response = await MessageService.createMessage({
        content: initialMessage,
        senderId: currentUserId,
        recipientId: recipientId,
      });

      console.log("Mensaje enviado exitosamente:", response);

      // Redirigir al chat
      router.push("/chat");
    } catch (error: any) {
      console.error("Error al iniciar chat:", error);
      
      // Mostrar más detalles del error
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Status:", error.response.status);
        alert(`Error al enviar mensaje: ${error.response.data.message || 'Error desconocido'}`);
      } else {
        alert("Error al enviar mensaje. Verifica tu conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4" />
      )}
      <span>{loading ? "Enviando..." : "Enviar mensaje"}</span>
    </button>
  );
};

export default StartChatButton;