"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const FeedPublicationDetail = () => {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      // Redirigir a la página de detalle de publicación existente
      router.replace(`/publications/${params.id}`);
    }
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default FeedPublicationDetail;
