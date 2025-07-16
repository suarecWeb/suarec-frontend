"use client";
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import Link from "next/link";
import { Comment } from "@/interfaces/comment.interface";
import Navbar from "@/components/navbar";
import CommentService from "@/services/CommentsService";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";

const CommentPageContent = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchComments = async (
    params: PaginationParams = { page: 1, limit: 10 },
  ) => {
    try {
      setLoading(true);
      const response = await CommentService.getComments(params);
      setComments(
        response.data.data.map((comment: any) => ({
          ...comment,
          publication: comment.publication || null,
          user: comment.user || null,
        })),
      );
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar los comentarios");
      console.error("Error al obtener comentarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handlePageChange = (page: number) => {
    fetchComments({ page, limit: pagination.limit });
  };

  const handleEdit = (id: string) => {
    // Implement edit logic
  };

  const handleDelete = async (id: string) => {
    try {
      await CommentService.deleteComment(id);
      // Recargar la página actual después de eliminar
      fetchComments({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center gap-5 p-24">
        <h1 className="text-2xl font-bold">Comentarios</h1>
        <Link
          href="/comment/create"
          className={buttonVariants({ variant: "default" })}
        >
          Crear comentario
        </Link>

        {loading && <p>Cargando comentarios...</p>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Contenido</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.id}</TableCell>
                  <TableCell>{comment.description}</TableCell>
                  <TableCell className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(comment.id ? comment.id : "1")}
                      className={buttonVariants({
                        variant: "default",
                        size: "sm",
                      })}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(comment.id ? comment.id : "1")
                      }
                      className={buttonVariants({
                        variant: "destructive",
                        size: "sm",
                      })}
                    >
                      Eliminar
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No hay comentarios disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {!loading && !error && comments.length > 0 && (
          <div className="text-sm text-gray-500 mt-4">
            Mostrando {comments.length} de {pagination.total} comentarios
          </div>
        )}
      </main>
    </>
  );
};

const CommentPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "PERSON"]}>
      <CommentPageContent />
    </RoleGuard>
  );
};

export default CommentPage;
