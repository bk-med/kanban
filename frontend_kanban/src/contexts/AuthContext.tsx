import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, AuthContextType } from '../types';
import apiClient from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await apiClient.getMe();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Si le token est invalide, nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const tokens = await apiClient.login(credentials);
      
      // Stocker les tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      // Récupérer les données utilisateur
      const userData = await apiClient.getMe();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      const errorMessage = apiClient.handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.register(data);
      
      // Après l'inscription, connecter automatiquement l'utilisateur
      await login({
        username: data.username,
        password: data.password,
      });
    } catch (error: any) {
      const errorMessage = apiClient.handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Nettoyer le localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Réinitialiser l'état
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const { access } = await apiClient.refreshToken();
      localStorage.setItem('access_token', access);
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;



