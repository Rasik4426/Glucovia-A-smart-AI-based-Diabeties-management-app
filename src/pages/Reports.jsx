// @ts-nocheck
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Brain, Loader2, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlucoseChart from '@/components/child/GlucoseChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import ReactMarkdown from 'react-markdown';
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

const COLORS = ['#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'];


function generateLocalInsight(summary) {
  const { avg_glucose, in_range_pct, low_count, high_count, total_carbs, total_insulin, meals_logged, period } = summary;
  
  let insights = [];
  
  // Glucose control summary
  if (in_range_pct >= 70) {
    insights.push('🌟 **Great job!** Your glucose is in range most of the time. Keep up the excellent work!');
  } else if (in_range_pct >= 50) {
    insights.push('📊 **Doing okay!** About half your readings are in range. There\'s room for improvement.');
  } else {
    insights.push('⚠️ **Needs attention.** Many readings are outside the target range. Talk to your doctor or parent.');
  }
  
  insights.push('');
  
  // Patterns
  if (low_count > high_count && low_count > 2) {
    insights.push('🍬 **Watch for lows!** You\'ve had several low readings. Make sure to carry snacks.');
  } else if (high_count > low_count && high_count > 2) {
    insights.push('💉 **High readings spotted.** Consider checking insulin timing and carb counting.');
  }
  
  if (meals_logged > 0 && total_carbs > 0) {
    const avgCarbs = Math.round(total_carbs / meals_logged);
    insights.push(`🍽️ You averaged **${avgCarbs}g carbs** per meal. Great tracking!`);
  }
  
  insights.push('');
  
  // Tips
  insights.push('💡 **Tips:**');
  insights.push('1. 🧘 Try to log meals around the same time each day.');
  insights.push('2. 💧 Drink water and stay active — it helps glucose stay steady!');
  insights.push('3. 🎉 Celebrate small wins. Every in-range reading is a victory!');
  
  return insights.join('\\n');
}

export default function Reports() {
  const [period, setPeriod] = useState('7');
  const [aiInsight, setAiInsight] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => me(),
  });

  const email = user?.email;
  const isParentOrDoctor = user?.role === 'parent' || user?.role === 'doctor';
  const targetEmail = isParentOrDoctor ? (user?.linked_child_emails?.[0] || email) : email;

  const { data: glucoseLogs = [] } = useQuery({
    queryKey: ['glucoseLogs', targetEmail],
    queryFn: () => filterGlucoseLogs({ user_email: targetEmail }, '-log_date', 200),
    enabled: !!targetEmail,
  });

  const { data: mealLogs = [] } = useQuery({
    queryKey: ['mealLogs', targetEmail],
    queryFn: () => filterMealLogs({ user_email: targetEmail }, '-log_date', 200),
    enabled: !!targetEmail,
  });

  const { data: insulinLogs = [] } = useQuery({
    queryKey: ['insulinLogs', targetEmail],
    queryFn: () => filterInsulinLogs({ user_email: targetEmail }, '-log_date', 200),
    enabled: !!targetEmail,
  });

  const cutoff = subDays(new Date(), parseInt(period));
  const filteredGlucose = glucoseLogs.filter(l => new Date(l.log_date) >= cutoff);
  const filteredMeals = mealLogs.filter(l => new Date(l.log_date) >= cutoff);
  const filteredInsulin = insulinLogs.filter(l => new Date(l.log_date) >= cutoff);

  // Daily glucose averages
  const dailyData = {};
  filteredGlucose.forEach(l => {
    const day = format(new Date(l.log_date), 'MMM d');
    if (!dailyData[day]) dailyData[day] = { day, values: [] };
    dailyData[day].values.push(l.glucose_level);
  });
  const dailyAvg = Object.values(dailyData).map(d => ({
    day: d.day,
    avg: Math.round(d.values.reduce((a, b) => a + b, 0) / d.values.length),
  }));

  // Glucose distribution
  const inRange = filteredGlucose.filter(l => l.glucose_level >= 70 && l.glucose_level <= 180).length;
  const low = filteredGlucose.filter(l => l.glucose_level < 70).length;
  const high = filteredGlucose.filter(l => l.glucose_level > 180).length;
  const pieData = [
    { name: 'In Range', value: inRange },
    { name: 'Low', value: low },
    { name: 'High', value: high },
  ].filter(d => d.value > 0);

  const generateAIInsight = async () => {
    setLoadingAI(true);
    const summary = {
      period: `${period} days`,
      glucose_readings: filteredGlucose.length,
      avg_glucose: filteredGlucose.length > 0 ? Math.round(filteredGlucose.reduce((s, l) => s + l.glucose_level, 0) / filteredGlucose.length) : 0,
      in_range_pct: filteredGlucose.length > 0 ? Math.round(inRange / filteredGlucose.length * 100) : 0,
      low_count: low,
      high_count: high,
      total_carbs: filteredMeals.reduce((s, m) => s + (m.carbs || 0), 0),
      total_insulin: filteredInsulin.reduce((s, i) => s + (i.units || 0), 0),
      meals_logged: filteredMeals.length,
    };

    // Local AI insight (no external LLM - uses simple template analysis)
    const result = generateLocalInsight(summary);

    setAiInsight(result);
    setLoadingAI(false);
  };

  // Period summary stats
  const avg7 = (() => {
    const logs = glucoseLogs.filter(l => new Date(l.log_date) >= subDays(new Date(), 7));
    return logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.glucose_level, 0) / logs.length) : null;
  })();
  const avg30 = (() => {
    const logs = glucoseLogs.filter(l => new Date(l.log_date) >= subDays(new Date(), 30));
    return logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.glucose_level, 0) / logs.length) : null;
  })();
  const avg90 = (() => {
    const logs = glucoseLogs.filter(l => new Date(l.log_date) >= subDays(new Date(), 90));
    return logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.glucose_level, 0) / logs.length) : null;
  })();
  const timeInRange = filteredGlucose.length > 0
    ? Math.round(inRange / filteredGlucose.length * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Days</SelectItem>
            <SelectItem value="14">14 Days</SelectItem>
            <SelectItem value="30">30 Days</SelectItem>
            <SelectItem value="90">3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Averages */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '7-Day Avg', value: avg7, color: 'bg-teal-50 text-teal-700 border-teal-100' },
          { label: '30-Day Avg', value: avg30, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: '3-Month Avg', value: avg90, color: 'bg-purple-50 text-purple-700 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-3 border-2 text-center ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-xl font-extrabold mt-1">{s.value ?? '--'}</p>
            <p className="text-xs opacity-60">mg/dL</p>
          </div>
        ))}
      </div>

      {timeInRange !== null && (
        <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${timeInRange >= 70 ? 'bg-green-50 border-green-200 text-green-700' : timeInRange >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span className="font-bold text-sm">Time in Range</span>
          </div>
          <span className="text-2xl font-extrabold">{timeInRange}%</span>
        </div>
      )}

      {/* Glucose Trend */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <h2 className="font-bold text-slate-800 mb-4">Glucose Trend</h2>
        <GlucoseChart logs={filteredGlucose} targetMin={user?.target_glucose_min} targetMax={user?.target_glucose_max} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Average */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4">Daily Averages</h2>
          {dailyAvg.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="avg" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No data for this period</p>
          )}
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4">Glucose Distribution</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-slate-600">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No data for this period</p>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="font-bold text-slate-800">AI Health Insights</h2>
          </div>
          <Button
            onClick={generateAIInsight}
            disabled={loadingAI || filteredGlucose.length === 0}
            variant="outline"
            className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            {loadingAI ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
            {loadingAI ? 'Analyzing...' : 'Generate Insights'}
          </Button>
        </div>
        {aiInsight ? (
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown>{aiInsight}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-purple-400">Click "Generate Insights" to get AI-powered health analysis</p>
        )}
      </div>
    </div>
  );
}