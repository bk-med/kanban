import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreHorizontal, Users, Calendar, FolderOpen } from 'lucide-react';
import { ProjectCardProps } from '../../types';

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <FolderOpen className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500">
              par {project.owner_username}
            </p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Users size={16} className="mr-1" />
          <span>{project.members.length + 1} membre(s)</span>
        </div>
        
        {project.tasks_count !== undefined && (
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
            {project.tasks_count} tâche(s)
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-400">
          <Calendar size={14} className="mr-1" />
          <span>Créé {formatDate(project.created_at)}</span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(project.id);
            }}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            Ouvrir
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="text-error-600 hover:text-error-700 text-sm font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};



