import { createClient } from '@supabase/supabase-js';

// Queste variabili verranno configurate in Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper per auth
export const auth = {
  // Registrazione
  signUp: async (email: string, password: string, metadata?: { name?: string; role?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // Login
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Login con OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github' | 'gitlab') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Listen auth changes
  onAuthStateChange: (callback: (event: any, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper per database
export const db = {
  // Profiles
  profiles: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      return { data, error };
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    uploadAvatar: async (file: File, userId: string) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      await db.profiles.update(userId, { avatar_url: publicUrl });
      
      return { publicUrl };
    },
  },

  // Projects
  projects: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(*),
          members:project_members(
            id,
            role,
            user:profiles(*)
          )
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(*),
          members:project_members(
            id,
            role,
            user:profiles(*)
          )
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },
    create: async (project: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      return { data, error };
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Project Members
  projectMembers: {
    add: async (projectId: string, userId: string, role = 'member') => {
      const { data, error } = await supabase
        .from('project_members')
        .insert({ project_id: projectId, user_id: userId, role })
        .select()
        .single();
      return { data, error };
    },
    remove: async (id: string) => {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', id);
      return { error };
    },
    updateRole: async (id: string, role: string) => {
      const { data, error } = await supabase
        .from('project_members')
        .update({ role })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Tickets
  tickets: {
    getAll: async (projectId?: string) => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          assignee:profiles!tickets_assignee_id_fkey(*),
          reporter:profiles!tickets_reporter_id_fkey(*),
          project:projects!inner(*)
        `);
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      return { data, error };
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          assignee:profiles!tickets_assignee_id_fkey(*),
          reporter:profiles!tickets_reporter_id_fkey(*),
          project:projects!inner(*),
          comments:comments(
            *,
            author:profiles!comments_author_id_fkey(*)
          ),
          activities:activities(
            *,
            user:profiles!activities_user_id_fkey(*)
          )
        `)
        .eq('id', id)
        .single();
      return { data, error };
    },
    getByStatus: async (projectId: string, status: string) => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          assignee:profiles!tickets_assignee_id_fkey(*),
          reporter:profiles!tickets_reporter_id_fkey(*)
        `)
        .eq('project_id', projectId)
        .eq('status', status)
        .order('position', { ascending: true });
      return { data, error };
    },
    create: async (ticket: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single();
      return { data, error };
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);
      return { error };
    },
    updatePosition: async (id: string, status: string, position: number) => {
      const { data, error } = await supabase
        .from('tickets')
        .update({ status, position })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Comments
  comments: {
    getByTicket: async (ticketId: string) => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!comments_author_id_fkey(*)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    create: async (comment: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select(`
          *,
          author:profiles!comments_author_id_fkey(*)
        `)
        .single();
      return { data, error };
    },
    update: async (id: string, content: string) => {
      const { data, error } = await supabase
        .from('comments')
        .update({ content, is_edited: true })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Activities
  activities: {
    getByTicket: async (ticketId: string) => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:profiles!activities_user_id_fkey(*)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
  },

  // Notifications
  notifications: {
    getAll: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          ticket:tickets(id, title, project_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    getUnread: async (userId: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      return { data, error };
    },
    markAsRead: async (id: string) => {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    markAllAsRead: async (userId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      return { error };
    },
    delete: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Attachments
  attachments: {
    upload: async (file: File, ticketId: string, userId: string) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `tickets/${ticketId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          ticket_id: ticketId,
          uploaded_by: userId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: filePath,
          public_url: publicUrl,
        })
        .select()
        .single();
      
      return { data, error };
    },
    delete: async (id: string, storagePath: string) => {
      // Delete from storage
      await supabase.storage.from('attachments').remove([storagePath]);
      
      // Delete from database
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);
      
      return { error };
    },
  },
};

// Realtime subscriptions
export const realtime = {
  subscribeToTickets: (projectId: string, callback: (payload: unknown) => void) => {
    return supabase
      .channel(`tickets:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `project_id=eq.${projectId}`,
        },
        callback
      )
      .subscribe();
  },
  subscribeToComments: (ticketId: string, callback: (payload: unknown) => void) => {
    return supabase
      .channel(`comments:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        callback
      )
      .subscribe();
  },
  subscribeToNotifications: (userId: string, callback: (payload: unknown) => void) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

export default supabase;
