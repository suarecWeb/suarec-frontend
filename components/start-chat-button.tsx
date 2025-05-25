"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MessageService from "@/services/MessageService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";

interface StartChatButtonProps {
  recipientId: number;
  recipientName: string;
  className?: string;
}

const StartChatButton = ({ recipientId, recipientName, className = "" }: StartChatButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartChat = async () => {
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
        setError("No puedes iniciar un chat contigo mismo");
        setTimeout(() => setError(null), 5000);
        return;
      }

      if (!recipientId || isNaN(recipientId)) {
        setError("ID de destinatario inválido");
        setTimeout(() => setError(null), 5000);
        return;
      }

      const initialMessage = `¡Hola ${recipientName}! Me interesa conocer más información.`;
      
      await MessageService.createMessage({
        content: initialMessage,
        senderId: currentUserId,
        recipientId: recipientId,
      });

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

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleStartChat}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
        <span>{loading ? "Enviando..." : "Enviar mensaje"}</span>
      </button>

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