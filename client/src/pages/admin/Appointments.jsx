import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import DeleteModal from '../../components/DeleteModal';

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editAppt, setEditAppt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Scheduled', reason: '' });
  const { showToast } = useToast();

  const fetchAll = async () => {
    const [a, d, p] = await Promise.all([api.get('/appointments'), api.get('/doctors'), api.get('/patients')]);
    setAppts(a.data); setDoctors(d.data); setPatients(p.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const initials = (name) => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];

  const filtered = appts.filter(a => {
    const q = search.toLowerCase();
    const m = !q || a.patient_name?.toLowerCase().includes(q) || a.doctor_name?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q);
    const s = !statusFilter || a.status === statusFilter;
    return m && s;
  });

  const counts = { total: appts.length, Scheduled: appts.filter(a=>a.status==='Scheduled').length, Completed: appts.filter(a=>a.status==='Completed').length, Cancelled: appts.filter(a=>a.status==='Cancelled').length };

  const handleAdd = async () => {
    if (!form.patient_id || !form.doctor_id || !form.date || !form.time) { showToast('error', 'Error', 'Fill required fields.'); return; }
    try {
      await api.post('/appointments', form);
      showToast('success', 'Booked', 'Appointment booked successfully.');
      setForm({ patient_id: '', doctor_id: '', date: '', time: '', status: 'Scheduled', reason: '' });
      setShowAdd(false); fetchAll();
    } catch (err) { showToast('error', 'Error', err.response?.data?.error || 'Failed.'); }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/appointments/${editAppt.id}`, editAppt);
      showToast('success', 'Updated', 'Appointment updated.'); setShowEdit(false); fetchAll();
    } catch (err) { showToast('error', 'Error', 'Update failed.'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/appointments/${deleteTarget.id}`);
      showToast('success', 'Deleted', 'Appointment removed.'); setDeleteTarget(null); fetchAll();
    } catch (err) { showToast('error', 'Error', 'Delete failed.'); }
  };

  const renderForm = (data, setData) => (
    <div className="row g-3">
      <div className="col-md-6"><label className="form-label">Patient *</label>
        <select className="form-select" value={data.patient_id} onChange={e => setData({...data, patient_id: e.target.value})}>
          <option value="">Select Patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select></div>
      <div className="col-md-6"><label className="form-label">Doctor *</label>
        <select className="form-select" value={data.doctor_id} onChange={e => setData({...data, doctor_id: e.target.value})}>
          <option value="">Select Doctor</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
        </select></div>
      <div className="col-md-4"><label className="form-label">Date *</label><input type="date" className="form-control" value={data.date?.split('T')[0] || data.date} onChange={e => setData({...data, date: e.target.value})} /></div>
      <div className="col-md-4"><label className="form-label">Time *</label><input type="time" className="form-control" value={data.time} onChange={e => setData({...data, time: e.target.value})} /></div>
      <div className="col-md-4"><label className="form-label">Status</label>
        <select className="form-select" value={data.status} onChange={e => setData({...data, status: e.target.value})}>
          <option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
        </select></div>
      <div className="col-12"><label className="form-label">Reason *</label><input className="form-control" value={data.reason} onChange={e => setData({...data, reason: e.target.value})} /></div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div><h2>Appointment Management</h2><p>Schedule, manage and track all clinic appointments</p></div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="breadcrumb-custom me-2"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Appointments</span></div>
          <button className="btn-primary-mc" onClick={() => setShowAdd(true)}><i className="bi bi-calendar-plus"></i> Book Appointment</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[{ icon:'bi-calendar2-week-fill', color:'teal', label:'Total', val:counts.total },
          { icon:'bi-clock-fill', color:'blue', label:'Scheduled', val:counts.Scheduled },
          { icon:'bi-check-circle-fill', color:'green', label:'Completed', val:counts.Completed },
          { icon:'bi-x-circle-fill', color:'red', label:'Cancelled', val:counts.Cancelled }
        ].map((s,i) => (
          <div className="col-sm-3" key={i}><div className="stat-card"><div className={`stat-icon ${s.color}`}><i className={`bi ${s.icon}`}></i></div><div className="stat-info"><strong>{s.val}</strong><span>{s.label}</span></div></div></div>
        ))}
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-calendar-check"></i> All Appointments</h5></div>
        <div className="table-controls">
          <div className="search-input-wrap"><i className="bi bi-search"></i><input type="text" placeholder="Search by patient, doctor, reason…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option value="Scheduled">Scheduled</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td><span className="invoice-badge">#{String(a.id).padStart(3,'0')}</span></td>
                  <td><div className="td-name"><div className={`td-avatar ${avatarColors[(a.patient_id-1)%5]}`}>{initials(a.patient_name)}</div><div className="td-main"><strong>{a.patient_name}</strong><small>{a.patient_phone}</small></div></div></td>
                  <td><div className="td-main"><strong>{a.doctor_name}</strong><small>{a.specialization}</small></div></td>
                  <td>{a.date?.split('T')[0]}</td>
                  <td>{a.time}</td>
                  <td>{a.reason}</td>
                  <td><span className={`status-badge status-${a.status.toLowerCase()}`}>{a.status}</span></td>
                  <td><div className="action-btns">
                    <button className="btn-icon edit" onClick={() => { setEditAppt({...a, date: a.date?.split('T')[0]}); setShowEdit(true); }}><i className="bi bi-pencil"></i></button>
                    <button className="btn-icon del" onClick={() => setDeleteTarget(a)}><i className="bi bi-trash"></i></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && <div className="modal fade show" style={{display:'block',background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
        <div className="modal-header"><div className="modal-title"><i className="bi bi-calendar-plus"></i> Book New Appointment</div><button className="btn-close" onClick={()=>setShowAdd(false)}></button></div>
        <div className="modal-body">{renderForm(form, setForm)}</div>
        <div className="modal-footer"><button className="btn-outline-mc" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn-primary-mc" onClick={handleAdd}><i className="bi bi-check"></i> Book</button></div>
      </div></div></div>}

      {/* Edit Modal */}
      {showEdit && editAppt && <div className="modal fade show" style={{display:'block',background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
        <div className="modal-header"><div className="modal-title"><i className="bi bi-pencil"></i> Edit Appointment</div><button className="btn-close" onClick={()=>setShowEdit(false)}></button></div>
        <div className="modal-body">{renderForm(editAppt, setEditAppt)}</div>
        <div className="modal-footer"><button className="btn-outline-mc" onClick={()=>setShowEdit(false)}>Cancel</button><button className="btn-primary-mc" onClick={handleEdit}><i className="bi bi-check"></i> Update</button></div>
      </div></div></div>}

      <DeleteModal show={!!deleteTarget} label={`Appointment #${deleteTarget?.id}`} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} />
    </>
  );
}
