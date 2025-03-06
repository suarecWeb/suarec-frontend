'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicationService from "@/services/PublicationsService";
import Navbar from "@/components/navbar";

const CreatePublicationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    category: "",
    image_url: "",
    visitors: 0,
    userId: "", // Aquí deberías obtener el userId del contexto o sesión
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await PublicationService.createPublication({
        ...formData,
        created_at: new Date(formData.created_at), // Convertir a Date
        modified_at: new Date(formData.modified_at), // Convertir a Date
      });
      alert("Publicación creada correctamente");
      router.push("/publications");
    } catch (error) {
      console.error("Error al crear la publicación:", error);
      alert("Error al crear la publicación");
    }
  };

  return (
    <>
        <Navbar/>
        <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-semibold text-blue-400 mb-4">Crear Publicación</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Categoría</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">URL de la Imagen</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="mt-1 p-2 w-full bg-gray-800 text-white rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Usuario ID</label>
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
          Crear Publicación
        </button>
      </form>
    </div>
    </> 
  );
};

export default CreatePublicationPage;