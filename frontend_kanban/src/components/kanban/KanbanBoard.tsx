import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { Task, TaskStatus, UpdateTaskData } from '../../types';
import apiClient from '../../services/api';
import { useProjects } from '../../contexts/ProjectContext';

interface KanbanBoardProps {
  projectId: number;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { currentProject } = useProjects();

  const statuses: TaskStatus[] = ['TO_DO', 'IN_PROGRESS', 'DONE'];

  useEffect(() => {
    fetchTasks();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const tasksData = await apiClient.getProjectTasks(projectId);
      console.log('Tasks data received:', tasksData); // Debug log
      
      // Gérer la pagination si nécessaire
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else if (tasksData && (tasksData as any).results && Array.isArray((tasksData as any).results)) {
        setTasks((tasksData as any).results);
      } else if (tasksData && (tasksData as any).data && Array.isArray((tasksData as any).data)) {
        setTasks((tasksData as any).data);
      } else {
        console.error('Unexpected tasks data format:', tasksData);
        setTasks([]);
      }
    } catch (err: any) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
      setTasks([]); // S'assurer que tasks est toujours un tableau
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as number;
    const task = Array.isArray(tasks) ? tasks.find(t => t.id === taskId) : null;
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as number;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      const updateData: UpdateTaskData = { status: newStatus };
      await apiClient.updateTask(taskId, updateData);
    } catch (err: any) {
      // Revert on error
      setTasks(prev => 
        prev.map(t => 
          t.id === taskId ? { ...t, status: task.status } : t
        )
      );
      setError('Erreur lors de la mise à jour de la tâche');
      console.error(err);
    }
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetailsModal(true);
  };

  const handleCreateTask = () => {
    setShowCreateTaskModal(true);
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await apiClient.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      setError('Erreur lors de la suppression de la tâche');
      console.error(err);
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: TaskStatus) => {
    const task = Array.isArray(tasks) ? tasks.find(t => t.id === taskId) : null;
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      const updateData: UpdateTaskData = { status: newStatus };
      await apiClient.updateTask(taskId, updateData);
    } catch (err: any) {
      // Revert on error
      setTasks(prev => 
        prev.map(t => 
          t.id === taskId ? { ...t, status: task.status } : t
        )
      );
      setError('Erreur lors de la mise à jour de la tâche');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-50 border border-error-200 rounded-lg p-4">
        <p className="text-error-600">{error}</p>
        <button 
          onClick={fetchTasks}
          className="mt-2 text-error-600 hover:text-error-700 text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject?.name || 'Tableau Kanban'}
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos tâches avec le tableau Kanban
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nouvelle tâche
        </button>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <SortableContext
              key={status}
              items={Array.isArray(tasks) ? tasks.filter(t => t.status === status).map(t => t.id) : []}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                status={status}
                tasks={tasks}
                onTaskMove={handleTaskMove}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="transform rotate-3 opacity-90">
              <TaskCard
                task={activeTask}
                onEdit={handleTaskEdit}
                onDelete={handleTaskDelete}
                onStatusChange={handleTaskMove}
              />
            </div>
          ) : null}
        </DragOverlay>

        {/* Modals */}
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          projectId={projectId}
          onTaskCreated={handleTaskCreated}
        />

        <TaskDetailsModal
          isOpen={showTaskDetailsModal}
          onClose={() => setShowTaskDetailsModal(false)}
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
        />
      </DndContext>
    </div>
  );
};
