import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Ticket, Project, User, Comment, Activity, TicketStatus, TicketPriority, TicketType } from '@/types';

interface StoreState {
  // Dati
  tickets: Ticket[];
  projects: Project[];
  users: User[];
  comments: Comment[];
  activities: Activity[];
  currentUser: User | null;
  currentProjectId: string | null;

  // Azioni Ticket
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  moveTicket: (id: string, newStatus: TicketStatus) => void;
  getTicketById: (id: string) => Ticket | undefined;
  getTicketsByProject: (projectId: string) => Ticket[];
  getTicketsByStatus: (projectId: string, status: TicketStatus) => Ticket[];

  // Azioni Progetto
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  setCurrentProject: (id: string | null) => void;

  // Azioni Utente
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => string;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;

  // Azioni Commenti
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => string;
  deleteComment: (id: string) => void;
  getCommentsByTicket: (ticketId: string) => Comment[];

  // Azioni Attività
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  getActivitiesByTicket: (ticketId: string) => Activity[];

  // Statistiche
  getProjectStats: (projectId: string) => {
    total: number;
    byStatus: Record<TicketStatus, number>;
    byPriority: Record<TicketPriority, number>;
    byType: Record<TicketType, number>;
  };

  // Inizializzazione dati demo
  initDemoData: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Stato iniziale
      tickets: [],
      projects: [],
      users: [],
      comments: [],
      activities: [],
      currentUser: null,
      currentProjectId: null,

      // Ticket Actions
      addTicket: (ticket) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newTicket: Ticket = {
          ...ticket,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ tickets: [...state.tickets, newTicket] }));
        
        // Registra attività
        get().addActivity({
          ticketId: id,
          userId: ticket.reporterId,
          action: 'created',
          newValue: ticket.title,
        });
        
        return id;
      },

      updateTicket: (id, updates) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));

        // Registra attività per cambio stato
        if (updates.status) {
          const ticket = get().getTicketById(id);
          if (ticket && ticket.status !== updates.status) {
            get().addActivity({
              ticketId: id,
              userId: get().currentUser?.id || ticket.reporterId,
              action: 'status_changed',
              oldValue: ticket.status,
              newValue: updates.status,
            });
          }
        }
      },

      deleteTicket: (id) => {
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
          comments: state.comments.filter((c) => c.ticketId !== id),
          activities: state.activities.filter((a) => a.ticketId !== id),
        }));
      },

      moveTicket: (id, newStatus) => {
        const ticket = get().getTicketById(id);
        if (ticket && ticket.status !== newStatus) {
          get().updateTicket(id, { status: newStatus });
        }
      },

      getTicketById: (id) => {
        return get().tickets.find((t) => t.id === id);
      },

      getTicketsByProject: (projectId) => {
        return get().tickets.filter((t) => t.projectId === projectId);
      },

      getTicketsByStatus: (projectId, status) => {
        return get().tickets.filter((t) => t.projectId === projectId && t.status === status);
      },

      // Project Actions
      addProject: (project) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newProject: Project = {
          ...project,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return id;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tickets: state.tickets.filter((t) => t.projectId !== id),
        }));
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      setCurrentProject: (id) => {
        set({ currentProjectId: id });
      },

      // User Actions
      addUser: (user) => {
        const id = uuidv4();
        const newUser: User = {
          ...user,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return id;
      },

      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      setCurrentUser: (user) => {
        set({ currentUser: user });
      },

      // Comment Actions
      addComment: (comment) => {
        const id = uuidv4();
        const newComment: Comment = {
          ...comment,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ comments: [...state.comments, newComment] }));
        return id;
      },

      deleteComment: (id) => {
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        }));
      },

      getCommentsByTicket: (ticketId) => {
        return get().comments
          .filter((c) => c.ticketId === ticketId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      // Activity Actions
      addActivity: (activity) => {
        const id = uuidv4();
        const newActivity: Activity = {
          ...activity,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ activities: [...state.activities, newActivity] }));
      },

      getActivitiesByTicket: (ticketId) => {
        return get().activities
          .filter((a) => a.ticketId === ticketId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      // Statistics
      getProjectStats: (projectId) => {
        const tickets = get().getTicketsByProject(projectId);
        return {
          total: tickets.length,
          byStatus: {
            backlog: tickets.filter((t) => t.status === 'backlog').length,
            todo: tickets.filter((t) => t.status === 'todo').length,
            in_progress: tickets.filter((t) => t.status === 'in_progress').length,
            review: tickets.filter((t) => t.status === 'review').length,
            done: tickets.filter((t) => t.status === 'done').length,
          },
          byPriority: {
            low: tickets.filter((t) => t.priority === 'low').length,
            medium: tickets.filter((t) => t.priority === 'medium').length,
            high: tickets.filter((t) => t.priority === 'high').length,
            critical: tickets.filter((t) => t.priority === 'critical').length,
          },
          byType: {
            bug: tickets.filter((t) => t.type === 'bug').length,
            feature: tickets.filter((t) => t.type === 'feature').length,
            task: tickets.filter((t) => t.type === 'task').length,
            improvement: tickets.filter((t) => t.type === 'improvement').length,
          },
        };
      },

      // Init Demo Data
      initDemoData: () => {
        const state = get();
        if (state.users.length > 0) return; // Già inizializzato

        // Crea utenti demo
        const adminId = state.addUser({
          name: 'Mario Rossi',
          email: 'mario.rossi@example.com',
          role: 'admin',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario',
        });

        const dev1Id = state.addUser({
          name: 'Laura Bianchi',
          email: 'laura.bianchi@example.com',
          role: 'developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
        });

        const dev2Id = state.addUser({
          name: 'Giuseppe Verdi',
          email: 'giuseppe.verdi@example.com',
          role: 'developer',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Giuseppe',
        });

        const testerId = state.addUser({
          name: 'Anna Neri',
          email: 'anna.neri@example.com',
          role: 'tester',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
        });

        state.setCurrentUser(state.users.find((u) => u.id === adminId) || null);

        // Crea progetti demo
        const project1Id = state.addProject({
          name: 'Sito Web Aziendale',
          description: 'Rilancio del sito web corporate con nuovo design',
          key: 'WEB',
          color: '#3B82F6',
          members: [adminId, dev1Id, dev2Id],
        });

        const project2Id = state.addProject({
          name: 'App Mobile',
          description: 'Applicazione mobile per iOS e Android',
          key: 'APP',
          color: '#10B981',
          members: [adminId, dev1Id, testerId],
        });

        state.setCurrentProject(project1Id);

        // Crea ticket demo
        const ticketData = [
          { title: 'Setup progetto React', status: 'done', priority: 'high', type: 'task', assignee: dev1Id },
          { title: 'Design homepage', status: 'done', priority: 'medium', type: 'feature', assignee: dev2Id },
          { title: 'Implementare navbar', status: 'in_progress', priority: 'medium', type: 'feature', assignee: dev1Id },
          { title: 'Fix responsive mobile', status: 'todo', priority: 'high', type: 'bug', assignee: dev2Id },
          { title: 'Ottimizzazione SEO', status: 'backlog', priority: 'low', type: 'improvement', assignee: null },
          { title: 'Integrazione API', status: 'review', priority: 'critical', type: 'feature', assignee: dev1Id },
          { title: 'Test unitari', status: 'todo', priority: 'medium', type: 'task', assignee: testerId },
          { title: 'Documentazione API', status: 'backlog', priority: 'low', type: 'task', assignee: null },
        ];

        ticketData.forEach((t) => {
          state.addTicket({
            projectId: project1Id,
            title: t.title,
            description: `Descrizione dettagliata per: ${t.title}`,
            status: t.status as TicketStatus,
            priority: t.priority as TicketPriority,
            type: t.type as TicketType,
            assigneeId: t.assignee || undefined,
            reporterId: adminId,
            labels: [t.type],
            estimatedHours: Math.floor(Math.random() * 8) + 1,
          });
        });

        // Ticket per progetto 2
        state.addTicket({
          projectId: project2Id,
          title: 'Setup React Native',
          description: 'Configurazione ambiente di sviluppo mobile',
          status: 'in_progress',
          priority: 'high',
          type: 'task',
          assigneeId: dev1Id,
          reporterId: adminId,
          labels: ['setup'],
          estimatedHours: 4,
        });

        state.addTicket({
          projectId: project2Id,
          title: 'Design UI app',
          description: 'Creazione mockup interfaccia mobile',
          status: 'todo',
          priority: 'medium',
          type: 'feature',
          assigneeId: dev2Id,
          reporterId: adminId,
          labels: ['design'],
          estimatedHours: 8,
        });
      },
    }),
    {
      name: 'taskflow-storage',
      partialize: (state) => ({
        tickets: state.tickets,
        projects: state.projects,
        users: state.users,
        comments: state.comments,
        activities: state.activities,
        currentUser: state.currentUser,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);
