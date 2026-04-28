// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { isAuthenticated, me } from '@/api/api';
import { Heart, Activity, Shield, Trophy, ArrowRight, Droplets, BarChart3, Users, Baby, UserCheck, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const features = [
  { icon: Droplets, title: 'Easy Tracking', desc: 'Log glucose, meals, and insulin in seconds', color: 'from-teal-400 to-emerald-500' },
  { icon: BarChart3, title: 'Smart Insights', desc: 'AI-powered health analysis and suggestions', color: 'from-purple-400 to-violet-500' },
  { icon: Trophy, title: 'Fun Rewards', desc: 'Earn badges and climb ranks while staying healthy', color: 'from-amber-400 to-orange-500' },
  { icon: Users, title: 'Family Connected', desc: 'Parents and doctors stay in the loop', color: 'from-blue-400 to-indigo-500' },
];

const roles = [
  { id: 'child', label: 'Child / Patient', desc: 'Track your health & earn rewards', icon: Baby, color: 'from-teal-400 to-emerald-500', border: 'border-teal-300', bg: 'bg-teal-50' },
  { id: 'parent', label: 'Parent / Guardian', desc: 'Monitor your child\'s health', icon: UserCheck, color: 'from-blue-400 to-indigo-500', border: 'border-blue-300', bg: 'bg-blue-50' },
  { id: 'doctor', label: 'Doctor', desc: 'Manage patients & view reports', icon: Stethoscope, color: 'from-purple-400 to-violet-500', border: 'border-purple-300', bg: 'bg-purple-50' },
];

export default function Landing() {
  const [checking, setChecking] = useState(true);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        if (auth) {
          const user = await me();
          const role = user?.role;
          if (role === 'parent') { window.location.replace('/ParentDashboard'); return; }
          if (role === 'doctor') { window.location.replace('/DoctorDashboard'); return; }
          if (role === 'child') { window.location.replace('/ChildDashboard'); return; }
          window.location.replace('/RoleSetup');
        } else {
          setChecking(false);
        }
      } catch {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignIn = () => {
    const redirectTo = `${window.location.origin}/RoleSetup`;
    import('@/lib/supabaseClient').then(({ supabase }) => {
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-16">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Glucovia</span>
            </div>
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="rounded-full border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Sign In
            </Button>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Smart Diabetes Management for Kids & Families
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Make Health
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent"> Fun </span>
              & Easy
            </h1>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed">
              Track glucose, meals, and insulin with ease. Earn rewards, get AI insights,
              and keep your family connected — all in one friendly app.
            </p>
            <Button
              onClick={() => setShowRoleSelector(true)}
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-full px-8 shadow-lg shadow-teal-200 text-base"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Role Selector Modal */}
      {showRoleSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h2 className="text-2xl font-extrabold text-slate-800 text-center mb-2">Who are you?</h2>
            <p className="text-slate-400 text-sm text-center mb-6">Choose your role to get started</p>
            <div className="space-y-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={handleSignIn}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 ${role.border} ${role.bg} hover:opacity-90 transition-all text-left`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-md shrink-0`}>
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{role.label}</p>
                    <p className="text-xs text-slate-500">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoleSelector(false)}
              className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-8 text-center">
        <p className="text-sm text-slate-400">
          © 2026 Glucovia — Built with care for kids managing diabetes.
          <Shield className="w-3.5 h-3.5 inline mx-1 -mt-0.5" />
          Your data is secure.
        </p>
      </div>
    </div>
  );
}