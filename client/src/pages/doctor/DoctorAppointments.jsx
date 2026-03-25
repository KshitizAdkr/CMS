import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';

export default function DoctorAppointments() {
  const [appts, setAppts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const { showToast } = useToast();

  const fetchAppts = () => api.get('/appointments').then(res => setAppts(res.data)).catch(console.error);
  useEffect(() => { fetchAppts(); }, []);

  const filtered = appts.filter(a => !statusFilter || a.status === statusFilter);
  const initials = (name) => name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      showToast('success', 'Updated', `Appointment marked as ${status}.`);
      fetchAppts();
    } catch (err) { showToast('error', 'Error', 'Failed to update.'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>My Appointments</h2><p>View and manage your scheduled appointments</p></div>
        <div className="breadcrumb-custom"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Appointments</span></div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-calendar-check"></i> Appointments</h5></div>
        <div className="table-controls">
          <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>#</th><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id}>
                  <td><span className="invoice-badge">#{String(a.id).padStart(3,'0')}</span></td>
                  <td><div className="td-name"><div className={`td-avatar ${avatarColors[(a.patient_id-1)%5]}`}>{initials(a.patient_name)}</div><div className="td-main"><strong>{a.patient_name}</strong><small>{a.patient_phone}</small></div></div></td>
                  <td>{a.date?.split('T')[0]}</td><td>{a.time}</td><td>{a.reason}</td>
                  <td><span className={`status-badge status-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'Scheduled' && (
                      <div className="action-btns">
                        <button className="btn-icon view" title="Complete" onClick={() => updateStatus(a.id, 'Completed')}><i className="bi bi-check-circle"></i></button>
                        <button className="btn-icon del" title="Cancel" onClick={() => updateStatus(a.id, 'Cancelled')}><i className="bi bi-x-circle"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
