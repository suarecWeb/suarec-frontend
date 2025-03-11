'use client';
import { useEffect, useState } from "react";
import PublicationService from "@/services/PublicationsService";
import Navbar from "@/components/navbar";
import Link from "next/link";


interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: Date;
  modified_at: Date;
  category: string;
  image_url?: string;
  visitors?: number;
  userId: string;
}


const PublicationsPage = () => {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = () => {
    PublicationService.getPublications()
      .then((res) => setPublications(res.data))
      .catch((err) => console.error("Error al obtener publicaciones:", err));
  };

  const handleDelete = (id: string) => {
    PublicationService.deletePublication(id)
      .then(() => {
        alert("Publicación eliminada correctamente");
        fetchPublications(); // Recargar la lista de publicaciones
      })
      .catch((err) => console.error("Error al eliminar publicación:", err));
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Publicaciones</h2>
        <Link href={'/publications/create'}>
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Crear Publicación
        </button>
        </Link>
        <ul className="space-y-2">
          {publications.map((publication) => (
            <li key={publication.id} className="p-4 bg-gray-800 rounded-lg shadow">
              <p className="text-blue-300">{publication.title}</p>
              <p className="text-sm text-gray-400">{publication.description}</p>
              <p className="text-sm text-gray-400">Categoría: {publication.category}</p>
              <p className="text-sm text-gray-400">Visitas: {publication.visitors || 0}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => alert(`Editar publicación con ID: ${publication.id}`)}
                  className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(publication.id+'')}
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

export default PublicationsPage;