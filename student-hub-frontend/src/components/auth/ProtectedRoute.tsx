import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../ui/LoadingState/LoadingState';
import type { ReactNode } from 'react';

// Wraps a route element to require authentication.
//
// - While the initial auth check is running, shows a loading state.
// - If the user is not signed in, redirects to /login and remembers
//   where they came from so we can send them back after login.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}


