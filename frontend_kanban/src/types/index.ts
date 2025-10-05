// Types pour l'API Kanban

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_staff?: boolean;
  is_active?: boolean;
  is_superuser?: boolean;
  last_login?: string | null;
}

export interface ProjectWithCreator {
  id: number;
  name: string;
  description: string;
  created_at: string;
  owner?: number | {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_by?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  members_count?: number;
  tasks_count?: number;
}

export interface TaskWithDetails {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  project?: {
    id: number;
    name: string;
    owner?: {
      id: number;
      username: string;
      email: string;
    };
  };
  assigned_to?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: number;
  owner_username: string;
  members: number[];
  member_usernames: string[];
  created_at: string;
  tasks_count?: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  project: number;
  project_name: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: number | null;
  assigned_to_username: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  comments_count?: number;
}

export interface Comment {
  id: number;
  task: number;
  author: number;
  author_username: string;
  content: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  task: number;
  task_title: string;
  user: number | null;
  user_username: string | null;
  action: string;
  created_at: string;
}

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CustomResponse<T> {
  data: T[];
}

export interface ProjectStats {
  project: {
    id: number;
    name: string;
    description: string;
    created_at: string;
  };
  statistics: {
    total_tasks: number;
    tasks_by_status: Record<TaskStatus, number>;
    due_soon_tasks: Array<{
      id: number;
      title: string;
      due_date: string;
      assigned_to__username: string;
    }>;
    overdue_tasks: Array<{
      id: number;
      title: string;
      due_date: string;
      assigned_to__username: string;
    }>;
    member_ranking: Array<{
      assigned_to__username: string;
      completed_tasks: number;
    }>;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  project_id: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigned_to?: number;
  due_date?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  due_date?: string;
}

export interface CreateCommentData {
  content: string;
}

// Types pour les props des composants
export interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

export interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: number, newStatus: TaskStatus) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: number) => void;
}

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
  onView: (projectId: number) => void;
}

// Types pour les contextes
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  addProjectMember?: (projectId: number, userId: number) => Promise<void>;
  removeProjectMember?: (projectId: number, userId: number) => Promise<void>;
}
