
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield, ArrowLeft } from 'lucide-react';
import { apiClient } from '../services/api';

export const AdminLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Tentative de connexion
      const response = await apiClient.login({
        username: formData.username,
        password: formData.password
      });
      
      if (response.access) {
        // Vérifier si l'utilisateur est admin (dans une vraie app, vous auriez un champ is_staff ou is_admin)
        // Pour l'instant, on considère que tous les utilisateurs connectés peuvent accéder à l'admin
        // Vous pouvez ajouter une vérification plus stricte ici
        
        // Rediriger vers la page d'administration
        navigate('/admin');
      }
    } catch (error) {
      console.error('Erreur de connexion admin:', error);
      setError('Identifiants incorrects. Seuls les administrateurs peuvent accéder à cette section.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-10 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Administration</h1>
          <p className="text-blue-100">Accès réservé aux administrateurs</p>
        </div>

        {/* Login Card */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Nom d'utilisateur administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white border-opacity-30 rounded-lg bg-white bg-opacity-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Mot de passe administrateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-200" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-white border-opacity-30 rounded-lg bg-white bg-opacity-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-50 rounded-lg p-3">
                <p className="text-red-100 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Se connecter en tant qu'administrateur
                </>
              )}
            </button>
          </form>

          {/* Back Button */}
          <div className="mt-6 pt-6 border-t border-white border-opacity-20">
            <button
              onClick={goBack}
              className="w-full flex justify-center items-center py-2 px-4 text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'application
            </button>
          </div>

          {/* Credentials Info */}
          <div className="mt-6 p-4 bg-blue-500 bg-opacity-20 border border-blue-400 border-opacity-50 rounded-lg">
            <div className="flex items-start">
              <User className="h-5 w-5 text-blue-300 mr-2 mt-0.5" />
              <div>
                <h4 className="text-blue-200 font-medium text-sm">Identifiants de test</h4>
                <p className="text-blue-100 text-xs mt-1">
                  <strong>Admin:</strong> admin / admin123<br/>
                  <strong>Utilisateur:</strong> user / user123
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-4 bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-50 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-yellow-300 mr-2 mt-0.5" />
              <div>
                <h4 className="text-yellow-200 font-medium text-sm">Accès sécurisé</h4>
                <p className="text-yellow-100 text-xs mt-1">
                  Cette section est réservée aux administrateurs autorisés. Toutes les actions sont enregistrées.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            © 2025 Kanban App - Administration
          </p>
        </div>
      </div>
    </div>
  );
};
