import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // Vérifier si l'utilisateur est connecté
  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  // Vérifier si l'utilisateur a les permissions admin
  if (!user?.is_staff && !user?.is_superuser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Accès Refusé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <p className="text-sm mt-2">Seuls les administrateurs peuvent accéder à cette section.</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};
