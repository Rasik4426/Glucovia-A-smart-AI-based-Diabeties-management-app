import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Bell, Phone } from 'lucide-react';
import GlucoseChart from '../components/child/GlucoseChart';
import StreakBadge from '../components/child/StreakBadge';
import RecentLogs from '../components/child/RecentLogs';
import EmojiPop, { useEmojiPop } from '../components/child/EmojiPop';
import GlucoseAlertSystem from '../components/GlucoseAlertSystem';
import NotificationPermissionBanner from '../components/NotificationPermissionBanner';
import OfflineBanner from '../components/OfflineBanner';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlucoseFeedback } from '../components/child/GlucoseFeedback';

const quickActions = [
  { path: '/LogEntry?type=glucose', label: 'Log Sugar 🩸', emoji: '🩸', color: 'from-teal-400 to-emerald-500', shadow: 'shadow-teal-200' },
  { path: '/LogEntry?type=meal', label: 'Log Meal 🍱', emoji: '🍱', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
  { path: '/LogEntry?type=insulin', label: 'Log Insulin 💉', emoji: '💉', color: 'from-purple-400 to-violet-500', shadow: 'shadow-purple-200' },
  { path: '/DoctorChat', label: 'Chat Doctor 💬', emoji: '💬', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200' },
  { path: '/MedicalDocuments', label: 'My Docs 📁', emoji: '📁', color: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-200' },
];

export default function ChildDashboard() {
  const { popEvent, triggerPop, clearPop } = useEmojiPop();
  const [showReminders, setShowReminders] = useState(false);

  // ✅ FIXED USER QUERY
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // ✅ DEBUG LOGS
  console.log("USER:", user);
  console.log("LOADING:", isLoading);
  console.log("ERROR:", error);

  // ✅ PREVENT STUCK SCREEN
  if (isLoading) return <div style={{ padding: 20 }}>Loading user...</div>;
  if (error) return <div style={{ padding: 20 }}>Error loading user</div>;
  if (!user) return <div style={{ padding: 20 }}>User not found in database</div>;

  const email = user?.email;

  const { data: glucoseLogs = [] } = useQuery({
    queryKey: ['glucoseLogs', email],
    queryFn: () => base44.entities.GlucoseLog.filter({ user_email: email }, '-log_date', 50),
    enabled: !!email,
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogs', email],
    queryFn: () => base44.entities.MealLog.filter({ user_email: email }, '-log_date', 20),
    enabled: !!email,
  });

  const { data: insulinLogs = [] } = useQuery({
    queryKey: ['insulinLogs', email],
    queryFn: () => base44.entities.InsulinLog.filter({ user_email: email }, '-log_date', 20),
    enabled: !!email,
  });

  const latestGlucose = glucoseLogs[0]?.glucose_level;
  const todayCarbs = mealLogs
    .filter(m => new Date(m.log_date).toDateString() === new Date().toDateString())
    .reduce((sum, m) => sum + (m.carbs || 0), 0);

  const todayInsulin = insulinLogs
    .filter(i => new Date(i.log_date).toDateString() === new Date().toDateString())
    .reduce((sum, i) => sum + (i.units || 0), 0);

  const avgGlucose = glucoseLogs.length > 0
    ? Math.round(glucoseLogs.reduce((s, l) => s + l.glucose_level, 0) / glucoseLogs.length)
    : '--';

  const glucoseFeedback = latestGlucose ? getGlucoseFeedback(latestGlucose) : null;
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-5 pb-6">
      <GlucoseAlertSystem userEmail={email} role="child" />
      <EmojiPop popEvent={popEvent} onDone={clearPop} />
      <NotificationPermissionBanner />
      <OfflineBanner />

      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
        Hey {firstName}! 👋
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <div>Last Sugar: {latestGlucose || '--'}</div>
        <div>Avg Sugar: {avgGlucose}</div>
        <div>Carbs Today: {todayCarbs}</div>
        <div>Insulin Today: {todayInsulin}</div>
      </div>

      <GlucoseChart logs={glucoseLogs} />
      <RecentLogs glucoseLogs={glucoseLogs} mealLogs={mealLogs} insulinLogs={insulinLogs} />
    </div>
  );
}