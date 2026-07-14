"use client";

import EventsManagement from "@/components/admin/EventsManagement";
import { EventoModalidad } from "@/interfaces/event.interface";

const EventosFisicosManagement = () => {
  return (
    <EventsManagement modoFisico filtroModalidad={EventoModalidad.FISICO} />
  );
};

export default EventosFisicosManagement;
