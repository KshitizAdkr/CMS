import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to role-appropriate dashboard
    const dashboardPath = user.role === 'admin' ? '/admin/dashboard'
                        : user.role === 'doctor' ? '/doctor/dashboard'
                        : '/patient/profile';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
