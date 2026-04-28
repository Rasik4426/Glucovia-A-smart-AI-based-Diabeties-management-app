// @ts-nocheck
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plus, Trash2, Droplets, Utensils, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  me,
  filterReminders,
  createSelfReminder,
  updateSelfReminder,
  deleteSelfReminder,
} from '@/api/api';

const typeIcons = { glucose_test: Droplets, meal: Utensils, insulin: Syringe };
const typeColors = {
  glucose_test: 'bg-teal-100 text-teal-600',
  meal: 'bg-amber-100 text-amber-600',
  insulin: 'bg-purple-100 text-purple-600',
};

export default function Reminders() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => me(),
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders', user?.email],
    queryFn: () => filterReminders({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: () => createSelfReminder({
      user_email: user.email,
      title: title || type.replace('_', ' '),
      description: type,
      reminder_time: time,
      reminder_date: new Date().toISOString().split('T')[0],
      is_active: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setOpen(false);
      setType('');
      setTime('');
      setTitle('');
      toast.success('Reminder created!');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => updateSelfReminder(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSelfReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reminders</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>New Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glucose_test">Glucose Test</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="insulin">Insulin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input placeholder="e.g. Morning check" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl" />
              </div>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!type || !time}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500"
              >
                Create Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No reminders yet. Add one to stay on track!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map(r => {
            const Icon = typeIcons[r.description] || typeIcons[r.reminder_type] || Bell;
            return (
              <div key={r.id} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColors[r.description] || typeColors[r.reminder_type] || 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-700 text-sm">{r.title || r.reminder_type?.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-400">{r.reminder_time}</p>
                </div>
                <Switch
                  checked={r.is_active}
                  onCheckedChange={(val) => toggleMutation.mutate({ id: r.id, is_active: val })}
                />
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(r.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

