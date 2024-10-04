// app/publication/page.tsx
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function PublicationPage() {
  return (
    <>
    <Navbar />
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Publicaciones</h1>
      <p className="mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <Link href="/publication/create" className="bg-blue-500 text-white px-4 py-2 rounded-md">
        Crear
      </Link>
      <table className="w-full mt-8 border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Título</th>
            <th className="border border-gray-300 px-4 py-2">Autor</th>
            <th className="border border-gray-300 px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Aquí se mapearán los registros de las publicaciones */}
          <tr>
            <td className="border border-gray-300 px-4 py-2">Publicación 1</td>
            <td className="border border-gray-300 px-4 py-2">Autor 1</td>
            <td className="border border-gray-300 px-4 py-2">
              <button className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2">Editar</button>
              <button className="bg-red-500 text-white px-2 py-1 rounded-md">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
    </>
  );
}
