import { Navigate, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Skeleton } from '../components/ui/skeleton';
import { useAuth } from '../features/auth/AuthContext';

export function ProtectedRoute() {
  const { user, isReady } = useAuth();

  if (!isReady)
    return (
      <main className="mx-auto max-w-5xl p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
      </main>
    );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
