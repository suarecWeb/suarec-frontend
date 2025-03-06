import { useEffect, useState } from "react";
import UserService from "@/services/UsersService";

interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  role: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    UserService.getUsers().then((res: any) => setUsers(res.data));
  }, []);

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold text-blue-600">Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="border-b p-2">{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
