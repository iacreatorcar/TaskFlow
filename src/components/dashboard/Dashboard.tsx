import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FolderOpen,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { PRIORITY_COLORS } from '@/types';

export function Dashboard() {
  const { tickets, projects, currentProjectId } = useStore();

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const stats = useMemo(() => {
    const projectTickets = currentProjectId
      ? tickets.filter((t) => t.projectId === currentProjectId)
      : tickets;

    const total = projectTickets.length;
    const done = projectTickets.filter((t) => t.status === 'done').length;
    const inProgress = projectTickets.filter((t) => t.status === 'in_progress').length;
    const todo = projectTickets.filter((t) => t.status === 'todo').length;
    const review = projectTickets.filter((t) => t.status === 'review').length;
    const backlog = projectTickets.filter((t) => t.status === 'backlog').length;

    const byPriority = {
      low: projectTickets.filter((t) => t.priority === 'low').length,
      medium: projectTickets.filter((t) => t.priority === 'medium').length,
      high: projectTickets.filter((t) => t.priority === 'high').length,
      critical: projectTickets.filter((t) => t.priority === 'critical').length,
    };

    const byType = {
      bug: projectTickets.filter((t) => t.type === 'bug').length,
      feature: projectTickets.filter((t) => t.type === 'feature').length,
      task: projectTickets.filter((t) => t.type === 'task').length,
      improvement: projectTickets.filter((t) => t.type === 'improvement').length,
    };

    return {
      total,
      done,
      inProgress,
      todo,
      review,
      backlog,
      byPriority,
      byType,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [tickets, currentProjectId]);

  const statusData = [
    { name: 'Backlog', value: stats.backlog, color: '#6B7280' },
    { name: 'Da Fare', value: stats.todo, color: '#3B82F6' },
    { name: 'In Corso', value: stats.inProgress, color: '#F59E0B' },
    { name: 'In Revisione', value: stats.review, color: '#8B5CF6' },
    { name: 'Completato', value: stats.done, color: '#10B981' },
  ];

  const priorityData = [
    { name: 'Bassa', value: stats.byPriority.low, color: PRIORITY_COLORS.low },
    { name: 'Media', value: stats.byPriority.medium, color: PRIORITY_COLORS.medium },
    { name: 'Alta', value: stats.byPriority.high, color: PRIORITY_COLORS.high },
    { name: 'Critica', value: stats.byPriority.critical, color: PRIORITY_COLORS.critical },
  ];

  const typeData = [
    { name: 'Bug', value: stats.byType.bug },
    { name: 'Feature', value: stats.byType.feature },
    { name: 'Task', value: stats.byType.task },
    { name: 'Miglioramento', value: stats.byType.improvement },
  ];

  const recentTickets = useMemo(() => {
    return [...tickets]
      .filter((t) => !currentProjectId || t.projectId === currentProjectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tickets, currentProjectId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard {currentProject ? `- ${currentProject.name}` : 'Generale'}
        </h1>
        <p className="text-gray-500 text-sm">
          Panoramica delle attività e statistiche del progetto
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Ticket</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              nel progetto corrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completati</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.done}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Corso</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              attivamente lavorati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Priorità Alta</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byPriority.high + stats.byPriority.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              richiedono attenzione
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stato Ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priorità */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket per Priorità</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tipo Ticket e Progetti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket per Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Recenti */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nessun ticket</p>
              ) : (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{ticket.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${PRIORITY_COLORS[ticket.priority]}20`,
                        color: PRIORITY_COLORS[ticket.priority],
                      }}
                    >
                      {ticket.priority}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Progetto */}
      {currentProject && (
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Progetto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm text-gray-500">{currentProject.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Key</p>
                  <p className="text-sm text-gray-500">{currentProject.key}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Membri</p>
                  <p className="text-sm text-gray-500">{currentProject.members.length} utenti</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
