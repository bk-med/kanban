import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderOpen,
  CheckSquare,
  BarChart3,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { apiClient } from '../services/api';
import { User, ProjectWithCreator } from '../types';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  activeUsers: number;
  completedTasks: number;
  pendingTasks: number;
  projectsWithTasks: number;
  usersWithTasks: number;
}

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'projects' | 'tasks'>('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    activeUsers: 0,
    completedTasks: 0,
    pendingTasks: 0,
    projectsWithTasks: 0,
    usersWithTasks: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le filtrage et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  // États pour les modales
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');

  // États pour les formulaires
  const [formUser, setFormUser] = useState<Partial<User>>({ username: '', email: '', first_name: '', last_name: '' });
  const [formProject, setFormProject] = useState<any>({ name: '', description: '' });
  const [formTask, setFormTask] = useState<any>({ title: '', description: '', status: 'TO_DO', priority: 'MEDIUM', project_id: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Fonctions de filtrage
  const filteredUsers = (users || []).filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = (projects || []).filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = (allTasks || []).filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const promises = [
        apiClient.getAdminUsers().catch(err => {
          console.error('Erreur chargement utilisateurs:', err);
          return { users: [], total: 0, active_users: 0, staff_users: 0 };
        }),
        apiClient.getAdminProjects().catch(err => {
          console.error('Erreur chargement projets:', err);
          return { projects: [], total: 0, projects_with_tasks: 0, projects_with_members: 0 };
        }),
        apiClient.getAdminTasks().catch(err => {
          console.error('Erreur chargement tâches:', err);
          return { tasks: [], total: 0, todo_tasks: 0, in_progress_tasks: 0, done_tasks: 0 };
        })
      ];

      const [usersResponse, projectsResponse, tasksResponse] = await Promise.all(promises);

      setUsers((usersResponse as any).users);
      setProjects((projectsResponse as any).projects);
      setAllTasks((tasksResponse as any).tasks);

      setStats({
        totalUsers: (usersResponse as any).total,
        totalProjects: (projectsResponse as any).total,
        totalTasks: (tasksResponse as any).total,
        activeUsers: (usersResponse as any).active_users,
        completedTasks: (tasksResponse as any).done_tasks,
        pendingTasks: (tasksResponse as any).todo_tasks + (tasksResponse as any).in_progress_tasks,
        projectsWithTasks: (projectsResponse as any).projects_with_tasks,
        usersWithTasks: (usersResponse as any).active_users
      });

    } catch (error) {
      console.error('Erreur générale lors du chargement des données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions CRUD pour les utilisateurs
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setFormUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await apiClient.deleteUser(userId);
        setUsers(prev => (prev || []).filter(user => user.id !== userId));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        alert('Utilisateur supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormUser({ username: '', email: '', first_name: '', last_name: '' });
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (modalMode === 'create') {
        const newUser = await apiClient.createUser({
          username: formUser.username || '',
          email: formUser.email || '',
          password: 'password123',
          first_name: formUser.first_name || '',
          last_name: formUser.last_name || ''
        });
        setUsers(prev => [...prev, newUser]);
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        alert('Utilisateur créé avec succès');
      } else if (modalMode === 'edit' && selectedUser) {
        const updatedUser = await apiClient.updateUser(selectedUser.id, {
          username: formUser.username || '',
          email: formUser.email || '',
          first_name: formUser.first_name || '',
          last_name: formUser.last_name || ''
        });
        setUsers(prev => prev.map(user => user.id === selectedUser.id ? updatedUser : user));
        alert('Utilisateur modifié avec succès');
      }
      setShowUserModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  // Fonctions CRUD pour les projets
  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setFormProject(project);
    setModalMode('view');
    setShowProjectModal(true);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setFormProject(project);
    setModalMode('edit');
    setShowProjectModal(true);
  };

  const handleDeleteProject = async (projectId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await apiClient.deleteProjectAdmin(projectId);
        setProjects(prev => (prev || []).filter(project => project.id !== projectId));
        setStats(prev => ({ ...prev, totalProjects: prev.totalProjects - 1 }));
        alert('Projet supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setFormProject({ name: '', description: '' });
    setModalMode('create');
    setShowProjectModal(true);
  };

  const handleSaveProject = async () => {
    try {
      if (modalMode === 'create') {
        const newProject = await apiClient.createProjectAdmin({
          name: formProject.name,
          description: formProject.description
        });
        setProjects(prev => [...prev, newProject]);
        setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1 }));
        alert('Projet créé avec succès');
      } else if (modalMode === 'edit' && selectedProject) {
        const updatedProject = await apiClient.updateProjectAdmin(selectedProject.id, {
          name: formProject.name,
          description: formProject.description
        });
        setProjects(prev => prev.map(project => project.id === selectedProject.id ? updatedProject : project));
        alert('Projet modifié avec succès');
      }
      setShowProjectModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du projet');
    }
  };

  // Fonctions CRUD pour les tâches
  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setFormTask(task);
    setModalMode('view');
    setShowTaskModal(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setFormTask(task);
    setModalMode('edit');
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await apiClient.deleteTaskAdmin(taskId);
        setAllTasks(prev => (prev || []).filter(task => task.id !== taskId));
        setStats(prev => ({ ...prev, totalTasks: prev.totalTasks - 1 }));
        alert('Tâche supprimée avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setFormTask({ title: '', description: '', status: 'TO_DO', priority: 'MEDIUM', project_id: '' });
    setModalMode('create');
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    try {
      if (modalMode === 'create') {
        if (!formTask.project_id) {
          alert('Veuillez sélectionner un projet');
          return;
        }
        const newTask = await apiClient.createTaskAdmin({
          title: formTask.title,
          description: formTask.description,
          project_id: parseInt(formTask.project_id),
          status: formTask.status,
          priority: formTask.priority
        });
        setAllTasks(prev => [...prev, newTask]);
        setStats(prev => ({ ...prev, totalTasks: prev.totalTasks + 1 }));
        alert('Tâche créée avec succès');
      } else if (modalMode === 'edit' && selectedTask) {
        const updatedTask = await apiClient.updateTaskAdmin(selectedTask.id, {
          title: formTask.title,
          description: formTask.description,
          status: formTask.status,
          priority: formTask.priority
        });
        setAllTasks(prev => prev.map(task => task.id === selectedTask.id ? updatedTask : task));
        alert('Tâche modifiée avec succès');
      }
      setShowTaskModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la tâche');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* Sidebar Moderne */}
      <div className="w-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center py-8 space-y-8 shadow-2xl">
        {/* Logo */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'dashboard' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl transform scale-110' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-lg'
            }`}
            title="Dashboard"
          >
            <BarChart3 className="h-6 w-6" />
            {activeTab === 'dashboard' && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl transform scale-110' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-lg'
            }`}
            title="Utilisateurs"
          >
            <Users className="h-6 w-6" />
            {activeTab === 'users' && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('projects')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'projects' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl transform scale-110' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-lg'
            }`}
            title="Projets"
          >
            <FolderOpen className="h-6 w-6" />
            {activeTab === 'projects' && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l-full"></div>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${
              activeTab === 'tasks' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl transform scale-110' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-lg'
            }`}
            title="Tâches"
          >
            <CheckSquare className="h-6 w-6" />
            {activeTab === 'tasks' && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l-full"></div>
            )}
          </button>
        </div>
        
        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Refresh Button */}
        <button
          onClick={() => fetchAdminData()}
          className="group p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-lg transition-all duration-300 hover:rotate-180"
          title="Actualiser les données"
        >
          <RefreshCw className="h-6 w-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header avec titre et boutons d'action */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {activeTab === 'dashboard' && '📊 Dashboard'}
                {activeTab === 'users' && '👥 Utilisateurs'}
                {activeTab === 'projects' && '📁 Projets'}
                {activeTab === 'tasks' && '✅ Tâches'}
              </h1>
              <p className="text-gray-600 mt-2">
                {activeTab === 'dashboard' && 'Vue d\'ensemble de votre système'}
                {activeTab === 'users' && 'Gestion des utilisateurs'}
                {activeTab === 'projects' && 'Gestion des projets'}
                {activeTab === 'tasks' && 'Gestion des tâches'}
              </p>
            </div>
            
            {activeTab !== 'dashboard' && (
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Search className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg"
                  />
                </div>
                
                {activeTab === 'tasks' && (
                  <div className="flex items-center space-x-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="TO_DO">À faire</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="DONE">Terminé</option>
                    </select>
                    
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg"
                    >
                      <option value="all">Toutes les priorités</option>
                      <option value="LOW">Basse</option>
                      <option value="MEDIUM">Moyenne</option>
                      <option value="HIGH">Haute</option>
                    </select>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    if (activeTab === 'users') handleCreateUser();
                    if (activeTab === 'projects') handleCreateProject();
                    if (activeTab === 'tasks') handleCreateTask();
                  }}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg font-semibold"
                >
                  <Plus className="h-5 w-5" />
                  <span>Ajouter</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="group bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Utilisateurs</p>
                    <p className="text-5xl font-bold mt-2">{stats.totalUsers}</p>
                    <p className="text-blue-100 text-sm mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {stats.activeUsers} actifs
                    </p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl group-hover:bg-opacity-30 transition-all duration-300">
                    <Users className="h-10 w-10" />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-8 rounded-3xl text-white shadow-2xl hover:shadow-green-500/25 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">Total Projets</p>
                    <p className="text-5xl font-bold mt-2">{stats.totalProjects}</p>
                    <p className="text-green-100 text-sm mt-1 flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      {stats.projectsWithTasks} avec tâches
                    </p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl group-hover:bg-opacity-30 transition-all duration-300">
                    <FolderOpen className="h-10 w-10" />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-8 rounded-3xl text-white shadow-2xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">Total Tâches</p>
                    <p className="text-5xl font-bold mt-2">{stats.totalTasks}</p>
                    <p className="text-purple-100 text-sm mt-1 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {stats.completedTasks} terminées
                    </p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl group-hover:bg-opacity-30 transition-all duration-300">
                    <CheckSquare className="h-10 w-10" />
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 rounded-3xl text-white shadow-2xl hover:shadow-orange-500/25 hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide">En Attente</p>
                    <p className="text-5xl font-bold mt-2">{stats.pendingTasks}</p>
                    <p className="text-orange-100 text-sm mt-1 flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      Attention requise
                    </p>
                  </div>
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl group-hover:bg-opacity-30 transition-all duration-300">
                    <BarChart3 className="h-10 w-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tableaux de résumé */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Utilisateurs récents */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="h-6 w-6 mr-3 text-blue-600" />
                    Utilisateurs récents
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {(users || []).slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projets récents */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <FolderOpen className="h-6 w-6 mr-3 text-green-600" />
                    Projets récents
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {(projects || []).slice(0, 5).map(project => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{project.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-32">{project.description}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {project.tasks_count || 0} tâches
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Utilisateurs */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Utilisateur</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Email</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Statut</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="py-6 px-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{user.username}</p>
                              <p className="text-gray-500">{user.first_name} {user.last_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-6 text-gray-900 font-medium">{user.email}</td>
                        <td className="py-6 px-6">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-6 px-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-3 text-blue-600 hover:bg-blue-100 rounded-2xl transition-all duration-200 hover:scale-110"
                              title="Voir"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-3 text-green-600 hover:bg-green-100 rounded-2xl transition-all duration-200 hover:scale-110"
                              title="Modifier"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-3 text-red-600 hover:bg-red-100 rounded-2xl transition-all duration-200 hover:scale-110"
                              title="Supprimer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Projets */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Projet</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Créé par</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tâches</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map(project => (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{project.name}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{project.description}</td>
                        <td className="py-3 px-4 text-gray-900">
                          {typeof project.owner === 'object' ? project.owner?.username || 'N/A' : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {project.tasks_count || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProject(project)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditProject(project)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tâches */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Tâche</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Projet</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Priorité</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => (
                      <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{task.title}</p>
                            <p className="text-sm text-gray-500">{task.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{task.project?.name || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                            task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status === 'DONE' ? 'Terminé' :
                             task.status === 'IN_PROGRESS' ? 'En cours' : 'À faire'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority === 'HIGH' ? 'Haute' :
                             task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewTask(task)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      {/* Modale Utilisateur */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === 'view' ? 'Détails Utilisateur' : 
               modalMode === 'edit' ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <input 
                  type="text" 
                  value={formUser.username}
                  onChange={(e) => setFormUser({...formUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={formUser.email}
                  onChange={(e) => setFormUser({...formUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input 
                  type="text" 
                  value={formUser.first_name}
                  onChange={(e) => setFormUser({...formUser, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input 
                  type="text" 
                  value={formUser.last_name}
                  onChange={(e) => setFormUser({...formUser, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              {modalMode !== 'view' && (
                <button 
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale Projet */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === 'view' ? 'Détails Projet' : 
               modalMode === 'edit' ? 'Modifier Projet' : 'Nouveau Projet'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom du projet</label>
                <input 
                  type="text" 
                  value={formProject.name}
                  onChange={(e) => setFormProject({...formProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={formProject.description}
                  onChange={(e) => setFormProject({...formProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              {modalMode !== 'view' && (
                <button 
                  onClick={handleSaveProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale Tâche */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {modalMode === 'view' ? 'Détails Tâche' : 
               modalMode === 'edit' ? 'Modifier Tâche' : 'Nouvelle Tâche'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input 
                  type="text" 
                  value={formTask.title}
                  onChange={(e) => setFormTask({...formTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={formTask.description}
                  onChange={(e) => setFormTask({...formTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  readOnly={modalMode === 'view'}
                  rows={3}
                />
              </div>
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Projet</label>
                  <select 
                    value={formTask.project_id}
                    onChange={(e) => setFormTask({...formTask, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select 
                  value={formTask.status}
                  onChange={(e) => setFormTask({...formTask, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={modalMode === 'view'}
                >
                  <option value="TO_DO">À faire</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Terminé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priorité</label>
                <select 
                  value={formTask.priority}
                  onChange={(e) => setFormTask({...formTask, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={modalMode === 'view'}
                >
                  <option value="LOW">Basse</option>
                  <option value="MEDIUM">Moyenne</option>
                  <option value="HIGH">Haute</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              {modalMode !== 'view' && (
                <button 
                  onClick={handleSaveTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
