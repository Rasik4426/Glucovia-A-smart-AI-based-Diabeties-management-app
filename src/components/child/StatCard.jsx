import React from 'react';

export default function StatCard({ icon: Icon, label, value, unit, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-2xl p-5 relative overflow-hidden`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 ${color} rounded-full opacity-10`} />
      <div className={`w-10 h-10 rounded-xl ${color} bg-opacity-20 flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}