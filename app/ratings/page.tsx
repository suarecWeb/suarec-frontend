"use client";
import { useState, useEffect } from "react";
import { Star, User, Calendar, MessageSquare } from "lucide-react";
import RatingService, {
  ContractReadyForRating,
} from "@/services/RatingService";
import RatingModal from "@/components/RatingModal";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Navbar from "@/components/navbar";

export default function RatingsPage() {
  const [contracts, setContracts] = useState<ContractReadyForRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] =
    useState<ContractReadyForRating | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await RatingService.getContractsReadyForRating();
      setContracts(data);
    } catch (error: any) {
      toast.error("Error al cargar los contratos");
      console.error("Error loading contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateContract = (contract: ContractReadyForRating) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContract(null);
    // Recargar contratos después de calificar
    loadContracts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 pb-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#097EEC] mx-auto"></div>
              <p className="mt-4 text-gray-600 font-eras">
                Cargando contratos...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header azul extendido como en feed */}
      <div className="bg-[#097EEC] text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-eras-bold">
            Calificaciones pendientes
          </h1>
          <p className="mt-2 text-blue-100 font-eras text-sm md:text-base">
            Califica a los usuarios con los que has trabajado para ayudar a la
            comunidad
          </p>
        </div>
      </div>

      {/* Content con margen negativo para que se superponga */}
      <div className="container mx-auto px-4 -mt-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {contracts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-eras-bold text-gray-900 mb-2">
                No hay contratos pendientes de calificación
              </h3>
              <p className="text-gray-600 font-eras">
                Cuando completes un trabajo y se procese el pago, podrás
                calificar al otro usuario aquí.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => (
                <div
                  key={contract.contractId}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#097EEC] rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-eras-bold text-gray-900">
                        {contract.otherUser.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-eras">
                        {contract.userRole === "CLIENT"
                          ? "Proveedor"
                          : "Cliente"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-eras-medium text-gray-900 mb-1">
                      {contract.contractTitle}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 font-eras">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(contract.completedAt).toLocaleDateString(
                        "es-ES",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRateContract(contract)}
                    className="w-full bg-[#097EEC] text-white py-2 px-4 rounded-md hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2 font-eras-medium"
                  >
                    <Star className="h-4 w-4" />
                    Calificar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedContract && currentUserId && (
        <RatingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          contractId={selectedContract.contractId}
          contractTitle={selectedContract.contractTitle}
          otherUser={selectedContract.otherUser}
          userRole={selectedContract.userRole}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
