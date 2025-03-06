'use client';
import { useEffect, useState } from "react";
import UserService from "@/services/UsersService";
import Navbar from "@/components/navbar";

export interface User {
  id?: string;
  email: string;
  password?: string;
  name: string;
  created_at: Date;
  roles: any[];
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    UserService.getUsers()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error al obtener usuarios:", err));
  };

  const handleDelete = (id: string) => {
    UserService.deleteUser(id)
      .then(() => {
        alert("Usuario eliminado correctamente");
        fetchUsers(); // Recargar la lista de usuarios
      })
      .catch((err) => console.error("Error al eliminar usuario:", err));
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Usuarios</h2>
        <button
          onClick={() => alert("Crear nuevo usuario")}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Crear Usuario
        </button>
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="p-4 bg-gray-800 rounded-lg shadow">
              <p className="text-blue-300">{user.name}</p>
              <p className="text-sm text-gray-400">Email: {user.email}</p>
              <p className="text-sm text-gray-400">Rol: {user.roles[0].name}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => alert(`Editar usuario con ID: ${user.id}`)}
                  className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id+'')}
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

export default UsersPage;