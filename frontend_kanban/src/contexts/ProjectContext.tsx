import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, CreateProjectData, ProjectContextType } from '../types';
import apiClient from '../services/api';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Charger les projets au montage du composant
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const projectsData = await apiClient.getProjects();
      console.log('Projects data received:', projectsData); // Debug log
      
      // S'assurer que projectsData est un tableau
      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      } else {
        console.error('Unexpected projects data format:', projectsData);
        setProjects([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setProjects([]); // S'assurer que projects est toujours un tableau
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    try {
      setIsLoading(true);
      const newProject = await apiClient.createProject(data);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error: any) {
      const errorMessage = apiClient.handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
    try {
      setIsLoading(true);
      const updatedProject = await apiClient.updateProject(id, data);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? updatedProject : project
        )
      );
      
      // Mettre à jour le projet actuel s'il est modifié
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      
      return updatedProject;
    } catch (error: any) {
      const errorMessage = apiClient.handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      await apiClient.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      
      // Si le projet supprimé était le projet actuel, le déselectionner
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (error: any) {
      const errorMessage = apiClient.handleError(error);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte des projets
export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
