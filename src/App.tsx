import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import Landing from './pages/Landing';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import JobSeekerInfo from './pages/JobSeekerInfo';
import EmployerInfo from './pages/EmployerInfo';
import RecruiterInfo from './pages/RecruiterInfo';
import Contact from './pages/Contact';
import AboutUs from './pages/AboutUs';
import Blog from './pages/Blog';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/admin/Dashboard';
import Candidates from './pages/admin/Candidates';
import Employers from './pages/admin/Employers';
import Matching from './pages/admin/Matching';
import Communications from './pages/admin/Communications';
import Placements from './pages/admin/Placements';
import EmployerDetail from './pages/admin/EmployerDetail';
import JobApprovals from './pages/admin/JobApprovals';
import JobPostDetail from './pages/admin/JobPostDetail';
import Recruiters from './pages/admin/Recruiters';
import RecruiterDetail from './pages/admin/RecruiterDetail';
import CandidateLogin from './pages/auth/CandidateLogin';
import EmployerLogin from './pages/auth/EmployerLogin';
import RecruiterLogin from './pages/auth/RecruiterLogin';
import AdminLoginPage from './pages/auth/AdminLogin';
import CandidateSignup from './pages/auth/CandidateSignup';
import EmployerSignup from './pages/auth/EmployerSignup';
import RecruiterSignup from './pages/auth/RecruiterSignup';
import { CandidateDashboard } from './pages/dashboards/CandidateDashboard';
import { EmployerDashboard } from './pages/dashboards/EmployerDashboard';
import { RecruiterDashboard } from './pages/dashboards/RecruiterDashboard';
import PostJob from './pages/dashboards/PostJob';
import { ReactNode } from 'react';
import PageLoader from './components/PageLoader';
import ScrollRestoration from './components/ScrollRestoration';
import AppPreloader from './components/AppPreloader';
import { useSmoothScroll } from './hooks/useSmoothScroll';

function AuthGate() {
  return <PageLoader />;
}

function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdminLoggedIn } = useData();

  if (loading) return <AuthGate />;

  if (isAdminLoggedIn || user?.role === 'superadmin') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <Navigate to="/admin/login" replace />;
}

function ProtectedCandidateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isCandidateLoggedIn } = useData();

  if (loading) return <AuthGate />;

  if (isCandidateLoggedIn || user?.role === 'candidate') {
    return <>{children}</>;
  }

  return <Navigate to="/login/candidate" replace />;
}

function ProtectedEmployerRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isEmployerLoggedIn } = useData();

  if (loading) return <AuthGate />;

  if (isEmployerLoggedIn || user?.role === 'employer') {
    return <>{children}</>;
  }

  return <Navigate to="/login/employer" replace />;
}

function ProtectedRecruiterRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <AuthGate />;

  if (user?.role === 'recruiter') {
    return <>{children}</>;
  }

  return <Navigate to="/login/recruiter" replace />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
    <Routes>
      {/* Landing page renders without layout wrapper */}
      <Route element={<Landing />} path="/" />

      {/* Public pages with layout */}
      <Route element={<PublicLayout><Jobs /></PublicLayout>} path="/jobs" />
      <Route element={<PublicLayout><JobDetails /></PublicLayout>} path="/jobs/:id" />
      <Route element={<PublicLayout><JobSeekerInfo /></PublicLayout>} path="/job-seeker-info" />
      <Route element={<PublicLayout><EmployerInfo /></PublicLayout>} path="/employer-info" />
      <Route element={<PublicLayout><RecruiterInfo /></PublicLayout>} path="/recruiter-info" />
      <Route element={<PublicLayout><Contact /></PublicLayout>} path="/contact" />
      <Route element={<PublicLayout><AboutUs /></PublicLayout>} path="/about" />
      <Route element={<PublicLayout><Blog /></PublicLayout>} path="/blog" />
      <Route element={<PublicLayout><PrivacyPolicy /></PublicLayout>} path="/privacy" />
      <Route element={<PublicLayout><Terms /></PublicLayout>} path="/terms" />

      {/* Registration portals */}
      <Route element={<PublicLayout><CandidateSignup /></PublicLayout>} path="/register/job-seeker" />
      <Route element={<PublicLayout><EmployerSignup /></PublicLayout>} path="/register/employer" />
      <Route element={<PublicLayout><RecruiterSignup /></PublicLayout>} path="/register/recruiter" />

      {/* Candidate Auth */}
      <Route element={<PublicLayout><CandidateLogin /></PublicLayout>} path="/login/candidate" />

      {/* Employer Auth */}
      <Route element={<PublicLayout><EmployerLogin /></PublicLayout>} path="/login/employer" />

      {/* Recruiter Auth */}
      <Route element={<PublicLayout><RecruiterLogin /></PublicLayout>} path="/login/recruiter" />

      {/* Admin Auth */}
      <Route element={<AdminLoginPage />} path="/admin/login" />

      {/* Candidate Dashboard */}
      <Route path="/dashboard/candidate" element={<ProtectedCandidateRoute><CandidateDashboard /></ProtectedCandidateRoute>} />

      {/* Employer Dashboard */}
      <Route path="/dashboard/employer" element={<ProtectedEmployerRoute><EmployerDashboard /></ProtectedEmployerRoute>} />
      <Route path="/dashboard/employer/post-job" element={<ProtectedEmployerRoute><PostJob /></ProtectedEmployerRoute>} />

      {/* Recruiter Dashboard */}
      <Route path="/dashboard/recruiter" element={<ProtectedRecruiterRoute><RecruiterDashboard /></ProtectedRecruiterRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/jobs" element={<ProtectedAdminRoute><JobApprovals /></ProtectedAdminRoute>} />
      <Route path="/admin/jobs/:id" element={<ProtectedAdminRoute><JobPostDetail /></ProtectedAdminRoute>} />
      <Route path="/admin/candidates" element={<ProtectedAdminRoute><Candidates /></ProtectedAdminRoute>} />
      <Route path="/admin/employers" element={<ProtectedAdminRoute><Employers /></ProtectedAdminRoute>} />
      <Route path="/employer/:id" element={<ProtectedAdminRoute><EmployerDetail /></ProtectedAdminRoute>} />
      <Route path="/admin/recruiters" element={<ProtectedAdminRoute><Recruiters /></ProtectedAdminRoute>} />
      <Route path="/recruiter/:id" element={<ProtectedAdminRoute><RecruiterDetail /></ProtectedAdminRoute>} />
      <Route path="/admin/matching" element={<ProtectedAdminRoute><Matching /></ProtectedAdminRoute>} />
      <Route path="/admin/communications" element={<ProtectedAdminRoute><Communications /></ProtectedAdminRoute>} />
      <Route path="/admin/placements" element={<ProtectedAdminRoute><Placements /></ProtectedAdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </motion.div>
  );
}

function App() {
  useSmoothScroll();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AppPreloader show={booting} />
      <AuthProvider>
        <DataProvider>
          <DatabaseProvider>
            <ScrollRestoration />
            {!booting && <AppRoutes />}
          </DatabaseProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
