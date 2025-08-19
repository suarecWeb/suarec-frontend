"use client";

import React from "react";
import ServiceRequestForm from "@/components/ServiceRequestForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreateServiceRequestPage() {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success("Solicitud de servicio creada exitosamente");
    router.push("/service-requests");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Crear Solicitud de Servicio
        </h1>
        <p className="text-gray-600 mt-2">
          Describe el servicio que necesitas y encuentra al trabajador ideal
        </p>
      </div>

      <ServiceRequestForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
}
