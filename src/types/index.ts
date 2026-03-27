// Tipi per il sistema di ticketing

export type TicketStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketType = 'bug' | 'feature' | 'task' | 'improvement';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'tester' | 'viewer';
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  key: string; // Es: "PROJ", "DEV"
  color: string;
  members: string[]; // User IDs
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assigneeId?: string;
  reporterId: string;
  labels: string[];
  dueDate?: string;
  estimatedHours?: number;
  loggedHours?: number;
  parentId?: string; // Per sub-task
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Column {
  id: TicketStatus;
  title: string;
  color: string;
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'todo', title: 'Da Fare', color: '#3B82F6' },
  { id: 'in_progress', title: 'In Corso', color: '#F59E0B' },
  { id: 'review', title: 'In Revisione', color: '#8B5CF6' },
  { id: 'done', title: 'Completato', color: '#10B981' },
];

export const PRIORITY_COLORS = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  critical: '#EF4444',
};

export const TYPE_ICONS = {
  bug: '🐛',
  feature: '✨',
  task: '📋',
  improvement: '⚡',
};

export const TYPE_LABELS = {
  bug: 'Bug',
  feature: 'Feature',
  task: 'Task',
  improvement: 'Miglioramento',
};
