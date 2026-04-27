import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stethoscope, Users, Plus, Droplets, TrendingUp, AlertTriangle, Activity, Trash2, MessageCircle, Send, Phone, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import GlucoseChart from '../components/child/GlucoseChart';
import StatCard from '../components/child/StatCard';
import { Link } from 'react-router-dom';
import GlucoseAlertSystem from '../components/GlucoseAlertSystem';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

export default function DoctorDashboard() {
  const [patientEmail, setPatientEmail] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');
  const [reminderType, setReminderType] = useState('general');
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const queryClient = useQueryClient();
  const [showAlerts, setShowAlerts] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    onSuccess: (u) => { if (u?.phone_number && !phone) setPhone(u.phone_number); }
  });

  const { data: doctorAlerts = [] } = useQuery({
    queryKey: ['doctorAlerts', user?.email],
    queryFn: () => base44.entities.ParentReminder.filter({ to_email: user.email }, '-sent_at', 20),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });
  const unreadDoctorAlerts = doctorAlerts.filter(a => !a.is_read && a.message?.includes('ALERT'));
  const markDoctorAlertsRead = async () => {
    await Promise.all(unreadDoctorAlerts.map(a => base44.entities.ParentReminder.update(a.id, { is_read: true })));
    queryClient.invalidateQueries({ queryKey: ['doctorAlerts'] });
    setShowAlerts(false);
  };

  const savePhone = async () => {
    setSavingPhone(true);
    await base44.auth.updateMe({ phone_number: phone });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setSavingPhone(false);
    toast.success('Phone number saved! Patients can now call you. 📞');
  };

  const patients = user?.linked_child_emails || [];

  const { data: glucoseLogs = [] } = useQuery({
    queryKey: ['glucoseLogs', selectedPatient],
    queryFn: () => base44.entities.GlucoseLog.filter({ user_email: selectedPatient }, '-log_date', 100),
    enabled: !!selectedPatient,
  });

  const addPatient = async () => {
    if (!patientEmail) return;
    const updated = [...patients, patientEmail];
    await base44.auth.updateMe({ linked_child_emails: updated });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setPatientEmail('');
    setOpen(false);
    toast.success('Patient added!');
  };

  const removePatient = async (email) => {
    const updated = patients.filter(e => e !== email);
    await base44.auth.updateMe({ linked_child_emails: updated });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    if (selectedPatient === email) setSelectedPatient(null);
    toast.success('Patient removed');
  };

  const sendReminderMutation = useMutation({
    mutationFn: () => base44.entities.ParentReminder.create({
      from_email: user.email,
      to_email: selectedPatient,
      message: reminderMsg,
      reminder_type: reminderType,
      is_read: false,
      sent_at: new Date().toISOString(),
    }),
    onSuccess: () => {
      toast.success('Reminder sent to patient! 📬');
      setReminderMsg('');
      setShowReminderForm(false);
    },
  });

  const avgGlucose = glucoseLogs.length > 0
    ? Math.round(glucoseLogs.reduce((s, l) => s + l.glucose_level, 0) / glucoseLogs.length)
    : null;
  const alerts = glucoseLogs.filter(l => l.glucose_level < 70 || l.glucose_level > 250);

  return (
    <div className="space-y-6">
      <GlucoseAlertSystem userEmail={user?.email} role="doctor" />
      <NotificationPermissionBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Patient monitoring & analytics</p>
        </div>
        <div className="flex gap-2">
          <Link to="/DoctorChat">
            <Button variant="outline" size="sm" className="rounded-xl gap-2"><MessageCircle className="w-4 h-4" /> 💬 Chat</Button>
          </Link>
          {selectedPatient && (
            <Link to={`/MedicalDocuments?child=${selectedPatient}`}>
              <Button variant="outline" size="sm" className="rounded-xl gap-2">📁 Patient Docs</Button>
            </Link>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-purple-500 to-violet-500 shadow-md">
              <Plus className="w-4 h-4 mr-1" /> Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input
                placeholder="patient@email.com"
                value={patientEmail}
                onChange={e => setPatientEmail(e.target.value)}
                className="rounded-xl"
              />
              <Button onClick={addPatient} className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-violet-500">
                Add Patient
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Glucose Alerts for Doctor */}
      {showAlerts && unreadDoctorAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-red-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Patient Glucose Alerts!</p>
            <button onClick={markDoctorAlertsRead} className="text-xs text-red-500 underline">Dismiss all</button>
          </div>
          {unreadDoctorAlerts.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-3 border border-red-100 text-sm text-slate-700">{a.message}</div>
          ))}
        </div>
      )}

      {/* Doctor Phone Number */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <h2 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-500" /> My Contact Number
        </h2>
        <p className="text-xs text-slate-400 mb-3">Patients and parents will be able to call you directly using this number.</p>
        <div className="flex gap-2">
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="rounded-xl flex-1" />
          <Button onClick={savePhone} disabled={savingPhone || !phone.trim()} className="rounded-xl bg-green-500 hover:bg-green-600 gap-2">
            <Save className="w-4 h-4" /> {savingPhone ? 'Saving...' : 'Save'}
          </Button>
        </div>
        {user?.phone_number && (
          <p className="text-xs text-green-600 mt-2">✅ Currently showing: <span className="font-bold">{user.phone_number}</span></p>
        )}
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" /> Patients ({patients.length})
        </h2>
        {patients.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No patients added yet. Click "Add Patient" to start.</p>
        ) : (
          <div className="space-y-2">
            {patients.map(email => (
              <div
                key={email}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  selectedPatient === email ? 'bg-purple-50 border-2 border-purple-300' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                }`}
                onClick={() => setSelectedPatient(email)}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                  {email[0]?.toUpperCase()}
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700 truncate">{email}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); removePatient(email); }}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Patient Data */}
      {selectedPatient && (
        <>
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center justify-between">
            <p className="text-sm text-purple-600 font-medium">Viewing: <span className="font-bold">{selectedPatient}</span></p>
            <button onClick={() => setShowReminderForm(!showReminderForm)} className="text-xs text-purple-600 underline">Send Reminder</button>
          </div>

          {showReminderForm && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
              <p className="font-bold text-amber-800 text-sm">📬 Send Reminder to Patient</p>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="glucose_test">🩸 Check Blood Sugar</SelectItem>
                  <SelectItem value="insulin">💉 Take Insulin</SelectItem>
                  <SelectItem value="meal">🍱 Log Meal</SelectItem>
                  <SelectItem value="general">📢 General Message</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input value={reminderMsg} onChange={e => setReminderMsg(e.target.value)} placeholder="Type message..." className="rounded-xl bg-white flex-1" />
                <Button onClick={() => sendReminderMutation.mutate()} disabled={!reminderMsg.trim()} className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Droplets} label="Last Glucose" value={glucoseLogs[0]?.glucose_level || '--'} unit="mg/dL" color="bg-teal-500" bgColor="bg-teal-50" />
            <StatCard icon={TrendingUp} label="Average" value={avgGlucose || '--'} unit="mg/dL" color="bg-blue-500" bgColor="bg-blue-50" />
            <StatCard icon={Activity} label="Total Logs" value={glucoseLogs.length} color="bg-purple-500" bgColor="bg-purple-50" />
            <StatCard icon={AlertTriangle} label="Alerts" value={alerts.length} color="bg-red-500" bgColor="bg-red-50" />
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4">Glucose Trend</h2>
            <GlucoseChart logs={glucoseLogs} />
          </div>
        </>
      )}
    </div>
  );
}