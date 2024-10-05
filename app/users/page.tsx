// app/user/page.tsx
'use client'

import Link from "next/link";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";
import { getUsers } from "@/actions/get-users"; // Asegúrate de que la ruta sea correcta
import { getToken } from "@/actions/get-token"; // Asegúrate de que la ruta sea correcta
import { User } from "@/interfaces/user.interface"; // Asegúrate de que la ruta sea correcta

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]); // Estado para almacenar los usuarios
  const [loading, setLoading] = useState(true); // Estado de carga
  let token = undefined;

  useEffect(() => {
    const fetchUsers = async () => {
      token = await getToken(); // Obtener el token

      if (token) {
        const userList = await getUsers(token); // Llamar a la función getUsers
        setUsers(userList); // Almacenar los usuarios en el estado
        setLoading(false); // Cambiar el estado de carga
      }
    };

    fetchUsers(); // Llamar a la función para obtener los usuarios
  }, []);

  return (
    <>
      <Navbar />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

        {token ? 
        <>
        <p className="mb-4">
          No estás autorizado para ver esta información.
        </p>
        </>
        :
          <>
          </>
        }

        <>
        {loading ? ( // Mostrar un mensaje de carga mientras se obtienen los usuarios
          <p>Cargando usuarios...</p>
        ) : (
          <table className="w-full mt-8 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Nombre</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link href={`/user/edit/${user.id}`} className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2">Editar</Link>
                      <button className="bg-red-500 text-white px-2 py-1 rounded-md">Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-gray-300 px-4 py-2 text-center">
                    No hay usuarios disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        </>
      </main>
    </>
  );
}
