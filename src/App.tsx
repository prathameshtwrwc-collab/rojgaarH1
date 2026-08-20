import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Landing from './pages/Landing';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import JobSeekerInfo from './pages/JobSeekerInfo';
import EmployerInfo from './pages/EmployerInfo';
import Contact from './pages/Contact';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import JobSeekerRegistration from './pages/JobSeekerRegistration';
import EmployerRegistration from './pages/EmployerRegistration';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Candidates from './pages/admin/Candidates';
import Employers from './pages/admin/Employers';
import Matching from './pages/admin/Matching';
import Communications from './pages/admin/Communications';
import Placements from './pages/admin/Placements';
import { CandidateLogin, CandidateDashboard } from './pages/dashboards/CandidateDashboard';
import { EmployerLogin, EmployerDashboard } from './pages/dashboards/EmployerDashboard';
import { ReactNode } from 'react';

function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAdminLoggedIn } = useData();
  if (!isAdminLoggedIn) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function ProtectedCandidateRoute({ children }: { children: ReactNode }) {
  const { isCandidateLoggedIn } = useData();
  if (!isCandidateLoggedIn) return <Navigate to="/login/candidate" replace />;
  return <>{children}</>;
}

function ProtectedEmployerRoute({ children }: { children: ReactNode }) {
  const { isEmployerLoggedIn } = useData();
  if (!isEmployerLoggedIn) return <Navigate to="/login/employer" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing page renders without layout wrapper */}
      <Route element={<Landing />} path="/" />

      {/* Public pages with layout */}
      <Route element={<PublicLayout><Jobs /></PublicLayout>} path="/jobs" />
      <Route element={<PublicLayout><JobDetails /></PublicLayout>} path="/jobs/:id" />
      <Route element={<PublicLayout><JobSeekerInfo /></PublicLayout>} path="/job-seeker-info" />
      <Route element={<PublicLayout><EmployerInfo /></PublicLayout>} path="/employer-info" />
      <Route element={<PublicLayout><Contact /></PublicLayout>} path="/contact" />

      {/* Registration portals */}
      <Route element={<PublicLayout><JobSeekerRegistration /></PublicLayout>} path="/register/job-seeker" />
      <Route element={<PublicLayout><EmployerRegistration /></PublicLayout>} path="/register/employer" />

      {/* Candidate Dashboard */}
      <Route element={<PublicLayout><CandidateLogin /></PublicLayout>} path="/login/candidate" />
      <Route path="/dashboard/candidate" element={<ProtectedCandidateRoute><CandidateDashboard /></ProtectedCandidateRoute>} />

      {/* Employer Dashboard */}
      <Route element={<PublicLayout><EmployerLogin /></PublicLayout>} path="/login/employer" />
      <Route path="/dashboard/employer" element={<ProtectedEmployerRoute><EmployerDashboard /></ProtectedEmployerRoute>} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/candidates" element={<ProtectedAdminRoute><Candidates /></ProtectedAdminRoute>} />
      <Route path="/admin/employers" element={<ProtectedAdminRoute><Employers /></ProtectedAdminRoute>} />
      <Route path="/admin/matching" element={<ProtectedAdminRoute><Matching /></ProtectedAdminRoute>} />
      <Route path="/admin/communications" element={<ProtectedAdminRoute><Communications /></ProtectedAdminRoute>} />
      <Route path="/admin/placements" element={<ProtectedAdminRoute><Placements /></ProtectedAdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
