'use client';
import { useEffect, useState } from "react";
import CommentService from "@/services/CommentsService";
import Navbar from "@/components/navbar";
import Link from "next/link";
import RoleGuard from "@/components/role-guard";

interface Comment {
  id: string;
  description: string;
  created_at: Date;
  publicationId: string;
  userId: string;
}

const CommentsPageContent = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = () => {
    setLoading(true);
    CommentService.getComments()
      .then((res:any) => {
        console.log("Respuesta del servicio:", res.data);
        // Verificar si la respuesta tiene la estructura esperada con paginación
        if (res.data && res.data.data && Array.isArray(res.data.data)) {
          setComments(res.data.data);
        } else if (Array.isArray(res.data)) {
          // Compatibilidad con la estructura anterior
          setComments(res.data);
        } else {
          console.error("Formato de respuesta inesperado:", res.data);
          setError("Error en el formato de los datos");
          setComments([]);
        }
      })
      .catch((err:any) => {
        console.error("Error al obtener comentarios:", err);
        setError("Error al cargar los comentarios");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id: string) => {
    CommentService.deleteComment(id)
      .then(() => {
        alert("Comentario eliminado correctamente");
        fetchComments(); // Recargar la lista de comentarios
      })
      .catch((err) => console.error("Error al eliminar comentario:", err));
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Comentarios</h2>
        <Link href={'/comments/create'}>
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Crear comentario
          </button>
        </Link>

        {loading && <p className="text-center py-4">Cargando comentarios...</p>}
        
        {error && (
          <div className="bg-red-800 border border-red-900 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ul className="space-y-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <li key={comment.id} className="p-4 bg-gray-800 rounded-lg shadow">
                <p className="text-blue-300">{comment.description}</p>
                <p className="text-sm text-gray-400">Publicación ID: {comment.publicationId}</p>
                <p className="text-sm text-gray-400">Usuario ID: {comment.userId}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => alert(`Editar comentario con ID: ${comment.id}`)}
                    className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 bg-gray-800 rounded-lg shadow text-center">
              No hay comentarios disponibles
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

// Componente principal con protección de roles
const CommentsPage = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'PERSON']}>
      <CommentsPageContent />
    </RoleGuard>
  );
};

export default CommentsPage;