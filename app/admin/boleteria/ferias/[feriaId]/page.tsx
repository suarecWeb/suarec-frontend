"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import EditFeriaModal from "@/components/admin/boleteria/ferias/EditFeriaModal";
import FeriasService from "@/services/FeriasService";
import { UpdateFeriaDto } from "@/interfaces/feria.interface";
import { useFeriaAdmin } from "@/hooks/useFeriaAdmin";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const FeriaPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const { feria, loading } = useFeriaAdmin(Number(params.feriaId));

  const volverALista = () => router.push("/admin/boleteria/ferias");

  const handleSubmit = async (
    id: number,
    dto: UpdateFeriaDto,
    imageFile?: File,
  ) => {
    await FeriasService.updateFeria(id, dto, imageFile);
    toast.success("Feria actualizada");
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4 flex items-center gap-3">
            <Link href="/admin/boleteria/ferias" passHref>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Volver a Ferias"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{feria?.nombre ?? "Feria"}</h1>
              <p className="mt-2 text-blue-100">
                Datos de la feria y forma del escenario
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            {loading || !feria ? (
              <div className="py-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent" />
              </div>
            ) : (
              <EditFeriaModal
                feria={feria}
                onClose={volverALista}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeriaPage = () => (
  <RoleGuard allowedRoles={["ADMIN"]}>
    <FeriaPageContent />
  </RoleGuard>
);

export default FeriaPage;
