"use client";

import Link from "next/link";
import { User as UserIcon, Star } from "lucide-react";
import { UserAvatarDisplay } from "@/components/ui/UserAvatar";
import { User } from "@/interfaces/user.interface";

interface AuthorProps {
  author: User | null;
  publicationType: string;
  userRatingStats?: {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: { [key: number]: number };
    categoryStats: { [category: string]: { average: number; count: number } };
  } | null;
  isLoadingRatings?: boolean;
}

export const Author = ({
  author,
  publicationType,
  userRatingStats,
  isLoadingRatings,
}: AuthorProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#097EEC] rounded-full"></span>
        {publicationType === "SERVICE_REQUEST"
          ? "Información del Solicitante"
          : "Información del Proveedor"}
      </h3>

      {author ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {author.id && author.id !== "" && author.id !== "undefined" ? (
              <Link
                href={`/profile/${author.id}`}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <UserAvatarDisplay
                  user={{
                    id: author.id
                      ? typeof author.id === "string"
                        ? parseInt(author.id)
                        : author.id
                      : 0,
                    name: author.name,
                    profile_image: author.profile_image,
                  }}
                  size="lg"
                />
              </Link>
            ) : (
              <UserAvatarDisplay
                user={{
                  id: author.id
                    ? typeof author.id === "string"
                      ? parseInt(author.id)
                      : author.id
                    : 0,
                  name: author.name,
                  profile_image: author.profile_image,
                }}
                size="lg"
              />
            )}
            <div>
              {author.id && author.id !== "" && author.id !== "undefined" ? (
                <Link
                  href={`/profile/${author.id}`}
                  className="hover:text-[#097EEC] transition-colors cursor-pointer"
                >
                  <p className="font-semibold text-gray-800">{author.name}</p>
                </Link>
              ) : (
                <p className="font-semibold text-gray-800">{author.name}</p>
              )}
              {author.profession && (
                <p className="text-sm text-gray-600">{author.profession}</p>
              )}
            </div>
          </div>

          {author.skills && author.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Habilidades:
              </p>
              <div className="flex flex-wrap gap-2">
                {author.skills
                  .slice(0, 5)
                  .map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                {author.skills.length > 5 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                    +{author.skills.length - 5} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Rating section */}
          {userRatingStats && userRatingStats.totalRatings > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= userRatingStats.averageRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({userRatingStats.averageRating.toFixed(1)})
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {userRatingStats.totalRatings} calificación
                {userRatingStats.totalRatings !== 1 ? "es" : ""}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          <UserIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>Información del proveedor no disponible</p>
        </div>
      )}
    </div>
  );
};
