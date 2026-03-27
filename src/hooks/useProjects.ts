import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

interface UseProjectsReturn {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: any;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  createProject: (project: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at' | 'owner_id'>, ownerId: string) => Promise<{ data: Project | null; error: any }>;
  updateProject: (id: string, updates: ProjectUpdate) => Promise<{ data: Project | null; error: any }>;
  deleteProject: (id: string) => Promise<{ error: any }>;
  setCurrentProject: (project: Project | null) => void;
  addMember: (projectId: string, userId: string, role?: string) => Promise<{ error: any }>;
  removeMember: (memberId: string) => Promise<{ error: any }>;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Recupera tutti i progetti
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.projects.getAll();
    
    if (error) {
      setError(error);
    } else {
      setProjects(data || []);
    }
    
    setIsLoading(false);
  }, []);

  // Recupera un progetto specifico
  const fetchProject = useCallback(async (id: string): Promise<Project | null> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.projects.getById(id);
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return null;
    }
    
    setIsLoading(false);
    return data;
  }, []);

  // Crea un nuovo progetto
  const createProject = async (
    project: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at' | 'owner_id'>,
    ownerId: string
  ): Promise<{ data: Project | null; error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.projects.create({
      ...project,
      owner_id: ownerId,
    });
    
    if (error) {
      setError(error);
    } else if (data) {
      setProjects((prev) => [data, ...prev]);
    }
    
    setIsLoading(false);
    return { data, error };
  };

  // Aggiorna un progetto
  const updateProject = async (id: string, updates: ProjectUpdate): Promise<{ data: Project | null; error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.projects.update(id, updates);
    
    if (error) {
      setError(error);
    } else if (data) {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? data : p))
      );
      if (currentProject?.id === id) {
        setCurrentProjectState(data);
      }
    }
    
    setIsLoading(false);
    return { data, error };
  };

  // Elimina un progetto
  const deleteProject = async (id: string): Promise<{ error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await db.projects.delete(id);
    
    if (error) {
      setError(error);
    } else {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProjectState(null);
      }
    }
    
    setIsLoading(false);
    return { error };
  };

  // Imposta il progetto corrente
  const setCurrentProject = useCallback((project: Project | null) => {
    setCurrentProjectState(project);
    if (project) {
      localStorage.setItem('currentProjectId', project.id);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, []);

  // Aggiungi membro al progetto
  const addMember = async (projectId: string, userId: string, role: string = 'member'): Promise<{ error: any }> => {
    const { error } = await db.projectMembers.add(projectId, userId, role);
    
    if (!error) {
      // Ricarica i progetti per aggiornare i membri
      await fetchProjects();
    }
    
    return { error };
  };

  // Rimuovi membro dal progetto
  const removeMember = async (memberId: string): Promise<{ error: any }> => {
    const { error } = await db.projectMembers.remove(memberId);
    
    if (!error) {
      await fetchProjects();
    }
    
    return { error };
  };

  // Carica progetto corrente da localStorage all'avvio
  useEffect(() => {
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId) {
      fetchProject(savedProjectId).then((project) => {
        if (project) {
          setCurrentProjectState(project);
        }
      });
    }
  }, [fetchProject]);

  // Carica progetti all'avvio
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    addMember,
    removeMember,
  };
}
