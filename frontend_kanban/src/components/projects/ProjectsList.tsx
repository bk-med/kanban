import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { useProjects } from '../../contexts/ProjectContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const ProjectsList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'owner' | 'member'>('all');
  
  const { projects, isLoading, deleteProject, setCurrentProject } = useProjects();
  const navigate = useNavigate();

  const filteredProjects = Array.isArray(projects) ? projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'owner') {
      // TODO: Utiliser l'ID de l'utilisateur connecté
      matchesFilter = true; // Pour l'instant, tous les projets
    } else if (filterStatus === 'member') {
      // TODO: Filtrer les projets où l'utilisateur est membre
      matchesFilter = true; // Pour l'instant, tous les projets
    }
    
    return matchesSearch && matchesFilter;
  }) : [];

  const handleProjectView = (projectId: number) => {
    const project = Array.isArray(projects) ? projects.find(p => p.id === projectId) : null;
    if (project) {
      setCurrentProject(project);
      navigate(`/projects/${projectId}/kanban`);
    }
  };

  const handleProjectEdit = (project: any) => {
    // TODO: Ouvrir le modal d'édition de projet
    console.log('Éditer le projet:', project);
  };

  const handleProjectDelete = async (projectId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }

    try {
      await deleteProject(projectId);
    } catch (error: any) {
      alert('Erreur lors de la suppression du projet: ' + error.message);
    }
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos projets et collaboratez avec votre équipe
            </p>
          </div>
          <Button onClick={handleCreateProject} className="flex items-center">
            <Plus size={20} className="mr-2" />
            Nouveau Projet
          </Button>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tous les projets</option>
                <option value="owner">Mes projets</option>
                <option value="member">Projets partagés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des projets */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {Array.isArray(projects) && projects.length === 0 ? 'Aucun projet' : 'Aucun projet trouvé'}
            </h3>
            <p className="text-gray-500 mb-6">
              {Array.isArray(projects) && projects.length === 0 
                ? 'Commencez par créer votre premier projet' 
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
            {Array.isArray(projects) && projects.length === 0 && (
              <Button onClick={handleCreateProject}>
                <Plus size={20} className="mr-2" />
                Créer mon premier projet
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleProjectEdit}
                onDelete={handleProjectDelete}
                onView={handleProjectView}
              />
            ))}
          </div>
        )}

        {/* Modal de création */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </div>
  );
};
