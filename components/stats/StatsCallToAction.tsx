import { Briefcase, DollarSign, Users } from "lucide-react";

interface StatsCallToActionProps {
  totalEarnings: number;
}

export const StatsCallToAction: React.FC<StatsCallToActionProps> = ({
  totalEarnings,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] rounded-xl p-8 text-white text-center">
      <h3 className="text-2xl font-bold mb-4">
        {totalEarnings > 0
          ? "¡Sigue Creciendo con SUAREC!"
          : "¡Tu Potencial te Espera!"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/10 rounded-lg p-4">
          <Briefcase className="h-8 w-8 mx-auto mb-2" />
          <h4 className="font-semibold mb-2">Más Contratos</h4>
          <p className="text-sm text-blue-100">
            Publica más servicios para atraer nuevos clientes
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <DollarSign className="h-8 w-8 mx-auto mb-2" />
          <h4 className="font-semibold mb-2">Mayores Ingresos</h4>
          <p className="text-sm text-blue-100">
            Optimiza tus precios y ofrece servicios premium
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <Users className="h-8 w-8 mx-auto mb-2" />
          <h4 className="font-semibold mb-2">Más Clientes</h4>
          <p className="text-sm text-blue-100">
            Mejora tu perfil y obtén mejores calificaciones
          </p>
        </div>
      </div>
      <p className="text-blue-100">
        Con SUAREC, cada día es una nueva oportunidad de crecer profesionalmente
        y aumentar tus ingresos.
      </p>
    </div>
  );
};
