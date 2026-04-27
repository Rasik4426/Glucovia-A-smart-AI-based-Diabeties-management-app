import React from 'react';
import { Flame, Star, Award, Zap } from 'lucide-react';

const ranks = [
  { min: 0, label: 'Beginner', icon: Star, color: 'text-slate-400' },
  { min: 50, label: 'Health Hero', icon: Zap, color: 'text-amber-500' },
  { min: 150, label: 'Sugar Master', icon: Award, color: 'text-purple-500' },
  { min: 300, label: 'Diabetes Champion', icon: Award, color: 'text-teal-500' },
];

export default function StreakBadge({ streak, points }) {
  const rank = [...ranks].reverse().find(r => (points || 0) >= r.min) || ranks[0];
  const RankIcon = rank.icon;

  return (
    <div className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-2xl p-5 text-white relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6" />
            <span className="text-lg font-bold">{streak || 0} Day Streak</span>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <RankIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">{rank.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">{points || 0} points earned</span>
        </div>
      </div>
    </div>
  );
}