import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react';
import { getGlucoseFeedback } from './GlucoseFeedback';

export default function AlertBanner({ glucoseLogs }) {
  if (!glucoseLogs || glucoseLogs.length === 0) return null;

  const latest = glucoseLogs[0];
  const level = latest?.glucose_level;
  const feedback = getGlucoseFeedback(level);

  if (!feedback || feedback.status === 'good') return null;

  const isLow = feedback.status === 'low';
  const isHigh = feedback.status === 'high';

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border-2 ${
      isLow ? 'bg-red-50 border-red-200' : isHigh ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <span className="text-2xl leading-none">{feedback.emoji}</span>
      <div className="flex-1">
        <p className={`font-bold text-sm ${isLow || isHigh ? 'text-red-700' : 'text-yellow-700'}`}>
          {feedback.label}
        </p>
        <p className="text-xs mt-0.5 text-slate-600">{feedback.desc}</p>
        <p className="text-xs mt-1 font-medium text-slate-500">
          Last reading: <span className="font-bold">{level} mg/dL</span>
        </p>
      </div>
    </div>
  );
}