import { useState } from 'react';
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
        <Label htmlFor="title">Titolo *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Inserisci il titolo del ticket"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrivi il ticket in dettaglio"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(v) => setType(v as TicketType)}>
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
        </div>

        <div>
          <Label htmlFor="priority">Priorità</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Bassa</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Critica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Stato</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="todo">Da Fare</SelectItem>
              <SelectItem value="in_progress">In Corso</SelectItem>
              <SelectItem value="review">In Revisione</SelectItem>
              <SelectItem value="done">Completato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="assignee">Assegnatario</Label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleziona assegnatario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Non assegnato</SelectItem>
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
          <Label htmlFor="estimatedHours">Ore Stimate</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="Es: 4"
          />
        </div>

        <div>
          <Label htmlFor="dueDate">Data Scadenza</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="labels">Etichette (separate da virgola)</Label>
        <Input
          id="labels"
          value={labels}
          onChange={(e) => setLabels(e.target.value)}
          placeholder="Es: frontend, urgente, refactor"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Annulla
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Crea Ticket
        </Button>
      </div>
    </form>
  );
}
