"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useWebSocket } from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth";

interface CreateTicketButtonProps {
  onTicketCreated?: (ticket: any) => void;
}

interface Ticket {
  id: string;
  content: string;
  status: string;
  ticket_id: string;
  sender: any;
  recipient: any;
  sent_at: string;
}

export default function CreateTicketButton({ onTicketCreated }: CreateTicketButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useWebSocket();
  const { user } = useAuth();

  console.log("🎫 CreateTicketButton renderizado:", { 
    socket: !!socket, 
    user: !!user, 
    isOpen, 
    isLoading 
  });

  const handleCreateTicket = async () => {
    console.log("🎫 handleCreateTicket llamado:", { 
      content: content.trim(), 
      socket: !!socket, 
      user: !!user 
    });

    if (!content.trim() || !socket || !user) {
      console.log("❌ Validación fallida:", { 
        hasContent: !!content.trim(), 
        hasSocket: !!socket, 
        hasUser: !!user 
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("🎫 Emitiendo create_ticket:", {
        userId: user.id,
        content: content.trim(),
      });

      socket.emit("create_ticket", {
        userId: user.id,
        content: content.trim(),
      });

      // Escuchar la respuesta
      socket.once("ticket_created", (ticket: Ticket) => {
        console.log("🎫 Ticket creado:", ticket);
        setIsOpen(false);
        setContent("");
        onTicketCreated?.(ticket);
      });

      socket.once("error", (error: { message: string }) => {
        console.error("❌ Error al crear ticket:", error);
        alert(error.message || "Error al crear el ticket");
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear el ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-[#097EEC] hover:bg-[#0A6BC7] text-white"
          onClick={() => console.log("🎫 Botón CreateTicketButton clickeado")}
        >
          🎫 Crear Nuevo Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Ticket de Soporte</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="content" className="text-sm font-medium">
              Describe tu problema
            </label>
            <Textarea
              id="content"
              placeholder="Explica detalladamente el problema que necesitas resolver..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateTicket} 
            disabled={!content.trim() || isLoading}
            className="bg-[#097EEC] hover:bg-[#0A6BC7] text-white"
          >
            {isLoading ? "Creando..." : "Crear Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 