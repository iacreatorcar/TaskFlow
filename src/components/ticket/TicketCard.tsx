import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Draggable } from '@hello-pangea/dnd';
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  MoreHorizontal, 
  AlertCircle,
  Bug,
  Sparkles,
  ClipboardList,
  Zap,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TicketDetail } from './TicketDetail';
import { useStore } from '@/store/useStore';
import type { Ticket } from '@/types';
import { PRIORITY_COLORS } from '@/types';

interface TicketCardProps {
  ticket: Ticket;
  index: number;
}

const priorityIcons = {
  low: <AlertCircle className="w-3 h-3" />,
  medium: <AlertCircle className="w-3 h-3" />,
  high: <AlertCircle className="w-3 h-3" />,
  critical: <AlertCircle className="w-3 h-3" />,
};

const typeIconsMap = {
  bug: <Bug className="w-3 h-3" />,
  feature: <Sparkles className="w-3 h-3" />,
  task: <ClipboardList className="w-3 h-3" />,
  improvement: <Zap className="w-3 h-3" />,
};

export function TicketCard({ ticket, index }: TicketCardProps) {
  const { t, i18n } = useTranslation();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { users, deleteTicket, getCommentsByTicket } = useStore();

  const assignee = users.find((u) => u.id === ticket.assigneeId);
  const comments = getCommentsByTicket(ticket.id);
  const priorityColor = PRIORITY_COLORS[ticket.priority];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirm_delete_ticket'))) {
      deleteTicket(ticket.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const locale = i18n.language === 'it' ? 'it-IT' : 'en-US';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  // Mappa per le priorità tradotte
  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: t('priorita_bassa'),
      medium: t('priorita_media'),
      high: t('priorita_alta'),
      critical: t('priorita_critica'),
    };
    return labels[priority] || priority;
  };

  // Mappa per i tipi tradotti
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bug: t('tipo_bug'),
      feature: t('tipo_feature'),
      task: t('tipo_task'),
      improvement: t('tipo_miglioramento'),
    };
    return labels[type] || type;
  };

  return (
    <>
      <Draggable draggableId={ticket.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setIsDetailOpen(true)}
            className={`
              group relative bg-white rounded-lg border p-3 mb-2 cursor-pointer
              transition-all duration-200 hover:shadow-md
              ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400 rotate-2' : ''}
            `}
            style={{
              ...provided.draggableProps.style,
            }}
          >
            {/* Header con tipo e priorità */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500" title={getTypeLabel(ticket.type)}>
                  {typeIconsMap[ticket.type]}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {ticket.projectId.slice(0, 4).toUpperCase()}-{ticket.id.slice(0, 4).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${priorityColor}20`,
                    color: priorityColor 
                  }}
                >
                  {priorityIcons[ticket.priority]}
                  <span className="capitalize">{getPriorityLabel(ticket.priority)}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
                      {t('modifica')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                      {t('elimina')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Titolo */}
            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
              {ticket.title}
            </h4>

            {/* Labels */}
            {ticket.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {ticket.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs px-1.5 py-0">
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Footer con info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {/* Assegnatario */}
                {assignee ? (
                  <div className="flex items-center gap-1" title={assignee.name}>
                    {assignee.avatar ? (
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center" title={t('non_assegnato')}>
                    <User className="w-3 h-3 text-gray-400" />
                  </div>
                )}

                {/* Commenti */}
                {comments.length > 0 && (
                  <div className="flex items-center gap-0.5" title={`${comments.length} ${t('commenti')}`}>
                    <MessageSquare className="w-3 h-3" />
                    <span>{comments.length}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Ore stimate */}
                {ticket.estimatedHours && (
                  <div className="flex items-center gap-0.5" title={t('ore_stimate')}>
                    <Clock className="w-3 h-3" />
                    <span>{ticket.estimatedHours}h</span>
                  </div>
                )}

                {/* Data scadenza */}
                {ticket.dueDate && (
                  <div className="flex items-center gap-0.5 text-orange-600" title={t('data_scadenza')}>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(ticket.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>

      <TicketDetail
        ticket={ticket}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </>
  );
}