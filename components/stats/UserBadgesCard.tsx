import { Award, Lock } from "lucide-react";
import { UserBadge, Badge } from "@/interfaces/badge.interface";

interface UserBadgesCardProps {
  userBadges: UserBadge[];
  catalogBadges?: Badge[];
}

const getBadgeTypeColor = (type: string) => {
  return type === "LEVEL"
    ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300"
    : "bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300";
};

export const UserBadgesCard: React.FC<UserBadgesCardProps> = ({
  userBadges,
  catalogBadges = [],
}) => {
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));
  const lockedBadges = catalogBadges.filter((b) => !earnedBadgeIds.has(b.id));

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Award className="h-6 w-6 text-[#097EEC]" />
        Tus Insignias
      </h3>

      {/* Earned Badges */}
      {userBadges.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {userBadges.map((userBadge) => (
              <div
                key={userBadge.id}
                className={`${getBadgeTypeColor(userBadge.badge.type)} rounded-xl p-4 border-2 text-center transition-transform hover:scale-105`}
              >
                <div className="text-4xl mb-2">{userBadge.badge.icon}</div>
                <h4 className="font-bold text-sm mb-1">
                  {userBadge.badge.name}
                </h4>
                <p className="text-xs text-gray-600 mb-2">
                  {userBadge.badge.description}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(userBadge.awarded_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Por Desbloquear
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-gray-100 rounded-xl p-4 border-2 border-gray-300 text-center opacity-60"
                  >
                    <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                    <h4 className="font-bold text-sm mb-1 text-gray-700">
                      {badge.name}
                    </h4>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    {badge.level_required && (
                      <span className="text-xs text-gray-400 mt-2 block">
                        Requiere: {badge.level_required}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <h4 className="font-bold text-gray-700 mb-2">¡Comienza tu Viaje!</h4>
          <p className="text-sm text-gray-600">
            Completa contratos y mejora tu desempeño para ganar insignias
          </p>
        </div>
      )}
    </div>
  );
};
