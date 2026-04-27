// @ts-ignore
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Link as LinkIcon, AlertTriangle, Send, MessageCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// @ts-ignore
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import StatCard from '../components/child/StatCard';
import GlucoseChart from '../components/child/GlucoseChart';
// @ts-ignore
import { Droplets, TrendingUp, Utensils, Syringe } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlucoseAlertSystem from '../components/GlucoseAlertSystem';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';

export default function ParentDashboard() {
  const [childEmailInput, setChildEmailInput] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [reminderMsg, setReminderMsg] = useState('');
  const [reminderType, setReminderType] = useState('general');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // @ts-ignore
  const linkedChildren = user?.linked_children || [];

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    // @ts-ignore
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  // @ts-ignore
  const childUser = allUsers.find(u => u.email === (selectedChild || linkedChildren[0]));
  const activeChild = selectedChild || linkedChildren[0];

  const { data: glucoseLogs = [] } = useQuery({
    queryKey: ['glucoseLogsChild', activeChild],
    // @ts-ignore
    queryFn: () => base44.entities.GlucoseLog.filter({ user_email: activeChild }, '-log_date', 50),
    enabled: !!activeChild,
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogsChild', activeChild],
    // @ts-ignore
    queryFn: () => base44.entities.MealLog.filter({ user_email: activeChild }, '-log_date', 20),
    enabled: !!activeChild,
  });

  const { data: insulinLogs = [] } = useQuery({
    queryKey: ['insulinLogsChild', activeChild],
    // @ts-ignore
    queryFn: () => base44.entities.InsulinLog.filter({ user_email: activeChild }, '-log_date', 20),
    enabled: !!activeChild,
  });

  const { data: myAlerts = [] } = useQuery({
    // @ts-ignore
    queryKey: ['parentAlerts', user?.email],
    // @ts-ignore
    queryFn: () => base44.entities.ParentReminder.filter({ to_email: user.email }, '-sent_at', 20),
    // @ts-ignore
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  // @ts-ignore
  const unreadAlerts = myAlerts.filter(a => !a.is_read);

  const markAllRead = async () => {
    // @ts-ignore
    await Promise.all(unreadAlerts.map(a => base44.entities.ParentReminder.update(a.id, { is_read: true })));
    queryClient.invalidateQueries({ queryKey: ['parentAlerts'] });
  };

  const linkChild = async () => {
    const updated = [...new Set([...linkedChildren, childEmailInput.trim()])];
    await base44.auth.updateMe({ linked_children: updated });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setChildEmailInput('');
    setShowLink(false);
    toast.success('Child account linked!');
  };

  const sendReminderMutation = useMutation({
    // @ts-ignore
    mutationFn: () => base44.entities.ParentReminder.create({
      // @ts-ignore
      from_email: user.email,
      to_email: activeChild,
      message: reminderMsg,
      reminder_type: reminderType,
      is_read: false,
      sent_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      toast.success('Reminder sent! 📬');
      setReminderMsg('');
      setShowReminderForm(false);
    },
  });

  const avgGlucose = glucoseLogs.length > 0
    // @ts-ignore
    ? Math.round(glucoseLogs.reduce((s, l) => s + l.glucose_level, 0) / glucoseLogs.length)
    : '--';
  const latestGlucose = glucoseLogs[0]?.glucose_level || '--';
  // @ts-ignore
  const todayCarbs = mealLogs.filter(m => new Date(m.log_date).toDateString() === new Date().toDateString()).reduce((s, m) => s + (m.carbs || 0), 0);
  // @ts-ignore
  const todayInsulin = insulinLogs.filter(i => new Date(i.log_date).toDateString() === new Date().toDateString()).reduce((s, i) => s + (i.units || 0), 0);
  // @ts-ignore
  const alerts = glucoseLogs.filter(l => l.glucose_level < 70 || l.glucose_level > 250).length;

  return (
    <div className="space-y-6">
      <GlucoseAlertSystem userEmail={user?.
// @ts-ignore
      email} role="parent" />
      <NotificationPermissionBanner />

      {linkedChildren.length === 0 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Parent Dashboard</h1>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h2 className="font-bold text-slate-700 mb-2">Link Your Child's Account</h2>
            <p className="text-slate-400 text-sm mb-6">Enter your child's email to start monitoring their health.</p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input 
// @ts-ignore
              value={childEmailInput} onChange={e => setChildEmailInput(e.target.value)} placeholder="child@email.com" className="rounded-xl" />
              <
// @ts-ignore
              Button onClick={linkChild} disabled={!childEmailInput.trim()} className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl">Link</Button>
            </div>
          </div>
        </div>
      )}

      {linkedChildren.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Parent Dashboard</h1>
              <p className="text-slate-400 text-sm">Monitoring {childUser?.full_name || activeChild}</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {unreadAlerts.length > 0 && (
                <button onClick={markAllRead} className="relative w-10 h-10 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Bell className="w-5 h-5 text-red-500" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadAlerts.length}</span>
                </button>
              )}
              <Link to="/DoctorChat">
                <
// @ts-ignore
                Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <MessageCircle className="w-4 h-4" /> 💬 Chat
                </Button>
              </Link>
              {activeChild && (
                <Link to={`/MedicalDocuments?child=${activeChild}`}>
                  <
// @ts-ignore
                  Button variant="outline" size="sm" className="rounded-xl gap-2">📁 Docs</Button>
                </Link>
              )}
              <Dialog open={showLink} onOpenChange={setShowLink}>
                <DialogTrigger asChild>
                  <
// @ts-ignore
                  Button variant="outline" size="sm" className="rounded-xl gap-2"><LinkIcon className="w-4 h-4" /> Link</Button>
                </DialogTrigger>
                <
// @ts-ignore
                DialogContent className="rounded-2xl">
                  <
// @ts-ignore
                  DialogHeader><DialogTitle>Link Child Account</DialogTitle></DialogHeader>
                  <div className="space-y-3 mt-2">
                    <Input 
// @ts-ignore
                    value={childEmailInput} onChange={e => setChildEmailInput(e.target.value)} placeholder="Child's email" className="rounded-xl" />
                    <
// @ts-ignore
                    Button onClick={linkChild} className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500">Link</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Glucose Alerts */}
          {unreadAlerts.filter(
// @ts-ignore
          a => a.message?.includes('ALERT')).length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 space-y-2">
              <p className="font-bold text-red-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Glucose Alerts!</p>
              {unreadAlerts.filter(
// @ts-ignore
              a => a.message?.includes('ALERT')).map(a => (
                <div key={a.id} className="bg-white rounded-xl p-3 border border-red-100 text-sm text-slate-700">{a.message}</div>
              ))}
            </div>
          )}

          {/* Child selector */}
          {linkedChildren.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {linkedChildren.map(
// @ts-ignore
              em => (
                <button key={em} onClick={() => setSelectedChild(em)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeChild === em ? 'bg-teal-500 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  {allUsers.find(
// @ts-ignore
                  u => u.email === em)?.full_name || em}
                </button>
              ))}
            </div>
          )}

          {/* Send Reminder */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-amber-800 text-sm">📬 Send Reminder to Child</p>
              <button onClick={() => setShowReminderForm(!showReminderForm)} className="text-amber-500 text-xs underline">{showReminderForm ? 'Cancel' : 'New'}</button>
            </div>
            {showReminderForm && (
              <div className="space-y-3">
                <Select value={reminderType} onValueChange={setReminderType}>
                  <
// @ts-ignore
                  SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
                  <
// @ts-ignore
                  SelectContent>
                    <
// @ts-ignore
                    SelectItem value="glucose_test">🩸 Check Blood Sugar</SelectItem>
                    <
// @ts-ignore
                    SelectItem value="insulin">💉 Take Insulin</SelectItem>
                    <
// @ts-ignore
                    SelectItem value="meal">🍱 Log Your Meal</SelectItem>
                    <
// @ts-ignore
                    SelectItem value="general">📢 General Message</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input 
// @ts-ignore
                  value={reminderMsg} onChange={e => setReminderMsg(e.target.value)} placeholder="Type a message..." className="rounded-xl bg-white flex-1" />
                  <
// @ts-ignore
                  Button onClick={() => sendReminderMutation.mutate()} disabled={!reminderMsg.trim()} className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Droplets} label="Last Glucose" value={latestGlucose} unit="mg/dL" color="bg-teal-500" bgColor="bg-teal-50" />
            <StatCard icon={TrendingUp} label="Avg Glucose" value={avgGlucose} unit="mg/dL" color="bg-blue-500" bgColor="bg-blue-50" />
            <StatCard icon={Utensils} label="Today Carbs" value={todayCarbs} unit="g" color="bg-amber-500" bgColor="bg-amber-50" />
            <StatCard icon={AlertTriangle} label="Alert Logs" value={alerts} unit="total" color="bg-red-500" bgColor="bg-red-50" />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">📈 Glucose Trend — {childUser?.full_name || activeChild}</h2>
            <GlucoseChart logs={glucoseLogs} />
          </div>
        </div>
      )}
    </div>
  );
}