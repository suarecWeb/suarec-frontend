"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import MessageService from "@/services/MessageService";
import { Message } from "@/interfaces/message.interface";
import toast from "react-hot-toast";

interface CreateTicketButtonProps {
  onTicketCreated?: (ticket: Message) => void;
}

export default function CreateTicketButton({
  onTicketCreated,
}: CreateTicketButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTicket = async () => {
    const normalizedSubject = subject.trim();
    const normalizedDescription = description.trim();
    if (!normalizedSubject || !normalizedDescription || isLoading) return;

    setIsLoading(true);
    try {
      const response = await MessageService.createSupportTicket({
        subject: normalizedSubject,
        description: normalizedDescription,
      });

      setIsOpen(false);
      setSubject("");
      setDescription("");
      onTicketCreated?.(response.data);
    } catch (error) {
      const requestError = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = requestError.response?.data?.message;
      toast.error(
        Array.isArray(message)
          ? message.join(". ")
          : message || "Error al crear el ticket",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-[#097EEC] hover:bg-[#0A6BC7] text-white">
          🎫 Crear Nuevo Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Ticket de Soporte</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="ticket-subject" className="text-sm font-medium">
              Asunto
            </label>
            <input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Resume brevemente tu solicitud"
              maxLength={120}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="ticket-description" className="text-sm font-medium">
              Describe tu problema
            </label>
            <Textarea
              id="ticket-description"
              placeholder="Explica detalladamente el problema que necesitas resolver..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
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
            disabled={!subject.trim() || !description.trim() || isLoading}
            className="bg-[#097EEC] hover:bg-[#0A6BC7] text-white"
          >
            {isLoading ? "Creando..." : "Crear Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
