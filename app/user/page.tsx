'use client'
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import Link from "next/link";
import { User } from "@/interfaces/user.interface";

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users from API
    // setUsers(fetchedUsers);
  }, []);

  const handleEdit = (id: string) => {
    // Implement edit logic
  };

  const handleDelete = (id: string) => {
    // Implement delete logic
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-5 p-24">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <Link href="/user/create" className={buttonVariants({ variant: "default" })}>Crear Usuario</Link>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                <button onClick={() => handleEdit(user.id)} className={buttonVariants({ variant: "default" })}>Editar</button>
                <button onClick={() => handleDelete(user.id)} className={buttonVariants({ variant: "destructive" })}>Eliminar</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
};

export default UserPage;
