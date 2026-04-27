import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params'; 
import { Heart, Baby, Users, Stethoscope, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';



const roles = [
  {
    value: 'child',
    label: 'I\'m a Kid',
    desc: 'Track my health, earn rewards, and stay on top of my diabetes.',
    icon: Baby,
    color: 'from-teal-400 to-emerald-500',
    shadow: 'shadow-teal-200',
  },
  {
    value: 'parent',
    label: 'I\'m a Parent',
    desc: 'Monitor my child\'s health data and receive alerts.',
    icon: Users,
    color: 'from-blue-400 to-indigo-500',
    shadow: 'shadow-blue-200',
  },
  {
    value: 'doctor',
    label: 'I\'m a Doctor',
    desc: 'View patient data and glucose trend analytics.',
    icon: Stethoscope,
    color: 'from-purple-400 to-violet-500',
    shadow: 'shadow-purple-200',
  },
];

export default function RoleSetup() {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user, isLoadingAuth } = useAuth();
const handleContinue = async () => {
  try {
    setSaving(true); // ✅ added

   if (isLoadingAuth) {
      alert("Please wait, loading user...");
      setSaving(false);
      return;
    }
      
      const authUser = user;

   if (!authUser) {
       alert("User not logged in");
       setSaving(false); // ✅ ADD THIS
        return;
    }
    console.log("Auth User:", authUser);

    const existingUsers = await base44.entities.User.filter(
  { email: authUser.email },
  null,
  
);
console.log("Existing Users:", existingUsers);
console.log("Selected Role:", selected);

    if (existingUsers.length > 0) {
      if (selected === "child") {
  window.location.href = "/ChildDashboard";
} else if (selected === "parent") {
  window.location.href = "/ParentDashboard";
} else if (selected === "doctor") {
  window.location.href = "/DoctorDashboard";
}
      return;
    }
if (!selected) {
  alert("Please select a role");
  return;
}
    await base44.entities.User.create({
      email: authUser.email,
      role: selected,
      full_name: authUser.name || "User",
      target_glucose_min: 80,
      target_glucose_max: 140,
      insulin_sensitivity: 50,
      carb_ratio: 10,
      streak_days: 0,
      points: 0,
      last_log_date: new Date().toISOString()
    });
    // small delay to ensure DB sync
await new Promise(res => setTimeout(res, 500));

    window.location.href = "/ChildDashboard";

  } catch (error) {
    console.error("Error in Continue:", error);
    alert("Something went wrong. Check console.");
  } finally {
    setSaving(false); // ✅ added
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Welcome to DiaBuddy!</h1>
          <p className="text-slate-500">Tell us who you are to get started</p>
        </div>

        <div className="space-y-3 mb-8">
          {roles.map(role => (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selected === role.value
                  ? 'border-teal-400 bg-teal-50 shadow-lg shadow-teal-100'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-md ${role.shadow}`}>
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{role.label}</p>
                <p className="text-sm text-slate-400">{role.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selected || saving}
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-full h-12 text-base shadow-lg shadow-teal-200"
        >
          {saving ? 'Setting up...' : 'Continue'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}