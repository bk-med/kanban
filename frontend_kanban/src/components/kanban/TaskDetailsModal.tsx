import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task, Comment, ActivityLog, CreateCommentData } from '../../types';
import { apiClient } from '../../services/api';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onTaskUpdated: _onTaskUpdated
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'logs'>('details');

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
    }
  }, [isOpen, task]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTaskDetails = async () => {
    if (!task) return;

    setLoading(true);
    try {
      const [commentsData, logsData] = await Promise.all([
        apiClient.getTaskComments(task.id),
        apiClient.getTaskLogs(task.id)
      ]);
      setComments(commentsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    setLoading(true);
    try {
      const commentData: CreateCommentData = {
        content: newComment
      };
      await apiClient.createTaskComment(task.id, commentData);
      setNewComment('');
      fetchTaskDetails(); // Refresh comments
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TO_DO': return 'text-gray-600 bg-gray-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'DONE': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-4xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {task.title}
            </h2>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commentaires ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historique ({logs.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                {task.description || 'Aucune description'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Assigné à</h3>
                <p className="text-gray-900">
                  {task.assigned_to_username || 'Non assigné'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Date d'échéance</h3>
                <p className="text-gray-900">
                  {task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : 'Aucune'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Créé le</h3>
                <p className="text-gray-900">
                  {new Date(task.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Modifié le</h3>
                <p className="text-gray-900">
                  {new Date(task.updated_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <div>
                <label htmlFor="newComment" className="block text-sm font-medium text-gray-700 mb-1">
                  Ajouter un commentaire
                </label>
                <textarea
                  id="newComment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrivez votre commentaire..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !newComment.trim()}>
                {loading ? 'Ajout...' : 'Ajouter le commentaire'}
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun commentaire</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author_username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun historique</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-gray-900">
                      {log.user_username || 'Utilisateur inconnu'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{log.action}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
