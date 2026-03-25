import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

  const adminNav = [
    { section: 'Main Menu', items: [
      { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
      { to: '/admin/patients', icon: 'bi-people', label: 'Patients' },
      { to: '/admin/doctors', icon: 'bi-person-heart', label: 'Doctors' },
      { to: '/admin/appointments', icon: 'bi-calendar-check', label: 'Appointments' },
    ]},
    { section: 'Finance & Reports', items: [
      { to: '/admin/billing', icon: 'bi-receipt', label: 'Billing' },
      { to: '/admin/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
    ]},
  ];

  const doctorNav = [
    { section: 'Main Menu', items: [
      { to: '/doctor/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
      { to: '/doctor/appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
      { to: '/doctor/prescriptions', icon: 'bi-file-earmark-medical', label: 'Prescriptions' },
    ]},
  ];

  const patientNav = [
    { section: 'Main Menu', items: [
      { to: '/patient/dashboard', icon: 'bi-grid', label: 'Dashboard' },
      { to: '/patient/profile', icon: 'bi-person', label: 'My Profile' },
      { to: '/patient/appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
      { to: '/patient/bills', icon: 'bi-receipt', label: 'My Bills' },
      { to: '/patient/settings', icon: 'bi-gear', label: 'Settings' },
    ]},
  ];

  const navConfig = user?.role === 'admin' ? adminNav
                  : user?.role === 'doctor' ? doctorNav
                  : patientNav;

  const roleLabel = user?.role === 'admin' ? 'Administrator'
                  : user?.role === 'doctor' ? 'Doctor'
                  : 'Patient';

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon"><i className="bi bi-hospital"></i></div>
        <div>
          <span>MediCare<br/>Clinic</span>
          <small>Management System</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navConfig.map((section, si) => (
          <div key={si}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`}></i> {item.label}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sidebar-section-label">System</div>
        <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
          <i className="bi bi-box-arrow-left"></i> Logout
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{roleLabel}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
