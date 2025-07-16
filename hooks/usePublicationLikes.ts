import { useState, useEffect } from "react";
import PublicationLikeService from "@/services/PublicationLikeService";

interface UsePublicationLikesProps {
  publicationId: string;
  initialLikesCount?: number;
  initialHasLiked?: boolean;
}

export const usePublicationLikes = ({
  publicationId,
  initialLikesCount = 0,
  initialHasLiked = false,
}: UsePublicationLikesProps) => {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar estado inicial de likes
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const [countResponse, userLikeResponse] = await Promise.all([
          PublicationLikeService.getPublicationLikesCount(publicationId),
          PublicationLikeService.checkUserLike(publicationId),
        ]);

        setLikesCount(countResponse.count);
        setHasLiked(userLikeResponse.hasLiked);
      } catch (error) {
        console.error("Error al cargar estado de likes:", error);
      }
    };

    loadLikeStatus();
  }, [publicationId]);

  const toggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (hasLiked) {
        // Quitar like
        await PublicationLikeService.unlikePublication(publicationId);
        setHasLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Dar like
        await PublicationLikeService.likePublication(publicationId);
        setHasLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error al manejar like:", error);
      // Revertir cambios en caso de error
      setHasLiked(!hasLiked);
      setLikesCount((prev) => (hasLiked ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likesCount,
    hasLiked,
    isLoading,
    toggleLike,
  };
};
