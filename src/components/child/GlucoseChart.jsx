// @ts-nocheck
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function GlucoseChart({ logs, targetMin = 70, targetMax = 180 }) {
  const chartData = logs
    .sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
    .slice(-20)
    .map(log => ({
      time: format(new Date(log.log_date), 'MMM d, HH:mm'),
      glucose: log.glucose_level,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No glucose data yet. Start logging!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />
        <ReferenceLine y={targetMin} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Low', fill: '#f59e0b', fontSize: 10 }} />
        <ReferenceLine y={targetMax} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'High', fill: '#ef4444', fontSize: 10 }} />
        <Area
          type="monotone"
          dataKey="glucose"
          stroke="#14b8a6"
          strokeWidth={2.5}
          fill="url(#glucoseGradient)"
          dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}