"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ApplicationService from "@/services/ApplicationService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { Briefcase, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ApplyCompanyButtonProps {
  companyId: string;
  companyName: string;
  companyUserId: number;
  className?: string;
}

const ApplyCompanyButton = ({
  companyId,
  companyName,
  companyUserId,
  className = "",
}: ApplyCompanyButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const router = useRouter();

  const handleApply = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const decoded = jwtDecode<TokenPayload>(token);

      const hasPersonRole = decoded.roles.some(
        (role) => role.name === "PERSON",
      );
      if (!hasPersonRole) {
        toast.error(
          "Debes tener un rol de 'Persona' para postularte a una empresa.",
        );
        return;
      }

      if (decoded.id === companyUserId) {
        toast.error("No puedes postularte a tu propia empresa");
        return;
      }

      await ApplicationService.createApplication({ companyId });

      setApplied(true);
      toast.success(`¡Postulación enviada a ${companyName}!`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      if (msg.includes("activa") || error?.response?.status === 400) {
        toast.error("Ya tienes una postulación pendiente con esta empresa.");
      } else {
        toast.error("Error al enviar la postulación. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg ${className}`}
      >
        <CheckCircle className="h-4 w-4" />
        <span>¡Postulación enviada!</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Briefcase className="h-4 w-4" />
      )}
      <span>{loading ? "Enviando..." : "Postularme"}</span>
    </button>
  );
};

export default ApplyCompanyButton;
