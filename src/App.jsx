import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import RoleSetup from './pages/RoleSetup';
import ChildDashboard from './pages/ChildDashboard';
import LogEntry from './pages/LogEntry';
import Gamification from './pages/Gamification';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
import ParentDashboard from './pages/ParentDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Settings from './pages/Settings';
import Education from './pages/Education';
import DoctorChat from './pages/DoctorChat';
import MedicalDocuments from './pages/MedicalDocuments';
import { startSyncListener } from '@/lib/syncManager';

// Start background sync once (fires immediately if online with pending entries)
startSyncListener();

const RoleRedirect = () => {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50">
      <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );
  const role = user?.role;
  if (role === 'parent') return <Navigate to="/ParentDashboard" replace />;
  if (role === 'doctor') return <Navigate to="/DoctorDashboard" replace />;
  if (role === 'child') return <Navigate to="/ChildDashboard" replace />;
  return <RoleSetup />;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      );
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/Landing" element={<Landing />} />
      <Route path="/RoleSetup" element={<RoleRedirect />} />
      <Route element={<Layout />}>
        <Route path="/ChildDashboard" element={<ChildDashboard />} />
        <Route path="/LogEntry" element={<LogEntry />} />
        <Route path="/Gamification" element={<Gamification />} />
        <Route path="/Reminders" element={<Reminders />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/ParentDashboard" element={<ParentDashboard />} />
        <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Education" element={<Education />} />
        <Route path="/DoctorChat" element={<DoctorChat />} />
        <Route path="/MedicalDocuments" element={<MedicalDocuments />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App