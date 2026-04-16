import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export function ProtectedRoute() {
  const { user, isReady } = useAuth();

  if (!isReady) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
