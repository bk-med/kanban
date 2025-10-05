import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { KanbanColumnProps, TaskStatus } from '../../types';

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onTaskMove,
  onTaskEdit,
  onTaskDelete,
}) => {
  const getColumnTitle = (status: TaskStatus) => {
    switch (status) {
      case 'TO_DO':
        return 'À faire';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'DONE':
        return 'Terminé';
      default:
        return status;
    }
  };

  const getColumnColor = (status: TaskStatus) => {
    switch (status) {
      case 'TO_DO':
        return 'border-gray-300 bg-gray-50';
      case 'IN_PROGRESS':
        return 'border-blue-300 bg-blue-50';
      case 'DONE':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getHeaderColor = (status: TaskStatus) => {
    switch (status) {
      case 'TO_DO':
        return 'text-gray-700';
      case 'IN_PROGRESS':
        return 'text-blue-700';
      case 'DONE':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  const handleTaskMove = (taskId: number, newStatus: TaskStatus) => {
    if (newStatus !== status) {
      onTaskMove(taskId, newStatus);
    }
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => task.status === status) : [];

  return (
    <div className={`kanban-column ${getColumnColor(status)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className={`font-semibold ${getHeaderColor(status)}`}>
            {getColumnTitle(status)}
          </h3>
          <span className="ml-2 bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
            {filteredTasks.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onStatusChange={handleTaskMove}
          />
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Aucune tâche</p>
            <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center mx-auto">
              <Plus size={16} className="mr-1" />
              Ajouter une tâche
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
