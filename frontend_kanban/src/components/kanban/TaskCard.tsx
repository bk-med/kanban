import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoreHorizontal, Calendar, User, MessageCircle } from 'lucide-react';
import { TaskCardProps } from '../../types';

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Haute';
      case 'MEDIUM':
        return 'Moyenne';
      case 'LOW':
        return 'Faible';
      default:
        return 'Moyenne';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_DO':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'DONE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    try {
      return format(parseISO(dueDate), 'dd MMM yyyy', { locale: fr });
    } catch {
      return null;
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    try {
      return new Date(dueDate) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className={`task-card ${getPriorityColor(task.priority)}`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
          {task.title}
        </h4>
        <button
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
          {getPriorityText(task.priority)}
        </span>
        {task.comments_count && task.comments_count > 0 && (
          <div className="flex items-center">
            <MessageCircle size={12} className="mr-1" />
            {task.comments_count}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {task.assigned_to_username && (
          <div className="flex items-center text-xs text-gray-500">
            <User size={12} className="mr-1" />
            <span>{task.assigned_to_username}</span>
          </div>
        )}

        {task.due_date && (
          <div className={`flex items-center text-xs ${
            isOverdue(task.due_date) && task.status !== 'DONE' 
              ? 'text-red-600' 
              : 'text-gray-500'
          }`}>
            <Calendar size={12} className="mr-1" />
            <span>
              {formatDueDate(task.due_date)}
              {isOverdue(task.due_date) && task.status !== 'DONE' && (
                <span className="ml-1 font-medium">(En retard)</span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Créé {format(parseISO(task.created_at), 'dd MMM', { locale: fr })}
          </span>
          <div className="flex space-x-1">
            {task.status !== 'DONE' && (
              <button
                onClick={() => onStatusChange(task.id, 'DONE')}
                className="text-xs text-green-600 hover:text-green-700 font-medium"
              >
                Terminer
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
