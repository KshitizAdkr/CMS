import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  const statusColor = { Completed: 'status-completed', Scheduled: 'status-scheduled', Cancelled: 'status-cancelled' };
  const initials = (name) => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's what's happening at MediCare Clinic today.</p>
        </div>
        <div className="breadcrumb-custom">
          <i className="bi bi-house"></i><i className="bi bi-chevron-right"></i>
          <span className="active">Dashboard</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-people-fill', color: 'blue', label: 'Total Patients', val: stats.totalPatients },
          { icon: 'bi-person-badge-fill', color: 'navy', label: 'Doctors', val: stats.totalDoctors },
          { icon: 'bi-calendar2-week-fill', color: 'teal', label: 'Total Appts', val: stats.totalAppts },
          { icon: 'bi-clock-fill', color: 'orange', label: 'Scheduled', val: stats.scheduled },
          { icon: 'bi-check-circle-fill', color: 'green', label: 'Completed', val: stats.completed },
          { icon: 'bi-currency-rupee', color: 'teal', label: 'Revenue', val: `Rs. ${Number(stats.totalRevenue).toLocaleString()}` },
        ].map((s, i) => (
          <div className="col-xl-2 col-lg-4 col-sm-6" key={i}>
            <div className="stat-card">
              <div className={`stat-icon ${s.color}`}><i className={`bi ${s.icon}`}></i></div>
              <div className="stat-info"><strong>{s.val}</strong><span>{s.label}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Activity Row */}
      <div className="row g-3 mb-4">
        {/* Appointment Status */}
        <div className="col-lg-4">
          <div className="chart-card h-100">
            <h6><i className="bi bi-pie-chart-fill text-accent me-1"></i> Appointment Status</h6>
            <p>Distribution by status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {[
                { label: 'Completed', count: stats.completed, color: '#10B981' },
                { label: 'Scheduled', count: stats.scheduled, color: '#2196F3' },
                { label: 'Cancelled', count: stats.cancelled, color: '#EF4444' },
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

        {/* Quick Stats */}
        <div className="col-lg-4">
          <div className="chart-card h-100">
            <h6><i className="bi bi-lightning-fill text-accent me-1"></i> Quick Overview</h6>
            <p>Clinic at a glance</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
              {[
                { label: 'Patient Occupancy', pct: 85, color: 'var(--accent)' },
                { label: 'Appointment Rate', pct: 72, color: 'var(--accent-teal)' },
                { label: 'Billing Collection', pct: 68, color: 'var(--success)' },
                { label: 'Doctor Utilization', pct: 91, color: 'var(--warning)' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: '13px', color: 'var(--gray-800)' }}>{s.label}</span>
                    <strong style={{ fontSize: '13px', color: 'var(--navy)' }}>{s.pct}%</strong>
                  </div>
                  <div className="report-bar">
                    <div className="report-bar-fill" style={{ width: `${s.pct}%`, background: s.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="col-lg-4">
          <div className="chart-card h-100">
            <h6><i className="bi bi-activity text-accent me-1"></i> Recent Activity</h6>
            <p>Latest clinic events</p>
            <div>
              {[
                { type: 'blue', icon: 'bi-calendar-plus', text: 'New appointment booked', time: '2 min ago' },
                { type: 'green', icon: 'bi-check-circle', text: 'Appointment marked Completed', time: '18 min ago' },
                { type: 'amber', icon: 'bi-person-plus', text: 'New patient registered', time: '42 min ago' },
                { type: 'red', icon: 'bi-x-circle', text: 'Appointment Cancelled', time: '1 hr ago' },
                { type: 'blue', icon: 'bi-file-earmark-medical', text: 'Prescription added', time: '2 hr ago' },
              ].map((a, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-dot ${a.type}`}><i className={`bi ${a.icon}`}></i></div>
                  <div className="activity-content">
                    <p>{a.text}</p>
                    <time>{a.time}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table */}
      <div className="card">
        <div className="card-header-custom">
          <h5><i className="bi bi-calendar-check"></i> Recent Appointments</h5>
        </div>
        <div className="card-body-custom">
          <div className="table-wrapper">
            <table className="mc-table">
              <thead>
                <tr><th>#</th><th>Patient</th><th>Specialization</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {stats.recentAppts?.map(a => (
                  <tr key={a.id}>
                    <td><span className="invoice-badge">#{String(a.id).padStart(3, '0')}</span></td>
                    <td>
                      <div className="td-name">
                        <div className={`td-avatar ${avatarColors[(a.patient_id - 1) % 5]}`}>{initials(a.patient_name)}</div>
                        <div className="td-main"><strong>{a.patient_name}</strong><small>{a.doctor_name}</small></div>
                      </div>
                    </td>
                    <td>{a.specialization}</td>
                    <td>{a.date}</td>
                    <td><span className={`status-badge ${statusColor[a.status]}`}>{a.status}</span></td>
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
