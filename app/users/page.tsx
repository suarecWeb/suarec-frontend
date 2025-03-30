'use client';
import { useEffect, useState } from "react";
import UserService, { PaginationParams, User } from "@/services/UsersService";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";

const UsersPageContent = () => {
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    try {
      setLoading(true);
      const response = await UserService.getUsers(params);
      
      // Asegurarse de que roles esté correctamente mapeado
      setUsers(
        response.data.data.map((user: any) => ({
          ...user,
          roles: user.roles || []
        }))
      );
      
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (page: number) => {
    fetchUsers({ page, limit: pagination.limit });
  };

  const handleDelete = async (id: string) => {
    try {
      await UserService.deleteUser(id);
      alert("Usuario eliminado correctamente");
      // Recargar la página actual después de eliminar
      fetchUsers({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
    }
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

        {loading && <p className="text-center py-4">Cargando usuarios...</p>}
        
        {error && (
          <div className="bg-red-800 border border-red-900 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ul className="space-y-2">
          {users.length > 0 ? (
            users.map((user) => (
              <li key={user.id} className="p-4 bg-gray-800 rounded-lg shadow">
                <p className="text-blue-300">{user.name}</p>
                <p className="text-sm text-gray-400">Email: {user.email}</p>
                <p className="text-sm text-gray-400">
                  Rol: {user.roles && user.roles.length > 0 ? user.roles[0] : 'No Rol'}
                </p>
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
            ))
          ) : (
            <li className="p-4 bg-gray-800 rounded-lg shadow text-center">
              No hay usuarios disponibles
            </li>
          )}
        </ul>
        
        {pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        
        {!loading && !error && users.length > 0 && (
          <div className="text-sm text-gray-400 mt-4 text-center">
            Mostrando {users.length} de {pagination.total} usuarios
          </div>
        )}
      </div>
    </>
  );
};

// Componente principal protegido con RoleGuard
const UsersPage = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <UsersPageContent />
    </RoleGuard>
  );
};

export default UsersPage;