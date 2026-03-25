import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);

  useEffect(() => { api.get('/appointments').then(res => setAppts(res.data)).catch(console.error); }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appts.filter(a => a.date?.split('T')[0] === today);
  const upcoming = appts.filter(a => a.status === 'Scheduled');
  const completed = appts.filter(a => a.status === 'Completed');
  const initials = (name) => name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];

  return (
    <>
      <div className="page-header">
        <div><h2>Doctor Dashboard</h2><p>Welcome back, {user?.name}! Here are your appointments.</p></div>
        <div className="breadcrumb-custom"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Dashboard</span></div>
      </div>

      <div className="row g-3 mb-4">
        {[{icon:'bi-calendar2-week-fill',color:'teal',label:'Total Appointments',val:appts.length},
          {icon:'bi-calendar-check-fill',color:'blue',label:"Today's Appointments",val:todayAppts.length},
          {icon:'bi-clock-fill',color:'orange',label:'Upcoming',val:upcoming.length},
          {icon:'bi-check-circle-fill',color:'green',label:'Completed',val:completed.length}
        ].map((s,i)=>(
          <div className="col-sm-3" key={i}><div className="stat-card"><div className={`stat-icon ${s.color}`}><i className={`bi ${s.icon}`}></i></div><div className="stat-info"><strong>{s.val}</strong><span>{s.label}</span></div></div></div>
        ))}
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-calendar-check"></i> My Appointments</h5></div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>#</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
            <tbody>
              {appts.map(a=>(
                <tr key={a.id}>
                  <td><span className="invoice-badge">#{String(a.id).padStart(3,'0')}</span></td>
                  <td><div className="td-name"><div className={`td-avatar ${avatarColors[(a.patient_id-1)%5]}`}>{initials(a.patient_name)}</div><div className="td-main"><strong>{a.patient_name}</strong><small>{a.patient_phone}</small></div></div></td>
                  <td>{a.date?.split('T')[0]}</td><td>{a.time}</td><td>{a.reason}</td>
                  <td><span className={`status-badge status-${a.status.toLowerCase()}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
