// @ts-ignore
import React from 'react';
import { useQuery } from '@tanstack/react-query';
// @ts-ignore
import { Trophy, Star, Award, Zap, Flame, Target, Heart, Droplets, Gift, CheckCircle } from 'lucide-react';
import StreakBadge from '@/components/child/StreakBadge';
import { motion } from 'framer-motion';
import {
  me, updateMe, isAuthenticated, logout, navigateToLogin,
  listUsers, filterUsers, createUser,
  createGlucoseLog, filterGlucoseLogs,
  createInsulinLog, filterInsulinLogs,
  createMealLog, filterMealLogs,
  createReminder, filterParentReminders, updateParentReminder,
  sendMessage, filterChatMessages,
  filterMedicalDocuments, deleteDocument, uploadFile,
  createReward,
  filterReminders, createSelfReminder, updateSelfReminder, deleteSelfReminder
} from '@/api/api';

// HbA1c-based tier system
// HbA1c estimation from avg glucose: HbA1c ≈ (avg_glucose + 46.7) / 28.7
// @ts-ignore
const estimateHba1c = (avgGlucose) => {
  if (!avgGlucose || avgGlucose <= 0) return null;
  return Math.round(((avgGlucose + 46.7) / 28.7) * 10) / 10;
};

const hba1cTiers = [
  // Bronze - poor control (HbA1c > 10)
  { name: 'Bronze I', tier: 'Bronze', level: 1, icon: '🥉', color: 'from-amber-700 to-amber-600', border: 'border-amber-400', bg: 'bg-amber-50', desc: 'Started your journey', hba1cMax: 12.5, hba1cMin: 11.5 },
  { name: 'Bronze II', tier: 'Bronze', level: 2, icon: '🥉', color: 'from-amber-700 to-amber-600', border: 'border-amber-400', bg: 'bg-amber-50', desc: 'Making progress', hba1cMax: 11.5, hba1cMin: 10.5 },
  { name: 'Bronze III', tier: 'Bronze', level: 3, icon: '🥉', color: 'from-amber-700 to-amber-600', border: 'border-amber-400', bg: 'bg-amber-50', desc: 'Keep going!', hba1cMax: 10.5, hba1cMin: 9.5 },
  // Silver - slightly better (HbA1c 8-10)
  { name: 'Silver I', tier: 'Silver', level: 1, icon: '🥈', color: 'from-slate-400 to-slate-500', border: 'border-slate-400', bg: 'bg-slate-50', desc: 'Good improvement', hba1cMax: 9.5, hba1cMin: 9.0 },
  { name: 'Silver II', tier: 'Silver', level: 2, icon: '🥈', color: 'from-slate-400 to-slate-500', border: 'border-slate-400', bg: 'bg-slate-50', desc: 'Steady improvement', hba1cMax: 9.0, hba1cMin: 8.5 },
  { name: 'Silver III', tier: 'Silver', level: 3, icon: '🥈', color: 'from-slate-400 to-slate-500', border: 'border-slate-400', bg: 'bg-slate-50', desc: 'Great consistency', hba1cMax: 8.5, hba1cMin: 8.0 },
  // Gold - better control (HbA1c 7-8)
  { name: 'Gold I', tier: 'Gold', level: 1, icon: '🥇', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', bg: 'bg-yellow-50', desc: 'Excellent effort', hba1cMax: 8.0, hba1cMin: 7.7 },
  { name: 'Gold II', tier: 'Gold', level: 2, icon: '🥇', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', bg: 'bg-yellow-50', desc: 'Health champion', hba1cMax: 7.7, hba1cMin: 7.4 },
  { name: 'Gold III', tier: 'Gold', level: 3, icon: '🥇', color: 'from-yellow-400 to-amber-500', border: 'border-yellow-400', bg: 'bg-yellow-50', desc: 'Outstanding control', hba1cMax: 7.4, hba1cMin: 7.0 },
  // Platinum - near target (HbA1c 6.5-7)
  { name: 'Platinum I', tier: 'Platinum', level: 1, icon: '💎', color: 'from-cyan-400 to-teal-500', border: 'border-cyan-300', bg: 'bg-cyan-50', desc: 'Near perfect', hba1cMax: 7.0, hba1cMin: 6.8 },
  { name: 'Platinum II', tier: 'Platinum', level: 2, icon: '💎', color: 'from-cyan-400 to-teal-500', border: 'border-cyan-300', bg: 'bg-cyan-50', desc: 'Exceptional focus', hba1cMax: 6.8, hba1cMin: 6.6 },
  { name: 'Platinum III', tier: 'Platinum', level: 3, icon: '💎', color: 'from-cyan-400 to-teal-500', border: 'border-cyan-300', bg: 'bg-cyan-50', desc: 'Remarkable control', hba1cMax: 6.6, hba1cMin: 6.4 },
  { name: 'Platinum IV', tier: 'Platinum', level: 4, icon: '💎', color: 'from-cyan-400 to-teal-500', border: 'border-cyan-300', bg: 'bg-cyan-50', desc: 'Elite management', hba1cMax: 6.4, hba1cMin: 6.2 },
  // Diamond - excellent (HbA1c 5.7-6.5)
  { name: 'Diamond I', tier: 'Diamond', level: 1, icon: '💠', color: 'from-blue-400 to-indigo-500', border: 'border-blue-300', bg: 'bg-blue-50', desc: 'Superior control', hba1cMax: 6.2, hba1cMin: 6.0 },
  { name: 'Diamond II', tier: 'Diamond', level: 2, icon: '💠', color: 'from-blue-400 to-indigo-500', border: 'border-blue-300', bg: 'bg-blue-50', desc: 'Extraordinary', hba1cMax: 6.0, hba1cMin: 5.9 },
  { name: 'Diamond III', tier: 'Diamond', level: 3, icon: '💠', color: 'from-blue-400 to-indigo-500', border: 'border-blue-300', bg: 'bg-blue-50', desc: 'Almost flawless', hba1cMax: 5.9, hba1cMin: 5.8 },
  { name: 'Diamond IV', tier: 'Diamond', level: 4, icon: '💠', color: 'from-blue-400 to-indigo-500', border: 'border-blue-300', bg: 'bg-blue-50', desc: 'Peak performance', hba1cMax: 5.8, hba1cMin: 5.7 },
  // Legendary - best (HbA1c < 5.7)
  { name: 'Legendary', tier: 'Legendary', level: 1, icon: '👑', color: 'from-violet-500 to-fuchsia-500', border: 'border-violet-400', bg: 'bg-violet-50', desc: 'Perfect control — you are a legend!', hba1cMax: 5.7, hba1cMin: 0 },
];

// Activity badges (streak/log based)
const activityBadges = [
  // @ts-ignore
  { name: 'First Log', icon: Star, desc: 'Log your first entry', color: 'from-amber-400 to-orange-500', check: (g, m, streak, pts) => g.length >= 1 },
  // @ts-ignore
  { name: '7-Day Streak', icon: Flame, desc: 'Log 7 days in a row', color: 'from-red-400 to-rose-500', check: (g, m, streak) => streak >= 7 },
  // @ts-ignore
  { name: '30-Day Streak', icon: Flame, desc: 'Log 30 days in a row', color: 'from-orange-400 to-amber-500', check: (g, m, streak) => streak >= 30 },
  // @ts-ignore
  { name: 'Health Hero', icon: Zap, desc: 'Earn 50 points', color: 'from-yellow-400 to-amber-500', check: (g, m, streak, pts) => pts >= 50 },
  // @ts-ignore
  { name: 'Sugar Master', icon: Award, desc: 'Earn 150 points', color: 'from-purple-400 to-violet-500', check: (g, m, streak, pts) => pts >= 150 },
  // @ts-ignore
  { name: 'Champion', icon: Trophy, desc: 'Earn 300 points', color: 'from-teal-400 to-emerald-500', check: (g, m, streak, pts) => pts >= 300 },
  // @ts-ignore
  { name: 'Glucose Tracker', icon: Droplets, desc: 'Log 20 glucose readings', color: 'from-blue-400 to-indigo-500', check: (g) => g.length >= 20 },
  // @ts-ignore
  { name: 'Balanced Life', icon: Heart, desc: 'Log meals 10 times', color: 'from-pink-400 to-rose-500', check: (g, m) => m.length >= 10 },
];

// Medical coupons (unlocked at certain HbA1c levels)
const coupons = [
  { title: '5% Off Medical Supplies', desc: 'HbA1c below 9 (Silver+)', icon: '🩺', minTierIndex: 3, color: 'border-slate-300 bg-slate-50' },
  { title: '10% Off Glucometer Strips', desc: 'HbA1c below 8 (Gold+)', icon: '📊', minTierIndex: 6, color: 'border-yellow-300 bg-yellow-50' },
  { title: '15% Off Pharmacy Purchase', desc: 'HbA1c below 7 (Platinum+)', icon: '💊', minTierIndex: 9, color: 'border-cyan-300 bg-cyan-50' },
  { title: '20% Off Doctor Consultation', desc: 'HbA1c below 6.5 (Diamond+)', icon: '👨‍⚕️', minTierIndex: 13, color: 'border-blue-300 bg-blue-50' },
  { title: 'Free Lab Test Voucher', desc: 'Legendary status only', icon: '🏆', minTierIndex: 17, color: 'border-violet-300 bg-violet-50' },
];

export default function Gamification() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => me(),
  });

  // @ts-ignore
  const email = user?.email;
  // @ts-ignore
  const points = user?.points || 0;
  // @ts-ignore
  const streak = user?.streak_days || 0;

  const { data: glucoseLogs = [] } = useQuery({
    queryKey: ['glucoseLogs', email],
    // @ts-ignore
    queryFn: () => filterGlucoseLogs({ user_email: email }, '-log_date', 200),
    enabled: !!email,
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogs', email],
    // @ts-ignore
    queryFn: () => filterMealLogs({ user_email: email }, '-log_date', 100),
    enabled: !!email,
  });

  // Calculate estimated HbA1c
  const avgGlucose = glucoseLogs.length > 0
    // @ts-ignore
    ? glucoseLogs.reduce((s, l) => s + l.glucose_level, 0) / glucoseLogs.length
    : null;
  const estimatedHba1c = estimateHba1c(avgGlucose);

  // Determine current HbA1c tier
  const currentTierIndex = estimatedHba1c
    ? hba1cTiers.findIndex(t => estimatedHba1c < t.hba1cMax && estimatedHba1c >= t.hba1cMin)
    : -1;
  const currentTier = currentTierIndex >= 0 ? hba1cTiers[currentTierIndex] : null;

  const earnedActivityCount = activityBadges.filter(b => b.check(glucoseLogs, mealLogs, streak, points)).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Rewards & Badges</h1>

      <StreakBadge streak={streak} points={points} />

      {/* HbA1c Estimate Banner */}
      {estimatedHba1c && (
        <div className={`rounded-2xl p-5 border-2 ${currentTier ? currentTier.bg + ' ' + currentTier.border : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Estimated HbA1c</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-1">{estimatedHba1c}%</p>
              <p className="text-xs text-slate-400 mt-0.5">Based on your avg glucose ({Math.round(
// @ts-ignore
              avgGlucose)} mg/dL)</p>
            </div>
            {currentTier && (
              <div className="text-center">
                <span className="text-5xl">{currentTier.icon}</span>
                <p className="text-sm font-bold text-slate-700 mt-1">{currentTier.name}</p>
                <p className="text-xs text-slate-500">{currentTier.desc}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HbA1c Tier Badges */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <h2 className="font-bold text-slate-800 mb-1">HbA1c Tiers</h2>
        <p className="text-xs text-slate-400 mb-4">Based on your estimated HbA1c from logged glucose readings</p>
        <div className="space-y-2">
          {['Legendary', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(tierName => {
            const tierBadges = hba1cTiers.filter(t => t.tier === tierName);
            const sample = tierBadges[0];
            const isCurrentTier = currentTier?.tier === tierName;
            // @ts-ignore
            const isUnlocked = currentTierIndex >= 0 && hba1cTiers.indexOf(currentTier) >= hba1cTiers.indexOf(sample);
            return (
              <div key={tierName} className={`rounded-xl border-2 p-3 ${isCurrentTier ? sample.border + ' ' + sample.bg : isUnlocked ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{sample.icon}</span>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{tierName}</p>
                      <p className="text-xs text-slate-400">{tierBadges.map(b => `${b.name} (HbA1c ${b.hba1cMin}–${b.hba1cMax}%)`).join(' · ')}</p>
                    </div>
                  </div>
                  {isCurrentTier && <span className="text-xs bg-green-500 text-white rounded-full px-2 py-0.5 font-bold">Current</span>}
                  {!isCurrentTier && isUnlocked && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Badges */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Activity Badges</h2>
          <span className="text-sm text-slate-400">{earnedActivityCount}/{activityBadges.length} earned</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {activityBadges.map((badge, i) => {
            const earned = badge.check(glucoseLogs, mealLogs, streak, points);
            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-2xl p-4 border-2 transition-all ${earned ? 'border-amber-300 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-3 ${earned ? 'shadow-md' : 'grayscale'}`}>
                  <badge.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-sm text-slate-700">{badge.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{badge.desc}</p>
                {earned && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Medical Coupons */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-teal-500" />
          <h2 className="font-bold text-slate-800">Medical Coupons</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">Keep your sugars in control to unlock medical expense coupons!</p>
        <div className="space-y-3">
          {coupons.map((coupon, i) => {
            const unlocked = currentTierIndex >= coupon.minTierIndex;
            return (
              <motion.div
                key={coupon.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${coupon.color} ${!unlocked ? 'opacity-40 grayscale' : ''}`}
              >
                <span className="text-3xl">{coupon.icon}</span>
                <div className="flex-1">
                  <p className={`font-bold text-sm ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>{coupon.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{coupon.desc}</p>
                </div>
                {unlocked ? (
                  <span className="text-xs bg-green-500 text-white rounded-full px-3 py-1 font-bold shrink-0">Unlocked!</span>
                ) : (
                  <span className="text-xs bg-slate-200 text-slate-500 rounded-full px-3 py-1 font-medium shrink-0">Locked</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}