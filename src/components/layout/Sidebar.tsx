import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Kanban,
  FolderKanban,
  Users,
  Settings,
  ChevronDown,
  Plus,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/store/useStore';
import type { View } from './Layout';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { t } = useTranslation();
  const { projects, currentProjectId, currentUser, setCurrentProject, addProject, setCurrentUser } = useStore();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectKey, setNewProjectKey] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectKey.trim() || !currentUser) return;

    const id = addProject({
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      key: newProjectKey.trim().toUpperCase(),
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      members: [currentUser.id],
    });

    setCurrentProject(id);
    setIsCreateProjectOpen(false);
    setNewProjectName('');
    setNewProjectKey('');
    setNewProjectDesc('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const navItems = [
    { id: 'dashboard' as View, label: t('dashboard'), icon: LayoutDashboard },
    { id: 'board' as View, label: t('board'), icon: Kanban },
    { id: 'projects' as View, label: t('progetti'), icon: FolderKanban },
    { id: 'team' as View, label: t('team'), icon: Users },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Kanban className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">TaskFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
              ${currentView === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Progetti */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">{t('progetti')}</span>
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('crea_nuovo_progetto')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('nome_progetto')} *</Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder={t('esempio_sito_web')}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">{t('key_progetto')} * ({t('univoca')})</Label>
                    <Input
                      id="key"
                      value={newProjectKey}
                      onChange={(e) => setNewProjectKey(e.target.value.toUpperCase())}
                      placeholder="Es: WEB"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('descrizione')}</Label>
                    <Textarea
                      id="description"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder={t('descrivi_progetto')}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                      {t('annulla')}
                    </Button>
                    <Button type="submit" disabled={!newProjectName.trim() || !newProjectKey.trim()}>
                      {t('crea_progetto')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setCurrentProject(project.id);
                  onViewChange('board');
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left
                  ${currentProjectId === project.id 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate text-sm">{project.name}</span>
                <span className="ml-auto text-xs text-gray-500">{project.key}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-800">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{t(currentUser.role)}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onViewChange('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                {t('impostazioni')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => onViewChange('settings')}>
            <User className="w-4 h-4 mr-2" />
            {t('accedi')}
          </Button>
        )}
      </div>
    </div>
  );
}