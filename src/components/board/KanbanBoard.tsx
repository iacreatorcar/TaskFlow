import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TicketCard } from '@/components/ticket/TicketCard';
import { CreateTicketForm } from './CreateTicketForm';
import { useStore } from '@/store/useStore';
import { DEFAULT_COLUMNS, type TicketStatus } from '@/types';

export function KanbanBoard() {
  const { t } = useTranslation();
  const { tickets, projects, currentProjectId, users, moveTicket } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  const filteredTickets = useMemo(() => {
    let result = tickets.filter((t) => t.projectId === currentProjectId);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query)
      );
    }

    if (filterAssignee !== 'all') {
      result = result.filter((t) =>
        filterAssignee === 'unassigned'
          ? !t.assigneeId
          : t.assigneeId === filterAssignee
      );
    }

    if (filterPriority !== 'all') {
      result = result.filter((t) => t.priority === filterPriority);
    }

    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    return result;
  }, [tickets, currentProjectId, searchQuery, filterAssignee, filterPriority, filterType]);

  const ticketsByColumn = useMemo(() => {
    const grouped: Record<TicketStatus, typeof tickets> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    filteredTickets.forEach((ticket) => {
      grouped[ticket.status].push(ticket);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key as TicketStatus].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    return grouped;
  }, [filteredTickets]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TicketStatus;

    moveTicket(draggableId, newStatus);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterAssignee('all');
    setFilterPriority('all');
    setFilterType('all');
  };

  const hasFilters = searchQuery || filterAssignee !== 'all' || filterPriority !== 'all' || filterType !== 'all';

  // Colonna titles tradotti
  const columnTitles: Record<string, string> = {
    backlog: t('backlog'),
    todo: t('todo'),
    in_progress: t('in_progress'),
    review: t('review'),
    done: t('done'),
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('seleziona_progetto_board')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con filtri */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
            <p className="text-gray-500 text-sm">{currentProject.description}</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('nuovo_ticket')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t('crea_nuovo_ticket')}</DialogTitle>
              </DialogHeader>
              <CreateTicketForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtri */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('cerca_ticket')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder={t('assegnatario')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('tutti_assegnatari')}</SelectItem>
              <SelectItem value="unassigned">{t('non_assegnato')}</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t('priorita')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('tutte_priorita')}</SelectItem>
              <SelectItem value="low">{t('priorita_bassa')}</SelectItem>
              <SelectItem value="medium">{t('priorita_media')}</SelectItem>
              <SelectItem value="high">{t('priorita_alta')}</SelectItem>
              <SelectItem value="critical">{t('priorita_critica')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t('tipo')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('tutti_tipi')}</SelectItem>
              <SelectItem value="bug">{t('tipo_bug')}</SelectItem>
              <SelectItem value="feature">{t('tipo_feature')}</SelectItem>
              <SelectItem value="task">{t('tipo_task')}</SelectItem>
              <SelectItem value="improvement">{t('tipo_miglioramento')}</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              {t('cancella_filtri')}
            </Button>
          )}
        </div>
      </div>

      {/* Board Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {DEFAULT_COLUMNS.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 flex flex-col bg-gray-50 rounded-lg"
            >
              {/* Header colonna */}
              <div
                className="flex items-center justify-between p-3 rounded-t-lg"
                style={{ backgroundColor: `${column.color}15` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="font-semibold text-sm">{columnTitles[column.id]}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {ticketsByColumn[column.id].length}
                  </span>
                </div>
              </div>

              {/* Area drop */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-1 p-3 min-h-[200px] rounded-b-lg transition-colors
                      ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : ''}
                    `}
                  >
                    {ticketsByColumn[column.id].map((ticket, index) => (
                      <TicketCard key={ticket.id} ticket={ticket} index={index} />
                    ))}
                    {provided.placeholder}

                    {ticketsByColumn[column.id].length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {t('nessun_ticket')}
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
