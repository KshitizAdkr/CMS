import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    icon: 'bi-calendar-check',
    iconColor: 'blue',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Smith is tomorrow at 10:00 AM.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    icon: 'bi-capsule',
    iconColor: 'green',
    title: 'Prescription Ready',
    message: 'Your prescription for Amoxicillin has been issued.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    icon: 'bi-receipt',
    iconColor: 'amber',
    title: 'New Bill Generated',
    message: 'Bill #005 of Rs. 1,500 has been generated for your visit.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 4,
    icon: 'bi-person-check',
    iconColor: 'teal',
    title: 'Profile Updated',
    message: 'Your profile information was updated successfully.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 5,
    icon: 'bi-heart-pulse',
    iconColor: 'red',
    title: 'Health Tip',
    message: 'Stay hydrated! Drink at least 8 glasses of water daily.',
    time: '2 days ago',
    read: true,
  },
];

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const initials = user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  const getProfilePath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    return '/patient/profile';
  };

  const getSettingsPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'doctor') return '/doctor/dashboard';
    return '/patient/settings';
  };

  const toggleSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show');
  };

  return (
    <>
      <header className="topbar">
        <button className="mobile-toggle" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
        <div className="topbar-title" onClick={() => navigate(getDashboardPath())} style={{ cursor: 'pointer' }}>{title}</div>
        <div className="topbar-search">
          <i className="bi bi-search"></i>
          <input type="text" placeholder="Search…" />
        </div>
        <div className="topbar-actions">
          {/* Notifications */}
          <div className="notif-dropdown-wrap" ref={notifRef}>
            <button
              className="topbar-icon-btn"
              title="Notifications"
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
            >
              <i className="bi bi-bell"></i>
              {unreadCount > 0 && <span className="notif-dot"></span>}
            </button>

            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">
                  <h6>Notifications</h6>
                  {unreadCount > 0 && (
                    <span className="notif-unread-badge">{unreadCount} new</span>
                  )}
                  <button className="notif-mark-read" onClick={markAllAsRead}>
                    <i className="bi bi-check2-all"></i> Mark all read
                  </button>
                </div>
                <div className="notif-dropdown-body">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className={`notif-item-icon ${n.iconColor}`}>
                        <i className={`bi ${n.icon}`}></i>
                      </div>
                      <div className="notif-item-content">
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <time>{n.time}</time>
                      </div>
                      {!n.read && <div className="notif-unread-dot"></div>}
                    </div>
                  ))}
                </div>
                <div className="notif-dropdown-footer">
                  <button onClick={() => setNotifOpen(false)}>View All Notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="profile-dropdown-wrap" ref={dropdownRef}>
            <div
              className="topbar-profile"
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar">{initials}</div>
              <span>{user?.name?.split(' ')[0]}</span>
              <i
                className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`}
                style={{ fontSize: '10px', color: 'var(--gray-400)', transition: 'transform .2s' }}
              ></i>
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '15px', background: 'var(--navy)' }}>{initials}</div>
                  <div>
                    <strong>{user?.name}</strong>
                    <span>{user?.email}</span>
                    <span className="role-pill">{roleLabel}</span>
                  </div>
                </div>
                <div className="profile-dropdown-divider"></div>
                <button className="profile-dropdown-item" onClick={() => { setDropdownOpen(false); navigate(getProfilePath()); }}>
                  <i className="bi bi-person"></i> My Profile
                </button>
                <button className="profile-dropdown-item" onClick={() => { setDropdownOpen(false); navigate(getSettingsPath()); }}>
                  <i className="bi bi-gear"></i> Settings
                </button>
                <div className="profile-dropdown-divider"></div>
                <button
                  className="profile-dropdown-item logout-item"
                  onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }}
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content" style={{ textAlign: 'center' }}>
              <div className="modal-body" style={{ padding: '36px 28px 20px' }}>
                <div style={{
                  width: '68px', height: '68px',
                  background: 'rgba(245,158,11,.1)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <i className="bi bi-box-arrow-right" style={{ fontSize: '30px', color: 'var(--warning)' }}></i>
                </div>
                <h5 style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '8px', fontSize: '18px' }}>
                  Logout Confirmation
                </h5>
                <p style={{ color: 'var(--gray-600)', fontSize: '14px', marginBottom: '0' }}>
                  Are you sure you want to log out of your account?
                </p>
              </div>
              <div className="modal-footer" style={{ justifyContent: 'center', gap: '10px', padding: '16px 28px 28px', borderTop: 'none' }}>
                <button
                  className="btn-outline-mc"
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{ minWidth: '120px' }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary-mc"
                  onClick={handleLogout}
                  style={{ minWidth: '120px', background: 'var(--danger)' }}
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
