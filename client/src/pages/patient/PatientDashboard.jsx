import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/patient-stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  const initials = user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  return (
    <>
      <div className="page-header">
        <div>
          <h2>{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Here's an overview of your health activities</p>
        </div>
        <div className="breadcrumb-custom">
          <i className="bi bi-house"></i><i className="bi bi-chevron-right"></i>
          <span className="active">Dashboard</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-calendar2-check', color: 'blue', label: 'Total Appointments', val: stats.totalAppts },
          { icon: 'bi-clock-fill', color: 'orange', label: 'Upcoming', val: stats.scheduled },
          { icon: 'bi-check-circle-fill', color: 'green', label: 'Completed', val: stats.completed },
          { icon: 'bi-capsule', color: 'teal', label: 'Prescriptions', val: stats.totalPrescriptions },
          { icon: 'bi-receipt', color: 'navy', label: 'Total Bills', val: stats.totalBills },
          { icon: 'bi-currency-rupee', color: 'red', label: 'Pending Dues', val: `Rs. ${Number(stats.pendingAmount).toLocaleString()}` },
        ].map((s, i) => (
          <div className="col-xl-2 col-lg-4 col-sm-6" key={i}>
            <div className="stat-card">
              <div className={`stat-icon ${s.color}`}><i className={`bi ${s.icon}`}></i></div>
              <div className="stat-info"><strong>{s.val}</strong><span>{s.label}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Appointment Overview */}
        <div className="col-lg-4">
          <div className="chart-card h-100">
            <h6><i className="bi bi-pie-chart-fill text-accent me-1"></i> Appointment Overview</h6>
            <p>Your appointment statistics</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {[
                { label: 'Completed', count: stats.completed, color: '#10B981' },
                { label: 'Upcoming', count: stats.scheduled, color: '#2196F3' },
              ].map((s, i) => {
                const pct = stats.totalAppts ? Math.round((s.count / stats.totalAppts) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="d-flex justify-content-between mb-1">
                      <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, display: 'inline-block' }}></span>
                        {s.label}
                      </span>
                      <strong style={{ fontSize: '13px' }}>{s.count} ({pct}%)</strong>
                    </div>
                    <div className="report-bar">
                      <div className="report-bar-fill" style={{ width: `${pct}%`, background: s.color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="col-lg-4">
          <div className="chart-card h-100">
            <h6><i className="bi bi-wallet2 text-accent me-1"></i> Billing Summary</h6>
            <p>Your payment overview</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
              {[
                { label: 'Total Paid', val: `Rs. ${Number(stats.paidAmount).toLocaleString()}`, color: 'var(--success)' },
                { label: 'Pending Dues', val: `Rs. ${Number(stats.pendingAmount).toLocaleString()}`, color: 'var(--danger)' },
                { label: 'Total Bills', val: stats.totalBills, color: 'var(--accent)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, display: 'inline-block' }}></span>
                    {s.label}
                  </span>
                  <strong style={{ fontSize: '14px', color: 'var(--navy)' }}>{s.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="chart-card h-100">
            <h6><i className="bi bi-lightning-fill text-accent me-1"></i> Quick Actions</h6>
            <p>Navigate to key sections</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              {[
                { icon: 'bi-person', label: 'View Profile', desc: 'See your personal details', path: '/patient/profile', color: 'blue' },
                { icon: 'bi-calendar-check', label: 'My Appointments', desc: 'View all appointments', path: '/patient/appointments', color: 'green' },
                { icon: 'bi-receipt', label: 'My Bills', desc: 'Check billing history', path: '/patient/bills', color: 'amber' },
                { icon: 'bi-gear', label: 'Settings', desc: 'Manage preferences', path: '/patient/settings', color: 'navy' },
              ].map((a, i) => (
                <div
                  key={i}
                  className="activity-item"
                  style={{ cursor: 'pointer', borderRadius: '10px', padding: '12px', margin: 0, border: '1px solid var(--gray-100)', transition: 'var(--transition)' }}
                  onClick={() => navigate(a.path)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className={`activity-dot ${a.color}`}><i className={`bi ${a.icon}`}></i></div>
                  <div className="activity-content">
                    <p style={{ fontWeight: 600 }}>{a.label}</p>
                    <time>{a.desc}</time>
                  </div>
                  <i className="bi bi-chevron-right" style={{ color: 'var(--gray-400)', marginLeft: 'auto' }}></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="card-header-custom">
          <h5><i className="bi bi-calendar-check"></i> Upcoming Appointments</h5>
          <button className="btn-outline-mc" onClick={() => navigate('/patient/appointments')}>
            View All <i className="bi bi-arrow-right"></i>
          </button>
        </div>
        <div className="card-body-custom">
          <div className="table-wrapper">
            <table className="mc-table">
              <thead>
                <tr><th>#</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.upcomingAppts?.length === 0 ? (
                  <tr><td colSpan="6" className="text-center" style={{padding:'20px',color:'var(--gray-400)'}}>No upcoming appointments.</td></tr>
                ) : stats.upcomingAppts?.map(a => (
                  <tr key={a.id}>
                    <td><span className="invoice-badge">#{String(a.id).padStart(3, '0')}</span></td>
                    <td>
                      <div className="td-main">
                        <strong>{a.doctor_name}</strong>
                        <small>{a.specialization}</small>
                      </div>
                    </td>
                    <td>{a.date}</td>
                    <td>{a.time}</td>
                    <td>{a.reason}</td>
                    <td><span className="status-badge status-scheduled">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
