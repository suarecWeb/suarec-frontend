"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import toast from "react-hot-toast";
import { logOut } from "@/actions/log-out";

const MobileMenuFooter = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/");
    } catch (e) {
      toast.error("No se pudo cerrar sesión");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Link
        href="/profile"
        className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 transition-all duration-300 font-eras-medium"
      >
        <User className="h-5 w-5" />
        <span>Mi Perfil</span>
      </Link>

      <Link
        href="/profile/edit"
        className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 transition-all duration-300 font-eras-medium"
      >
        <Settings className="h-5 w-5" />
        <span>Configuración</span>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 py-3 px-4 text-lg justify-start rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-300 font-eras-medium"
      >
        <LogOut className="h-5 w-5" />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};

export default MobileMenuFooter;
