export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          role: 'admin' | 'developer' | 'tester' | 'viewer'
          department: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          role?: 'admin' | 'developer' | 'tester' | 'viewer'
          department?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: 'admin' | 'developer' | 'tester' | 'viewer'
          department?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          key: string
          color: string
          owner_id: string
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          key: string
          color?: string
          owner_id: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          key?: string
          color?: string
          owner_id?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
          priority: 'low' | 'medium' | 'high' | 'critical'
          type: 'bug' | 'feature' | 'task' | 'improvement'
          assignee_id: string | null
          reporter_id: string
          labels: string[]
          due_date: string | null
          estimated_hours: number | null
          logged_hours: number
          parent_id: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          type?: 'bug' | 'feature' | 'task' | 'improvement'
          assignee_id?: string | null
          reporter_id: string
          labels?: string[]
          due_date?: string | null
          estimated_hours?: number | null
          logged_hours?: number
          parent_id?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          type?: 'bug' | 'feature' | 'task' | 'improvement'
          assignee_id?: string | null
          reporter_id?: string
          labels?: string[]
          due_date?: string | null
          estimated_hours?: number | null
          logged_hours?: number
          parent_id?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          content: string
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          content: string
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          content?: string
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          action: string
          old_value: string | null
          new_value: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          action: string
          old_value?: string | null
          new_value?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          action?: string
          old_value?: string | null
          new_value?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          ticket_id: string
          uploaded_by: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          public_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          uploaded_by: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          public_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          uploaded_by?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          public_url?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'ticket_assigned' | 'ticket_mentioned' | 'comment_added' | 'status_changed' | 'due_soon'
          title: string
          message: string
          ticket_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'ticket_assigned' | 'ticket_mentioned' | 'comment_added' | 'status_changed' | 'due_soon'
          title: string
          message: string
          ticket_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'ticket_assigned' | 'ticket_mentioned' | 'comment_added' | 'status_changed' | 'due_soon'
          title?: string
          message?: string
          ticket_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          html_content: string
          text_content: string | null
          from_email: string
          from_name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          html_content: string
          text_content?: string | null
          from_email?: string
          from_name?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          html_content?: string
          text_content?: string | null
          from_email?: string
          from_name?: string
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
