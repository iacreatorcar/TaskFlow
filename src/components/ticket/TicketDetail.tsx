import { useState, useEffect } from 'react';
import { X, History, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/store/useStore';
import type { Ticket, TicketStatus, TicketPriority, TicketType } from '@/types';
import { TYPE_LABELS, PRIORITY_COLORS } from '@/types';

interface TicketDetailProps {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<TicketStatus, string> = {
  backlog: 'Backlog',
  todo: 'Da Fare',
  in_progress: 'In Corso',
  review: 'In Revisione',
  done: 'Completato',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'Bassa',
  medium: 'Media',
  high: 'Alta',
  critical: 'Critica',
};

export function TicketDetail({ ticket, open, onOpenChange }: TicketDetailProps) {
  const { users, projects, updateTicket, addComment, getCommentsByTicket, getActivitiesByTicket, currentUser } = useStore();
  
  const [editedTicket, setEditedTicket] = useState<Ticket>(ticket);
  const [newComment, setNewComment] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const project = projects.find((p) => p.id === ticket.projectId);
  const assignee = users.find((u) => u.id === ticket.assigneeId);
  const reporter = users.find((u) => u.id === ticket.reporterId);
  const comments = getCommentsByTicket(ticket.id);
  const activities = getActivitiesByTicket(ticket.id);

  useEffect(() => {
    setEditedTicket(ticket);
  }, [ticket]);

  const handleSave = () => {
    updateTicket(ticket.id, editedTicket);
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;
    addComment({
      ticketId: ticket.id,
      authorId: currentUser.id,
      content: newComment,
    });
    setNewComment('');
  };

  const handleAddLabel = () => {
    if (!newLabel.trim()) return;
    const updatedLabels = [...editedTicket.labels, newLabel.trim()];
    setEditedTicket({ ...editedTicket, labels: updatedLabels });
    setNewLabel('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updatedLabels = editedTicket.labels.filter((l) => l !== labelToRemove);
    setEditedTicket({ ...editedTicket, labels: updatedLabels });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">
                  {project?.key}-{ticket.id.slice(0, 6).toUpperCase()}
                </span>
                <Badge 
                  variant="outline"
                  style={{ borderColor: PRIORITY_COLORS[ticket.priority], color: PRIORITY_COLORS[ticket.priority] }}
                >
                  {priorityLabels[ticket.priority]}
                </Badge>
                <Badge variant="secondary">{TYPE_LABELS[ticket.type]}</Badge>
              </div>
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? (
                  <Input
                    value={editedTicket.title}
                    onChange={(e) => setEditedTicket({ ...editedTicket, title: e.target.value })}
                    className="font-semibold"
                  />
                ) : (
                  ticket.title
                )}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setEditedTicket(ticket); }}>
                    <X className="w-4 h-4 mr-1" />
                    Annulla
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Salva
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Modifica
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Colonna principale */}
          <div className="flex-1 overflow-y-auto pr-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Dettagli</TabsTrigger>
                <TabsTrigger value="comments">
                  Commenti ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="activity">Attività</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Descrizione */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Descrizione</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedTicket.description}
                      onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                      rows={6}
                      placeholder="Aggiungi una descrizione..."
                    />
                  ) : (
                    <div className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      {ticket.description || 'Nessuna descrizione'}
                    </div>
                  )}
                </div>

                {/* Labels */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Etichette</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editedTicket.labels.map((label) => (
                      <Badge key={label} variant="secondary" className="flex items-center gap-1">
                        {label}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveLabel(label)}
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        placeholder="Nuova etichetta"
                        className="w-40"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                      />
                      <Button size="sm" onClick={handleAddLabel}>Aggiungi</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                {/* Nuovo commento */}
                {currentUser && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Aggiungi un commento..."
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                          Commenta
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Lista commenti */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nessun commento</p>
                  ) : (
                    comments.map((comment) => {
                      const author = users.find((u) => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={author?.avatar} />
                            <AvatarFallback>{author?.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{author?.name}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-3">
                  {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nessuna attività</p>
                  ) : (
                    activities.map((activity) => {
                      const user = users.find((u) => u.id === activity.userId);
                      return (
                        <div key={activity.id} className="flex items-start gap-3 text-sm">
                          <History className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="font-medium">{user?.name}</span>{' '}
                            <span className="text-gray-600">
                              {activity.action === 'created' && 'ha creato il ticket'}
                              {activity.action === 'status_changed' && (
                                <>ha cambiato stato da <strong>{statusLabels[activity.oldValue as TicketStatus]}</strong> a <strong>{statusLabels[activity.newValue as TicketStatus]}</strong></>
                              )}
                            </span>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {formatDate(activity.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 space-y-4 border-l pl-6 overflow-y-auto">
            {/* Stato */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Stato</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.status}
                  onValueChange={(value) => setEditedTicket({ ...editedTicket, status: value as TicketStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium">{statusLabels[ticket.status]}</div>
              )}
            </div>

            {/* Assegnatario */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Assegnatario</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.assigneeId || 'unassigned'}
                  onValueChange={(value) => setEditedTicket({ ...editedTicket, assigneeId: value === 'unassigned' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Non assegnato</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <>
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">Non assegnato</span>
                  )}
                </div>
              )}
            </div>

            {/* Reporter */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Creatore</Label>
              <div className="flex items-center gap-2">
                {reporter && (
                  <>
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={reporter.avatar} />
                      <AvatarFallback>{reporter.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reporter.name}</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Priorità */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Priorità</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.priority}
                  onValueChange={(value) => setEditedTicket({ ...editedTicket, priority: value as TicketPriority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm">{priorityLabels[ticket.priority]}</div>
              )}
            </div>

            {/* Tipo */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Tipo</Label>
              {isEditing ? (
                <Select
                  value={editedTicket.type}
                  onValueChange={(value) => setEditedTicket({ ...editedTicket, type: value as TicketType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="improvement">Miglioramento</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm">{TYPE_LABELS[ticket.type]}</div>
              )}
            </div>

            <Separator />

            {/* Ore stimate */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Ore Stimate</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedTicket.estimatedHours || ''}
                  onChange={(e) => setEditedTicket({ ...editedTicket, estimatedHours: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-24"
                />
              ) : (
                <div className="text-sm">{ticket.estimatedHours ? `${ticket.estimatedHours}h` : '-'}</div>
              )}
            </div>

            {/* Data scadenza */}
            <div>
              <Label className="text-xs text-gray-500 uppercase font-semibold mb-1 block">Scadenza</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedTicket.dueDate?.split('T')[0] || ''}
                  onChange={(e) => setEditedTicket({ ...editedTicket, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              ) : (
                <div className="text-sm">
                  {ticket.dueDate ? formatDate(ticket.dueDate).split(',')[0] : '-'}
                </div>
              )}
            </div>

            <Separator />

            {/* Date creazione/modifica */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Creato: {formatDate(ticket.createdAt)}</div>
              <div>Modificato: {formatDate(ticket.updatedAt)}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
