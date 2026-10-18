"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import RecintosService from "@/services/RecintosService";
import { Recinto } from "@/interfaces/recinto.interface";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Cargando = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent" />
  </div>
);

// Konva usa canvas y solo corre en el navegador; ademas asi su codigo
// se descarga solo en esta pagina
const RecintoEditor = dynamic(
  () => import("@/components/admin/boleteria/recintos/editor/RecintoEditor"),
  { ssr: false, loading: Cargando },
);

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const RecintoEditorPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const recintoId = Number(params.recintoId);
  const [recinto, setRecinto] = useState<Recinto | null>(null);

  useEffect(() => {
    const volverALista = (mensaje: string) => {
      toast.error(mensaje);
      router.replace("/admin/boleteria/recintos");
    };

    if (Number.isNaN(recintoId)) {
      volverALista("ID de recinto inválido");
      return;
    }

    RecintosService.getRecintoById(recintoId)
      .then((res) => setRecinto(res.data))
      .catch(() => volverALista("No se pudo cargar el recinto"));
  }, [recintoId, router]);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4 flex items-center gap-3">
            <Link href="/admin/boleteria/recintos" passHref>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Volver a Recintos"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {recinto?.nombre ?? "Recinto"}
              </h1>
              <p className="mt-2 text-blue-100">
                Editor del recinto
                {recinto?.creadoPor &&
                  ` · creado por ${recinto.creadoPor.name}`}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden">
            {recinto ? <RecintoEditor recinto={recinto} /> : <Cargando />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RecintoEditorPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <RecintoEditorPageContent />
  </RoleGuard>
);

export default RecintoEditorPage;
