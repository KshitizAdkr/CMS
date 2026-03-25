import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import Doctors from './pages/admin/Doctors';
import Patients from './pages/admin/Patients';
import Appointments from './pages/admin/Appointments';
import Billing from './pages/admin/Billing';
import Reports from './pages/admin/Reports';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import Prescriptions from './pages/doctor/Prescriptions';

// Patient pages
import PatientProfile from './pages/patient/PatientProfile';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientBills from './pages/patient/PatientBills';
import Settings from './pages/patient/Settings';

function RootRedirect() {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="doctors" element={<Doctors />} />
              <Route path="patients" element={<Patients />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="billing" element={<Billing />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            {/* Doctor Routes */}
            <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="prescriptions" element={<Prescriptions />} />
            </Route>

            {/* Patient Routes */}
            <Route path="/patient" element={<ProtectedRoute roles={['patient']}><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="bills" element={<PatientBills />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
