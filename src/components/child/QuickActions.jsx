import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Utensils, Syringe, BarChart3 } from 'lucide-react';

const actions = [
  { path: '/LogEntry?type=glucose', label: 'Log Glucose', icon: Droplets, color: 'from-teal-400 to-emerald-500', shadow: 'shadow-teal-200' },
  { path: '/LogEntry?type=meal', label: 'Log Meal', icon: Utensils, color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200' },
  { path: '/LogEntry?type=insulin', label: 'Log Insulin', icon: Syringe, color: 'from-purple-400 to-violet-500', shadow: 'shadow-purple-200' },
  { path: '/Reports', label: 'View Reports', icon: BarChart3, color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-200' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(action => (
        <Link
          key={action.path}
          to={action.path}
          className={`bg-gradient-to-br ${action.color} rounded-2xl p-4 text-white shadow-lg ${action.shadow} hover:scale-[1.02] transition-transform`}
        >
          <action.icon className="w-7 h-7 mb-2" />
          <span className="text-sm font-semibold">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
