'use client';
import { useEffect, useState } from "react";
import CommentService from "@/services/CommentsService";
import Navbar from "@/components/navbar";
import Link from "next/link";

interface Comment {
  id: string;
  description: string;
  created_at: Date;
  publicationId: string;
  userId: string;
}

const CommentsPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = () => {
    CommentService.getComments()
      .then((res:any) => setComments(res.data))
      .catch((err:any) => console.error("Error al obtener comentarios:", err));
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
          Crear Comentario
        </button>
        </Link>
        <ul className="space-y-2">
          {comments.map((comment) => (
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
          ))}
        </ul>
      </div>
    </>
  );
};

export default CommentsPage;