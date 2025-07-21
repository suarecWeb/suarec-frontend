"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CommentService from "@/services/CommentsService";
import Navbar from "@/components/navbar";
import toast from "react-hot-toast";

const CreateCommentPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: "",
    created_at: new Date().toISOString(),
    publicationId: "",
    userId: "", // Aquí deberías obtener el userId del contexto o sesión
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CommentService.createComment({
        ...formData,
        created_at: new Date(formData.created_at), // Convertir a Date
      });
      toast.success("Comentario creado correctamente");
      router.push("/comments");
    } catch (error) {
      toast.error("Error al crear el comentario");
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">
          Crear Comentario
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Publicación ID
            </label>
            <input
              type="text"
              name="publicationId"
              value={formData.publicationId}
              onChange={handleChange}
              className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Usuario ID
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Crear comentario
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateCommentPage;
