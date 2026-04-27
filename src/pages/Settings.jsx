import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, User, Target, Plus, X, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const [targetMin, setTargetMin] = useState(user?.target_glucose_min || 70);
  const [targetMax, setTargetMax] = useState(user?.target_glucose_max || 180);
  const [isf, setIsf] = useState(user?.insulin_sensitivity_factor || 50);
  const [icr, setIcr] = useState(user?.carb_ratio || 15);
  const [newChild, setNewChild] = useState('');
  const linkedEmails = user?.linked_child_emails || [];

  const saveTargets = async () => {
    await base44.auth.updateMe({
      target_glucose_min: parseFloat(targetMin),
      target_glucose_max: parseFloat(targetMax),
      insulin_sensitivity_factor: parseFloat(isf),
      carb_ratio: parseFloat(icr),
    });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    toast.success('Settings saved!');
  };

  const addChild = async () => {
    if (!newChild) return;
    await base44.auth.updateMe({ linked_child_emails: [...linkedEmails, newChild] });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setNewChild('');
    toast.success('Child linked!');
  };

  const removeChild = async (email) => {
    await base44.auth.updateMe({ linked_child_emails: linkedEmails.filter(e => e !== email) });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    toast.success('Removed');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Settings</h1>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-teal-500" />
          <h2 className="font-bold text-slate-800">Profile</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-slate-400">Name</span><p className="font-medium text-slate-700">{user?.full_name}</p></div>
          <div><span className="text-slate-400">Email</span><p className="font-medium text-slate-700">{user?.email}</p></div>
          <div><span className="text-slate-400">Role</span><p className="font-medium text-slate-700 capitalize">{user?.role}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-blue-500" />
          <h2 className="font-bold text-slate-800">Glucose Targets</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Min (mg/dL)</Label>
            <Input type="number" value={targetMin} onChange={e => setTargetMin(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Max (mg/dL)</Label>
            <Input type="number" value={targetMax} onChange={e => setTargetMax(e.target.value)} className="rounded-xl" />
          </div>
        </div>
        <Button onClick={saveTargets} className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500">Save Targets</Button>
      </div>

      {user?.role === 'child' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Syringe className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-slate-800">Insulin Settings</h2>
          </div>
          <p className="text-xs text-slate-500">Set with your doctor's guidance. These values are used to calculate insulin dose suggestions.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sensitivity Factor (ISF)</Label>
              <Input type="number" value={isf} onChange={e => setIsf(e.target.value)} className="rounded-xl" placeholder="50" />
              <p className="text-xs text-slate-400">mg/dL drop per 1 unit</p>
            </div>
            <div className="space-y-2">
              <Label>Carb Ratio (ICR)</Label>
              <Input type="number" value={icr} onChange={e => setIcr(e.target.value)} className="rounded-xl" placeholder="15" />
              <p className="text-xs text-slate-400">grams carbs per 1 unit</p>
            </div>
          </div>
          <Button onClick={saveTargets} className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500">Save Insulin Settings</Button>
        </div>
      )}

      {(user?.role === 'parent' || user?.role === 'doctor') && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-800">Linked Children</h2>
          <div className="flex gap-2">
            <Input placeholder="child@email.com" value={newChild} onChange={e => setNewChild(e.target.value)} className="rounded-xl" />
            <Button onClick={addChild} className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {linkedEmails.map(email => (
            <div key={email} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2">
              <span className="text-sm text-slate-700">{email}</span>
              <Button variant="ghost" size="icon" onClick={() => removeChild(email)}>
                <X className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}