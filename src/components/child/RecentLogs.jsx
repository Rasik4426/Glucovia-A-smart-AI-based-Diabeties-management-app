// @ts-ignore
import React from 'react';
import { format } from 'date-fns';
import { Droplets, Utensils, Syringe } from 'lucide-react';

// @ts-ignore
export default function RecentLogs({ glucoseLogs, mealLogs, insulinLogs }) {
  const allLogs = [
    // @ts-ignore
    ...(glucoseLogs || []).map(l => ({ ...l, type: 'glucose', date: l.log_date })),
    // @ts-ignore
    ...(mealLogs || []).map(l => ({ ...l, type: 'meal', date: l.log_date })),
    // @ts-ignore
    ...(insulinLogs || []).map(l => ({ ...l, type: 'insulin', date: l.log_date })),
  // @ts-ignore
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const icons = { glucose: Droplets, meal: Utensils, insulin: Syringe };
  const colors = {
    glucose: 'bg-teal-100 text-teal-600',
    meal: 'bg-amber-100 text-amber-600',
    insulin: 'bg-purple-100 text-purple-600',
  };

  // @ts-ignore
  const getLabel = (log) => {
    if (log.type === 'glucose') return `${log.glucose_level} mg/dL`;
    if (log.type === 'meal') return `${log.carbs}g carbs`;
    return `${log.units} units`;
  };

  if (allLogs.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">No logs yet. Start tracking!</p>;
  }

  return (
    <div className="space-y-2">
      {allLogs.map((log, i) => {
        // @ts-ignore
        const Icon = icons[log.type];
        return (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
// @ts-ignore
            colors[log.type]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 capitalize">{log.type} Log</p>
              <p className="text-xs text-slate-400">{format(new Date(log.date), 'MMM d, h:mm a')}</p>
            </div>
            <span className="text-sm font-semibold text-slate-700">{getLabel(log)}</span>
          </div>
        );
      })}
    </div>
  );
}