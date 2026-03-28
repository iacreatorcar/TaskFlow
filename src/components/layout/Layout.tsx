import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { ProjectsView } from '@/components/views/ProjectsView';
import { TeamView } from '@/components/views/TeamView';
import { SettingsView } from '@/components/views/SettingsView';
import { LoginView } from '@/components/views/LoginView';
import { useStore } from '@/store/useStore';

export type View = 'dashboard' | 'board' | 'projects' | 'team' | 'settings';

export function Layout() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { currentUser, initDemoData } = useStore();

  useEffect(() => {
    initDemoData();
  }, []);

  // Se non c'è un utente loggato, mostra la login view
  if (!currentUser) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'board':
        return <KanbanBoard />;
      case 'projects':
        return <ProjectsView />;
      case 'team':
        return <TeamView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full p-6 overflow-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}