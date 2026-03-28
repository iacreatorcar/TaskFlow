import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store/useStore';
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
import type { TicketStatus, TicketPriority, TicketType } from '@/types';

interface CreateTicketFormProps {
  onSuccess: () => void;
}

export function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const { t } = useTranslation();
  const { users, currentProjectId, currentUser, addTicket } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('todo');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [type, setType] = useState<TicketType>('task');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [labels, setLabels] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !currentProjectId || !currentUser) return;

    addTicket({
      projectId: currentProjectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      type,
      assigneeId: assigneeId || undefined,
      reporterId: currentUser.id,
      labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">{t('titolo')} *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('inserisci_titolo_ticket')}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">{t('descrizione')}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('descrivi_ticket_dettaglio')}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">{t('tipo')}</Label>
          <Select value={type} onValueChange={(v) => setType(v as TicketType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">{t('tipo_bug')}</SelectItem>
              <SelectItem value="feature">{t('tipo_feature')}</SelectItem>
              <SelectItem value="task">{t('tipo_task')}</SelectItem>
              <SelectItem value="improvement">{t('tipo_miglioramento')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority">{t('priorita')}</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('priorita_bassa')}</SelectItem>
              <SelectItem value="medium">{t('priorita_media')}</SelectItem>
              <SelectItem value="high">{t('priorita_alta')}</SelectItem>
              <SelectItem value="critical">{t('priorita_critica')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">{t('stato')}</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">{t('backlog')}</SelectItem>
              <SelectItem value="todo">{t('todo')}</SelectItem>
              <SelectItem value="in_progress">{t('in_progress')}</SelectItem>
              <SelectItem value="review">{t('review')}</SelectItem>
              <SelectItem value="done">{t('done')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignee">{t('assegnatario')}</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger>
              <SelectValue placeholder={t('seleziona_assegnatario')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('non_assegnato')}</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="estimatedHours">{t('ore_stimate')}</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder={t('esempio_ore')}
          />
        </div>

        <div>
          <Label htmlFor="dueDate">{t('data_scadenza')}</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="labels">{t('etichette')}</Label>
        <Input
          id="labels"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          placeholder={t('esempio_etichette')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          {t('annulla')}
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          {t('crea_ticket')}
        </Button>
      </div>
    </form>
  );
}