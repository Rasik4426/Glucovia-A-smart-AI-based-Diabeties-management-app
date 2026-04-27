import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Home, Activity, Utensils, Syringe, Trophy, Bell,
  BarChart3, Users, Settings, LogOut, Menu, X, Heart, BookOpen, MessageCircle, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const childNav = [
  { path: '/ChildDashboard', label: 'Dashboard', icon: Home },
  { path: '/LogEntry', label: 'Log Data', icon: Activity },
  { path: '/Gamification', label: 'Rewards', icon: Trophy },
  { path: '/Reports', label: 'Reports', icon: BarChart3 },
  { path: '/Reminders', label: 'Reminders', icon: Bell },
  { path: '/DoctorChat', label: 'Chat', icon: MessageCircle },
  { path: '/Education', label: 'Learn', icon: BookOpen },
  { path: '/MedicalDocuments', label: 'My Docs', icon: FileText },
];

const parentNav = [
  { path: '/ParentDashboard', label: 'Dashboard', icon: Home },
  { path: '/Reports', label: 'Reports', icon: BarChart3 },
  { path: '/DoctorChat', label: 'Chat', icon: MessageCircle },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

const doctorNav = [
  { path: '/DoctorDashboard', label: 'Dashboard', icon: Home },
  { path: '/Reports', label: 'Reports', icon: BarChart3 },
  { path: '/DoctorChat', label: 'Chat', icon: MessageCircle },
  { path: '/MedicalDocuments', label: 'Patient Docs', icon: FileText },
  { path: '/Settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const role = user?.role || 'child';
  const nav = role === 'doctor' ? doctorNav : role === 'parent' ? parentNav : childNav;

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-teal-100 p-6 fixed h-full z-30">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 leading-tight">Glucovia</h1>
            <p className="text-xs text-slate-400 capitalize">{role} Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-200'
                    : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-teal-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">Glucovia</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-white border-b border-teal-100 p-4 space-y-1" onClick={e => e.stopPropagation()}>
            {nav.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                      : 'text-slate-600 hover:bg-teal-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}