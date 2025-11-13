import React from 'react';

export type UserRole = 'admin' | 'user' | null;

export const useAuth = () => {
  const [role, setRole] = React.useState<UserRole>(null);

  React.useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    setRole(storedRole);
  }, []);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return { role, isAdmin, isUser };
};