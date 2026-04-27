// @ts-nocheck
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Droplets, Utensils, Syringe, Check, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import CarbCounter from '@/components/log/CarbCounter';
import InsulinDoseSuggestion from '@/components/log/InsulinDoseSuggestion';
import GlucoseFeedback from '@/components/child/GlucoseFeedback';
import EmojiPop, { useEmojiPop } from '@/components/child/EmojiPop';
import OfflineBanner from '@/components/OfflineBanner';
import { saveGlucosePending, saveInsulinPending } from '@/lib/offlineDB';

const tabs = [
  { id: 'glucose', label: 'Glucose', icon: Droplets, color: 'from-teal-400 to-emerald-500' },
  { id: 'meal', label: 'Meal', icon: Utensils, color: 'from-amber-400 to-orange-500' },
  { id: 'insulin', label: 'Insulin', icon: Syringe, color: 'from-purple-400 to-violet-500' },
];

export default function LogEntry() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialType = urlParams.get('type') || 'glucose';
  const [activeTab, setActiveTab] = useState(initialType);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { popEvent, triggerPop, clearPop } = useEmojiPop();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  // Send alert notifications to parents and doctors when glucose is out of range
  const sendGlucoseAlerts = async (level) => {
    if (!user || (level >= 70 && level <= 250)) return;
    const isLow = level < 70;
    const alertMsg = isLow
      ? `🚨 LOW SUGAR ALERT: ${user.full_name || user.email} logged a blood sugar of ${level} mg/dL (LOW). Please check on them immediately!`
      : `⚠️ HIGH SUGAR ALERT: ${user.full_name || user.email} logged a blood sugar of ${level} mg/dL (HIGH). Please review.`;

    // Find parents who linked this child
    const parents = allUsers.filter(u => u.role === 'parent' && (u.linked_children || []).includes(user.email));
    // Find doctors who linked this child
    const doctors = allUsers.filter(u => u.role === 'doctor' && (u.linked_child_emails || []).includes(user.email));
    const recipients = [...parents, ...doctors];

    await Promise.all(recipients.map(r =>
      base44.entities.ParentReminder.create({
        from_email: user.email,
        to_email: r.email,
        message: alertMsg,
        reminder_type: 'glucose_test',
        is_read: false,
        sent_at: new Date().toISOString(),
      })
    ));
  };

  // Glucose form
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [measurementTime, setMeasurementTime] = useState('');
  const [glucoseNotes, setGlucoseNotes] = useState('');

  // Meal form
  const [mealType, setMealType] = useState('');
  const [foodItems, setFoodItems] = useState('');
  const [carbs, setCarbs] = useState('');
  const [useSmartCounter, setUseSmartCounter] = useState(true);

  // Insulin form
  const [insulinType, setInsulinType] = useState('');
  const [units, setUnits] = useState('');
  const [insulinNotes, setInsulinNotes] = useState('');
  const [currentBGForInsulin, setCurrentBGForInsulin] = useState('');
  const [tdd, setTdd] = useState(''); // Total Daily Dose (actrapid)

  const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastLog = user?.last_log_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = user?.streak_days || 0;
    if (lastLog === yesterday) newStreak += 1;
    else if (lastLog !== today) newStreak = 1;
    const newPoints = (user?.points || 0) + 10;
    await base44.auth.updateMe({ streak_days: newStreak, last_log_date: today, points: newPoints });
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  const glucoseMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_email: user.email,
        glucose_level: parseFloat(glucoseLevel),
        measurement_time: measurementTime || undefined,
        notes: glucoseNotes || undefined,
        log_date: new Date().toISOString(),
      };
      if (!navigator.onLine) {
        await saveGlucosePending(payload);
        return { offline: true };
      }
      return base44.entities.GlucoseLog.create(payload);
    },
    onSuccess: async (result) => {
      const level = parseFloat(glucoseLevel);
      if (result?.offline) {
        toast('📶 Saved offline — will sync when back online', { icon: '💾' });
      } else {
        await updateStreak();
        queryClient.invalidateQueries({ queryKey: ['glucoseLogs'] });
        await sendGlucoseAlerts(level);
        toast.success('Glucose logged! +10 points 🎉');
      }
      if (level < 70) triggerPop('low');
      else if (level > 250) triggerPop('high');
      else if (level >= 70 && level <= 180) triggerPop('good');
      else triggerPop('high');
      setTimeout(() => { setSaved(true); setTimeout(() => navigate('/ChildDashboard'), 1200); }, 2900);
    },
  });

  const mealMutation = useMutation({
    mutationFn: () => base44.entities.MealLog.create({
      user_email: user.email,
      meal_type: mealType || undefined,
      food_items: foodItems || undefined,
      carbs: parseFloat(carbs),
      log_date: new Date().toISOString(),
    }),
    onSuccess: async () => {
      await updateStreak();
      queryClient.invalidateQueries({ queryKey: ['mealLogs'] });
      setSaved(true);
      toast.success('Meal logged! +10 points 🎉');
      setTimeout(() => navigate('/ChildDashboard'), 1500);
    },
  });

  const insulinMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        user_email: user.email,
        insulin_type: insulinType || undefined,
        units: parseFloat(units),
        notes: insulinNotes || undefined,
        log_date: new Date().toISOString(),
      };
      if (!navigator.onLine) {
        await saveInsulinPending(payload);
        return { offline: true };
      }
      return base44.entities.InsulinLog.create(payload);
    },
    onSuccess: async (result) => {
      if (result?.offline) {
        toast('📶 Saved offline — will sync when back online', { icon: '💾' });
      } else {
        await updateStreak();
        queryClient.invalidateQueries({ queryKey: ['insulinLogs'] });
        toast.success('Insulin logged! +10 points 🎉');
      }
      setSaved(true);
      setTimeout(() => navigate('/ChildDashboard'), 1500);
    },
  });

  const handleSubmit = () => {
    if (activeTab === 'glucose') glucoseMutation.mutate();
    else if (activeTab === 'meal') mealMutation.mutate();
    else insulinMutation.mutate();
  };

  const isValid = activeTab === 'glucose' ? !!glucoseLevel
    : activeTab === 'meal' ? !!carbs
    : !!units;

  if (saved) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Logged! 🎉</h2>
        <p className="text-slate-500">Great job staying on track!</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <EmojiPop popEvent={popEvent} onDone={clearPop} />
      <OfflineBanner />
      <div className="flex items-center gap-3">
        <Link to="/ChildDashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Log Data</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 rounded-2xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forms */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-5">
        {/* GLUCOSE */}
        {activeTab === 'glucose' && (
          <>
            <div className="space-y-2">
              <Label className="text-slate-700">Blood Glucose Level (mg/dL)</Label>
              <Input
                type="number"
                placeholder="e.g. 120"
                value={glucoseLevel}
                onChange={e => setGlucoseLevel(e.target.value)}
                className="h-12 rounded-xl text-lg"
              />
            </div>

            {/* Live glucose feedback */}
            {glucoseLevel && <GlucoseFeedback level={parseFloat(glucoseLevel)} />}

            <div className="space-y-2">
              <Label className="text-slate-700">When did you measure?</Label>
              <Select value={measurementTime} onValueChange={setMeasurementTime}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_breakfast">Before Breakfast</SelectItem>
                  <SelectItem value="after_breakfast">After Breakfast</SelectItem>
                  <SelectItem value="before_lunch">Before Lunch</SelectItem>
                  <SelectItem value="after_lunch">After Lunch</SelectItem>
                  <SelectItem value="before_dinner">Before Dinner</SelectItem>
                  <SelectItem value="after_dinner">After Dinner</SelectItem>
                  <SelectItem value="bedtime">Bedtime</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Notes (optional)</Label>
              <Textarea placeholder="How are you feeling?" value={glucoseNotes} onChange={e => setGlucoseNotes(e.target.value)} className="rounded-xl" />
            </div>
          </>
        )}

        {/* MEAL */}
        {activeTab === 'meal' && (
          <>
            <div className="space-y-2">
              <Label className="text-slate-700">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select meal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggle between smart counter and manual entry */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUseSmartCounter(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${useSmartCounter ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500'}`}
              >
                🥦 Smart Carb Counter
              </button>
              <button
                type="button"
                onClick={() => setUseSmartCounter(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${!useSmartCounter ? 'border-slate-400 bg-slate-50 text-slate-700' : 'border-slate-200 text-slate-500'}`}
              >
                ✏️ Manual Entry
              </button>
            </div>

            {useSmartCounter ? (
              <div className="space-y-2">
                <Label className="text-slate-700">Search & Add Foods</Label>
                <CarbCounter
                  onTotalCarbsChange={val => setCarbs(String(val))}
                  onFoodItemsChange={val => setFoodItems(val)}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-slate-700">What did you eat?</Label>
                  <Textarea placeholder="e.g. Rice, chicken, salad..." value={foodItems} onChange={e => setFoodItems(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Total Carbs (grams)</Label>
                  <Input type="number" placeholder="e.g. 45" value={carbs} onChange={e => setCarbs(e.target.value)} className="h-12 rounded-xl text-lg" />
                </div>
              </>
            )}
          </>
        )}

        {/* INSULIN */}
        {activeTab === 'insulin' && (
          <>
            <div className="space-y-2">
              <Label className="text-slate-700">Total Daily Actrapid Dose (units/day)</Label>
              <Input
                type="number"
                placeholder="e.g. 45"
                value={tdd}
                onChange={e => setTdd(e.target.value)}
                className="h-12 rounded-xl text-lg"
              />
              <p className="text-xs text-slate-400">Your IS Ratio will be calculated automatically using the 1500 rule</p>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Current Blood Sugar (mg/dL)</Label>
              <Input
                type="number"
                placeholder="e.g. 180"
                value={currentBGForInsulin}
                onChange={e => setCurrentBGForInsulin(e.target.value)}
                className="h-12 rounded-xl text-lg"
              />
            </div>

            {/* Dose suggestion — shows when both TDD and BG are entered */}
            {tdd && currentBGForInsulin && (
              <InsulinDoseSuggestion
                currentGlucose={currentBGForInsulin}
                targetGlucose={user?.target_glucose_max || 140}
                tdd={tdd}
              />
            )}

            <div className="space-y-2">
              <Label className="text-slate-700">Insulin Type</Label>
              <Select value={insulinType} onValueChange={setInsulinType}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rapid">Rapid Acting</SelectItem>
                  <SelectItem value="long_acting">Long Acting</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Units Given</Label>
              <Input type="number" placeholder="e.g. 5" value={units} onChange={e => setUnits(e.target.value)} className="h-12 rounded-xl text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Notes (optional)</Label>
              <Textarea placeholder="Any notes..." value={insulinNotes} onChange={e => setInsulinNotes(e.target.value)} className="rounded-xl" />
            </div>
          </>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-base shadow-lg shadow-teal-200"
        >
          Save Log
        </Button>
      </div>
    </div>
  );
}