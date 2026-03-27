-- ============================================
-- TaskFlow - Schema Database Supabase
-- ============================================

-- Abilita RLS (Row Level Security) per tutte le tabelle
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- ============================================
-- TABELLE
-- ============================================

-- Tabella Profili Utente (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('admin', 'developer', 'tester', 'viewer')),
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Progetti
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    key TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3B82F6',
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Membri Progetto (relazione many-to-many)
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Tabella Ticket
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    type TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('bug', 'feature', 'task', 'improvement')),
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    labels TEXT[] DEFAULT '{}',
    due_date TIMESTAMPTZ,
    estimated_hours INTEGER,
    logged_hours INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Commenti
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Attività (Audit Log)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Allegati
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Notifiche
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('ticket_assigned', 'ticket_mentioned', 'comment_added', 'status_changed', 'due_soon')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella Email Config (per invio email)
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    from_email TEXT DEFAULT 'noreply@taskflow.app',
    from_name TEXT DEFAULT 'TaskFlow',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDICI
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON public.tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee_id ON public.tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_reporter_id ON public.tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON public.comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_activities_ticket_id ON public.activities(ticket_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies per profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policies per projects
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update projects" ON public.projects
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "Owners can delete projects" ON public.projects
    FOR DELETE USING (owner_id = auth.uid());

-- Policies per project_members
CREATE POLICY "Users can view project members" ON public.project_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())))
    );

CREATE POLICY "Project owners can manage members" ON public.project_members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = project_id AND user_id = auth.uid() AND role = 'admin')
    );

-- Policies per tickets
CREATE POLICY "Users can view project tickets" ON public.tickets
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())))
    );

CREATE POLICY "Project members can create tickets" ON public.tickets
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())))
    );

CREATE POLICY "Project members can update tickets" ON public.tickets
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND (owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())))
    );

CREATE POLICY "Project owners can delete tickets" ON public.tickets
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND owner_id = auth.uid()) OR
        reporter_id = auth.uid()
    );

-- Policies per comments
CREATE POLICY "Users can view ticket comments" ON public.comments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tickets t 
            JOIN public.projects p ON t.project_id = p.id 
            WHERE t.id = ticket_id AND (p.owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())))
    );

CREATE POLICY "Project members can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (SELECT 1 FROM public.tickets t 
            JOIN public.projects p ON t.project_id = p.id 
            WHERE t.id = ticket_id AND (p.owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())))
    );

CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (author_id = auth.uid());

-- Policies per activities
CREATE POLICY "Users can view ticket activities" ON public.activities
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.tickets t 
            JOIN public.projects p ON t.project_id = p.id 
            WHERE t.id = ticket_id AND (p.owner_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = p.id AND pm.user_id = auth.uid())))
    );

-- Policies per notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- FUNZIONI TRIGGER
-- ============================================

-- Funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Funzione per creare profilo dopo registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'developer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare profilo dopo registrazione
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funzione per registrare attività
CREATE OR REPLACE FUNCTION public.log_ticket_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_old_value TEXT;
    v_new_value TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action := 'created';
        v_new_value := NEW.title;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            v_action := 'status_changed';
            v_old_value := OLD.status;
            v_new_value := NEW.status;
        ELSIF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id THEN
            v_action := 'assignee_changed';
            v_old_value := OLD.assignee_id::TEXT;
            v_new_value := NEW.assignee_id::TEXT;
        ELSIF OLD.priority IS DISTINCT FROM NEW.priority THEN
            v_action := 'priority_changed';
            v_old_value := OLD.priority;
            v_new_value := NEW.priority;
        ELSE
            v_action := 'updated';
            v_new_value := NEW.title;
        END IF;
    END IF;

    IF v_action IS NOT NULL THEN
        INSERT INTO public.activities (ticket_id, user_id, action, old_value, new_value)
        VALUES (NEW.id, COALESCE(current_setting('request.jwt.claims', true)::json->>'sub', NEW.reporter_id)::UUID, v_action, v_old_value, v_new_value);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per log attività ticket
CREATE TRIGGER on_ticket_change
    AFTER INSERT OR UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.log_ticket_activity();

-- Funzione per creare notifica quando un ticket viene assegnato
CREATE OR REPLACE FUNCTION public.notify_ticket_assigned()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assignee_id IS NOT NULL AND (OLD IS NULL OR OLD.assignee_id IS DISTINCT FROM NEW.assignee_id) THEN
        INSERT INTO public.notifications (user_id, type, title, message, ticket_id)
        VALUES (
            NEW.assignee_id,
            'ticket_assigned',
            'Nuovo ticket assegnato',
            'Ti è stato assegnato il ticket: ' || NEW.title,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_ticket_assigned
    AFTER INSERT OR UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.notify_ticket_assigned();

-- ============================================
-- DATI INIZIALI
-- ============================================

-- Template email predefiniti
INSERT INTO public.email_templates (name, subject, html_content, text_content) VALUES
('welcome', 'Benvenuto su TaskFlow!', 
'<h1>Benvenuto su TaskFlow!</h1><p>Ciao {{name}},</p><p>Il tuo account è stato creato con successo. Inizia a gestire i tuoi progetti!</p><p><a href="{{login_url}}">Accedi ora</a></p>',
'Benvenuto su TaskFlow! Ciao {{name}}, il tuo account è stato creato. Accedi: {{login_url}}'),

('ticket_assigned', 'Nuovo ticket assegnato - {{ticket_title}}',
'<h1>Nuovo Ticket Assegnato</h1><p>Ciao {{name}},</p><p>Il ticket <strong>{{ticket_title}}</strong> ti è stato assegnato nel progetto {{project_name}}.</p><p><a href="{{ticket_url}}">Visualizza Ticket</a></p>',
'Nuovo ticket assegnato: {{ticket_title}} nel progetto {{project_name}}. {{ticket_url}}'),

('comment_mentioned', 'Sei stato menzionato in un commento',
'<h1>Nuova Menzione</h1><p>Ciao {{name}},</p><p>Sei stato menzionato in un commento sul ticket <strong>{{ticket_title}}</strong>.</p><p><a href="{{ticket_url}}">Visualizza Commento</a></p>',
'Sei stato menzionato nel ticket {{ticket_title}}. {{ticket_url}}'),

('due_soon', 'Ticket in scadenza - {{ticket_title}}',
'<h1>Ticket in Scadenza</h1><p>Ciao {{name}},</p><p>Il ticket <strong>{{ticket_title}}</strong> scade il {{due_date}}.</p><p><a href="{{ticket_url}}">Visualizza Ticket</a></p>',
'Ticket in scadenza: {{ticket_title}} - Scade il {{due_date}}. {{ticket_url}}');
