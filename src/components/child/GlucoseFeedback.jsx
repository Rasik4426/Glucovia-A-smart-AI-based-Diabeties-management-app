import React from 'react';

export function getGlucoseFeedback(level) {
  if (!level || isNaN(level)) return null;
  const l = parseFloat(level);
  if (l <= 80) return {
    emoji: '⚠️',
    label: 'Risk Alert — Low Sugar',
    desc: 'Blood sugar is too low! Eat something with fast-acting carbs right away.',
    color: 'bg-red-50 border-red-200 text-red-700',
    badgeColor: 'bg-red-500',
    status: 'low',
  };
  if (l <= 160) return {
    emoji: '😊',
    label: 'Good Control',
    desc: 'Great job! Your blood sugar is in a healthy range.',
    color: 'bg-green-50 border-green-200 text-green-700',
    badgeColor: 'bg-green-500',
    status: 'good',
  };
  if (l <= 180) return {
    emoji: '😐',
    label: 'Slightly High',
    desc: 'A little above target. Watch your next meal and stay active.',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    badgeColor: 'bg-yellow-400',
    status: 'slightly_high',
  };
  return {
    emoji: '🔴',
    label: 'Very High — Poor Control',
    desc: 'Blood sugar is too high. Consider a correction dose and contact your care team.',
    color: 'bg-red-50 border-red-200 text-red-700',
    badgeColor: 'bg-red-600',
    status: 'high',
  };
}

export default function GlucoseFeedback({ level }) {
  const feedback = getGlucoseFeedback(level);
  if (!feedback) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border-2 ${feedback.color}`}>
      <span className="text-3xl leading-none">{feedback.emoji}</span>
      <div>
        <p className="font-bold text-sm">{feedback.label}</p>
        <p className="text-xs mt-0.5 opacity-80">{feedback.desc}</p>
      </div>
    </div>
  );
}