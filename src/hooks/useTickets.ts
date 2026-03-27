import { useState, useCallback } from 'react';
import { db, realtime } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type TicketStatus = Database['public']['Tables']['tickets']['Row']['status'];

interface UseTicketsReturn {
  tickets: Ticket[];
  isLoading: boolean;
  error: any;
  fetchTickets: (projectId?: string) => Promise<void>;
  fetchTicket: (id: string) => Promise<Ticket | null>;
  createTicket: (ticket: Omit<TicketInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Ticket | null; error: any }>;
  updateTicket: (id: string, updates: TicketUpdate) => Promise<{ data: Ticket | null; error: any }>;
  deleteTicket: (id: string) => Promise<{ error: any }>;
  moveTicket: (id: string, newStatus: TicketStatus, newPosition?: number) => Promise<{ data: Ticket | null; error: any }>;
  getTicketsByStatus: (projectId: string, status: TicketStatus) => Ticket[];
  subscribeToTickets: (projectId: string, callback: (payload: any) => void) => (() => void);
}

export function useTickets(): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Recupera tutti i ticket
  const fetchTickets = useCallback(async (projectId?: string) => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.tickets.getAll(projectId);
    
    if (error) {
      setError(error);
    } else {
      setTickets(data || []);
    }
    
    setIsLoading(false);
  }, []);

  // Recupera un ticket specifico
  const fetchTicket = useCallback(async (id: string): Promise<Ticket | null> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.tickets.getById(id);
    
    if (error) {
      setError(error);
      setIsLoading(false);
      return null;
    }
    
    setIsLoading(false);
    return data;
  }, []);

  // Crea un nuovo ticket
  const createTicket = async (
    ticket: Omit<TicketInsert, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Ticket | null; error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.tickets.create(ticket);
    
    if (error) {
      setError(error);
    } else if (data) {
      setTickets((prev) => [data, ...prev]);
    }
    
    setIsLoading(false);
    return { data, error };
  };

  // Aggiorna un ticket
  const updateTicket = async (id: string, updates: TicketUpdate): Promise<{ data: Ticket | null; error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.tickets.update(id, updates);
    
    if (error) {
      setError(error);
    } else if (data) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? data : t))
      );
    }
    
    setIsLoading(false);
    return { data, error };
  };

  // Elimina un ticket
  const deleteTicket = async (id: string): Promise<{ error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { error } = await db.tickets.delete(id);
    
    if (error) {
      setError(error);
    } else {
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
    
    setIsLoading(false);
    return { error };
  };

  // Sposta ticket (cambia stato e posizione)
  const moveTicket = async (
    id: string,
    newStatus: TicketStatus,
    newPosition?: number
  ): Promise<{ data: Ticket | null; error: any }> => {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await db.tickets.updatePosition(
      id,
      newStatus,
      newPosition || 0
    );
    
    if (error) {
      setError(error);
    } else if (data) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? data : t))
      );
    }
    
    setIsLoading(false);
    return { data, error };
  };

  // Filtra ticket per stato
  const getTicketsByStatus = useCallback(
    (projectId: string, status: TicketStatus): Ticket[] => {
      return tickets
        .filter((t) => t.project_id === projectId && t.status === status)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
    },
    [tickets]
  );

  // Sottoscrizione realtime ai ticket
  const subscribeToTickets = useCallback(
    (projectId: string, callback: (payload: any) => void) => {
      const subscription = realtime.subscribeToTickets(projectId, callback);
      
      return () => {
        subscription.unsubscribe();
      };
    },
    []
  );

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    fetchTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
    getTicketsByStatus,
    subscribeToTickets,
  };
}
