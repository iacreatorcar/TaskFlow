import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t, i18n } = useTranslation();
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
    { name: t('backlog'), value: stats.backlog, color: '#6B7280' },
    { name: t('todo'), value: stats.todo, color: '#3B82F6' },
    { name: t('in_progress'), value: stats.inProgress, color: '#F59E0B' },
    { name: t('review'), value: stats.review, color: '#8B5CF6' },
    { name: t('done'), value: stats.done, color: '#10B981' },
  ];

  const priorityData = [
    { name: t('priorita_bassa'), value: stats.byPriority.low, color: PRIORITY_COLORS.low },
    { name: t('priorita_media'), value: stats.byPriority.medium, color: PRIORITY_COLORS.medium },
    { name: t('priorita_alta'), value: stats.byPriority.high, color: PRIORITY_COLORS.high },
    { name: t('priorita_critica'), value: stats.byPriority.critical, color: PRIORITY_COLORS.critical },
  ];

  const typeData = [
    { name: t('tipo_bug'), value: stats.byType.bug },
    { name: t('tipo_feature'), value: stats.byType.feature },
    { name: t('tipo_task'), value: stats.byType.task },
    { name: t('tipo_miglioramento'), value: stats.byType.improvement },
  ];

  const recentTickets = useMemo(() => {
    return [...tickets]
      .filter((t) => !currentProjectId || t.projectId === currentProjectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tickets, currentProjectId]);

  // Funzione per formattare la data in base alla lingua
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(i18n.language === 'it' ? 'it-IT' : 'en-US');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard')} {currentProject ? `- ${currentProject.name}` : t('generale')}
        </h1>
        <p className="text-gray-500 text-sm">
          {t('panoramica_attivita')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totale_ticket')}</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {t('nel_progetto_corrente')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('completati')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.done}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% {t('del_totale')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('in_corso')}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              {t('attivamente_lavorati')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('priorita_alta_label')}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byPriority.high + stats.byPriority.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('richiedono_attenzione')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stato Ticket */}
        <Card>
          <CardHeader>
            <CardTitle>{t('ticket_per_stato')}</CardTitle>
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
            <CardTitle>{t('ticket_per_priorita')}</CardTitle>
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
            <CardTitle>{t('ticket_per_tipo')}</CardTitle>
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
            <CardTitle>{t('ticket_recenti')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t('nessun_ticket')}</p>
              ) : (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{ticket.title}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${PRIORITY_COLORS[ticket.priority]}20`,
                        color: PRIORITY_COLORS[ticket.priority],
                      }}
                    >
                      {t(`priorita_${ticket.priority}`)}
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
            <CardTitle>{t('informazioni_progetto')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{t('nome')}</p>
                  <p className="text-sm text-gray-500">{currentProject.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{t('key')}</p>
                  <p className="text-sm text-gray-500">{currentProject.key}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">{t('membri')}</p>
                  <p className="text-sm text-gray-500">{currentProject.members.length} {t('utenti')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}