import React from 'react';
import { useParams } from 'react-router-dom';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export const KanbanPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">ID du projet manquant</p>
      </div>
    );
  }

  return <KanbanBoard projectId={parseInt(projectId)} />;
};



