import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  User,
  Project,
  ProjectWithCreator,
  Task,
  Comment,
  ActivityLog,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  CreateProjectData,
  CreateTaskData,
  UpdateTaskData,
  CreateCommentData,
  ProjectStats,
  PaginatedResponse,
  CustomResponse
} from '../types';

// Configuration de base de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Intercepteur pour ajouter le token d'authentification
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs de réponse
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Si le token a expiré, essayer de le renouveler
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                refresh: refreshToken,
              });

              const { access } = response.data;
              localStorage.setItem('access_token', access);
              
              // Réessayer la requête originale avec le nouveau token
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si le refresh token a aussi expiré, déconnecter l'utilisateur
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Méthodes d'authentification
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>('/auth/login/', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await this.client.post<User>('/auth/register/', data);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/auth/me/');
    return response.data;
  }

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await this.client.post<{ access: string }>('/auth/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  }

  // Méthodes pour les projets
  async getProjects(): Promise<Project[]> {
    const response = await this.client.get<Project[] | PaginatedResponse<Project> | CustomResponse<Project>>('/projects/');
    
    // Gérer la pagination Django REST Framework
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    } else if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn('Unexpected projects API response format:', response.data);
      return [];
    }
  }

  async getProject(id: number): Promise<Project> {
    const response = await this.client.get<Project>(`/projects/${id}/`);
    return response.data;
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await this.client.post<Project>('/projects/', data);
    return response.data;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response = await this.client.patch<Project>(`/projects/${id}/`, data);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.client.delete(`/projects/${id}/`);
  }

  async addProjectMember(projectId: number, userId: number): Promise<void> {
    await this.client.post(`/projects/${projectId}/add_member/`, { user_id: userId });
  }

  async removeProjectMember(projectId: number, userId: number): Promise<void> {
    await this.client.post(`/projects/${projectId}/remove_member/`, { user_id: userId });
  }

  async getProjectStats(projectId: number): Promise<ProjectStats> {
    const response = await this.client.get<ProjectStats>(`/projects/${projectId}/stats/`);
    return response.data;
  }

  // Méthodes pour les utilisateurs (CRUD pour l'administration)
  async createUser(userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }): Promise<User> {
    const response = await this.client.post<User>('/admin/users/', userData);
    return response.data;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    const response = await this.client.put<User>(`/admin/users/${userId}/`, userData);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await this.client.delete(`/admin/users/${userId}/`);
  }

  // Méthodes CRUD pour les projets (administration)
  async createProjectAdmin(projectData: { name: string; description?: string }): Promise<Project> {
    const response = await this.client.post<Project>('/admin/projects/', projectData);
    return response.data;
  }
  
  async updateProjectAdmin(projectId: number, projectData: Partial<Project>): Promise<Project> {
    const response = await this.client.put<Project>(`/admin/projects/${projectId}/`, projectData);
    return response.data;
  }
  
  async deleteProjectAdmin(projectId: number): Promise<void> {
    await this.client.delete(`/admin/projects/${projectId}/`);
  }


  // Méthodes CRUD pour les tâches (administration)
  async createTaskAdmin(taskData: { title: string; description?: string; project_id: number; status?: string; priority?: string }): Promise<Task> {
    const response = await this.client.post<Task>('/admin/tasks/', taskData);
    return response.data;
  }

  async updateTaskAdmin(taskId: number, taskData: Partial<Task>): Promise<Task> {
    const response = await this.client.put<Task>(`/admin/tasks/${taskId}/`, taskData);
    return response.data;
  }

  async deleteTaskAdmin(taskId: number): Promise<void> {
    await this.client.delete(`/admin/tasks/${taskId}/`);
  }

  // Méthodes pour les tâches
  async getTasks(): Promise<Task[]> {
    const response = await this.client.get<Task[]>('/tasks/');
    return response.data;
  }

  async getProjectTasks(projectId: number): Promise<Task[]> {
    const response = await this.client.get<Task[] | PaginatedResponse<Task> | CustomResponse<Task>>(`/projects/${projectId}/tasks/`);
    
    // Gérer la pagination Django REST Framework
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && 'results' in response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    } else if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn('Unexpected API response format:', response.data);
      return [];
    }
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.client.get<Task>(`/tasks/${id}/`);
    return response.data;
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await this.client.post<Task>('/tasks/', data);
    return response.data;
  }

  async createProjectTask(projectId: number, data: Omit<CreateTaskData, 'project_id'>): Promise<Task> {
    const taskData = { ...data, project_id: projectId };
    const response = await this.client.post<Task>(`/projects/${projectId}/tasks/`, taskData);
    return response.data;
  }

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await this.client.patch<Task>(`/tasks/${id}/`, data);
    return response.data;
  }

  async deleteTask(id: number): Promise<void> {
    await this.client.delete(`/tasks/${id}/`);
  }

  // Méthodes pour les commentaires
  async getTaskComments(taskId: number): Promise<Comment[]> {
    const response = await this.client.get<Comment[]>(`/tasks/${taskId}/comments/`);
    return response.data;
  }

  async createTaskComment(taskId: number, data: CreateCommentData): Promise<Comment> {
    const response = await this.client.post<Comment>(`/tasks/${taskId}/comment/`, data);
    return response.data;
  }

  async updateComment(id: number, data: Partial<Comment>): Promise<Comment> {
    const response = await this.client.patch<Comment>(`/comments/${id}/`, data);
    return response.data;
  }

  async deleteComment(id: number): Promise<void> {
    await this.client.delete(`/comments/${id}/`);
  }

  // Méthodes pour les logs d'activité
  async getTaskLogs(taskId: number): Promise<ActivityLog[]> {
    const response = await this.client.get<ActivityLog[]>(`/tasks/${taskId}/logs/`);
    return response.data;
  }

  // Méthodes d'administration
  async getAdminUsers(): Promise<{
    users: User[];
    total: number;
    active_users: number;
    staff_users: number;
  }> {
    const response = await this.client.get<User[]>('/admin/users/');
    const users = response.data;
    return {
      users,
      total: users.length,
      active_users: users.filter(user => user.is_active).length,
      staff_users: users.filter(user => user.is_staff).length
    };
  }


  async getAdminProjects(): Promise<{
    projects: ProjectWithCreator[];
    total: number;
    projects_with_tasks: number;
    projects_with_members: number;
  }> {
    const response = await this.client.get<ProjectWithCreator[]>('/admin/projects/');
    const projects = response.data;
    return {
      projects,
      total: projects.length,
      projects_with_tasks: projects.filter(project => (project.tasks_count || 0) > 0).length,
      projects_with_members: projects.filter(project => (project.members_count || 0) > 0).length
    };
  }

  async getAdminTasks(): Promise<{
    tasks: Task[];
    total: number;
    todo_tasks: number;
    in_progress_tasks: number;
    done_tasks: number;
  }> {
    const response = await this.client.get<Task[]>('/admin/tasks/');
    const tasks = response.data;
    return {
      tasks,
      total: tasks.length,
      todo_tasks: tasks.filter(task => task.status === 'TO_DO').length,
      in_progress_tasks: tasks.filter(task => task.status === 'IN_PROGRESS').length,
      done_tasks: tasks.filter(task => task.status === 'DONE').length
    };
  }


  async getActivityLogs(): Promise<ActivityLog[]> {
    const response = await this.client.get<ActivityLog[]>('/logs/');
    return response.data;
  }

  // Méthodes utilitaires
  async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Méthode pour gérer les erreurs de manière centralisée
  handleError(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.detail) {
        return data.detail;
      }
      if (data.message) {
        return data.message;
      }
      if (typeof data === 'string') {
        return data;
      }
      // Pour les erreurs de validation
      if (typeof data === 'object') {
        const firstError = Object.values(data)[0] as any;
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        return String(firstError);
      }
    }
    
    if (error.request) {
      return 'Erreur de connexion au serveur';
    }
    
    return 'Une erreur inattendue s\'est produite';
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient();
export default apiClient;
