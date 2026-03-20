import { Navigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

/**
 * AdminGuard — protege rutas de acceso exclusivo para administradores.
 * Redirige al perfil si el usuario no está autenticado o no tiene rol 'admin'.
 */
export default function AdminGuard({ children }) {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/perfil" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
