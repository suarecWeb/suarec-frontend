// Description: This component is used to guard routes based on user roles.
// It checks if the user has the required roles to access the children components.
// If the user is not authorized, it redirects them to the login page or an access denied page.
// If the authorization check is still loading, it shows a loading spinner.
// It uses the `useRoleGuard` custom hook to handle the authorization logic.
'use client';

import { useRoleGuard } from '@/hooks/auth/use-role-guard';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isAuthorized, isLoading } = useRoleGuard(allowedRoles);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // No renderizar nada mientras se redirige
  }

  return <>{children}</>;
}