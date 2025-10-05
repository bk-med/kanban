import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Task } from '../../types';

interface AdminChartsProps {
  tasks: Task[];
  projects: any[];
}

export const AdminCharts: React.FC<AdminChartsProps> = ({ tasks, projects }) => {
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TO_DO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  const priorityStats = {
    high: tasks.filter(t => t.priority === 'HIGH').length,
    medium: tasks.filter(t => t.priority === 'MEDIUM').length,
    low: tasks.filter(t => t.priority === 'LOW').length,
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'TO_DO': return 'bg-gray-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'DONE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Répartition des Tâches</h3>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            +12% ce mois
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">À faire</span>
              <span className="text-sm font-medium">{taskStats.todo}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor('TO_DO')}`}
                style={{ width: `${getPercentage(taskStats.todo, taskStats.total)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">En cours</span>
              <span className="text-sm font-medium">{taskStats.inProgress}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor('IN_PROGRESS')}`}
                style={{ width: `${getPercentage(taskStats.inProgress, taskStats.total)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Terminées</span>
              <span className="text-sm font-medium">{taskStats.done}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor('DONE')}`}
                style={{ width: `${getPercentage(taskStats.done, taskStats.total)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taux de completion</span>
            <span className="font-medium text-gray-900">
              {Math.round(getPercentage(taskStats.done, taskStats.total))}%
            </span>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Répartition par Priorité</h3>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
            -3% ce mois
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Haute priorité</span>
              <span className="text-sm font-medium">{priorityStats.high}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getPriorityColor('HIGH')}`}
                style={{ width: `${getPercentage(priorityStats.high, taskStats.total)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Priorité moyenne</span>
              <span className="text-sm font-medium">{priorityStats.medium}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getPriorityColor('MEDIUM')}`}
                style={{ width: `${getPercentage(priorityStats.medium, taskStats.total)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Priorité faible</span>
              <span className="text-sm font-medium">{priorityStats.low}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getPriorityColor('LOW')}`}
                style={{ width: `${getPercentage(priorityStats.low, taskStats.total)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tâches urgentes</span>
            <span className="font-medium text-red-600">{priorityStats.high}</span>
          </div>
        </div>
      </div>

      {/* Project Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité par Projet</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Projet</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Tâches Total</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Terminées</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">En cours</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Progression</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const projectTasks = tasks.filter(t => t.project === project.id);
                const completed = projectTasks.filter(t => t.status === 'DONE').length;
                const inProgress = projectTasks.filter(t => t.status === 'IN_PROGRESS').length;
                const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;
                
                return (
                  <tr key={project.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{project.name}</td>
                    <td className="py-3 text-sm text-gray-600">{projectTasks.length}</td>
                    <td className="py-3 text-sm text-green-600">{completed}</td>
                    <td className="py-3 text-sm text-blue-600">{inProgress}</td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



