import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appts, setAppts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ appointment_id: '', medicine: '', dosage: '', duration: '', notes: '' });
  const { showToast } = useToast();

  const fetchAll = async () => {
    const [p, a] = await Promise.all([api.get('/prescriptions'), api.get('/appointments')]);
    setPrescriptions(p.data); setAppts(a.data.filter(ap => ap.status === 'Completed'));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    if (!form.appointment_id || !form.medicine) { showToast('error', 'Error', 'Fill required fields.'); return; }
    try {
      await api.post('/prescriptions', form);
      showToast('success', 'Added', 'Prescription added.');
      setForm({ appointment_id: '', medicine: '', dosage: '', duration: '', notes: '' });
      setShowAdd(false); fetchAll();
    } catch (err) { showToast('error', 'Error', err.response?.data?.error || 'Failed.'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Prescriptions</h2><p>Manage prescriptions for your patients</p></div>
        <div className="d-flex align-items-center gap-2">
          <div className="breadcrumb-custom me-2"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Prescriptions</span></div>
          <button className="btn-primary-mc" onClick={() => setShowAdd(true)}><i className="bi bi-plus-circle"></i> Add Prescription</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-file-earmark-medical"></i> All Prescriptions</h5></div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Notes</th></tr></thead>
            <tbody>
              {prescriptions.map(p => (
                <tr key={p.id}>
                  <td><span className="invoice-badge">#{String(p.id).padStart(3,'0')}</span></td>
                  <td><strong>{p.patient_name}</strong></td>
                  <td>{p.doctor_name}</td>
                  <td><strong style={{color:'var(--accent)'}}>{p.medicine}</strong></td>
                  <td>{p.dosage}</td><td>{p.duration}</td><td>{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal fade show" style={{display:'block',background:'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
            <div className="modal-header"><div className="modal-title"><i className="bi bi-plus-circle"></i> Add Prescription</div><button className="btn-close" onClick={()=>setShowAdd(false)}></button></div>
            <div className="modal-body"><div className="row g-3">
              <div className="col-md-12"><label className="form-label">Appointment (Completed) *</label>
                <select className="form-select" value={form.appointment_id} onChange={e=>setForm({...form,appointment_id:e.target.value})}>
                  <option value="">Select Appointment</option>
                  {appts.map(a=><option key={a.id} value={a.id}>#{a.id} — {a.patient_name} ({a.date?.split('T')[0]})</option>)}
                </select></div>
              <div className="col-md-6"><label className="form-label">Medicine *</label><input className="form-control" value={form.medicine} onChange={e=>setForm({...form,medicine:e.target.value})} /></div>
              <div className="col-md-3"><label className="form-label">Dosage</label><input className="form-control" value={form.dosage} onChange={e=>setForm({...form,dosage:e.target.value})} /></div>
              <div className="col-md-3"><label className="form-label">Duration</label><input className="form-control" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} /></div>
              <div className="col-12"><label className="form-label">Notes</label><input className="form-control" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
            </div></div>
            <div className="modal-footer"><button className="btn-outline-mc" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn-primary-mc" onClick={handleAdd}><i className="bi bi-check"></i> Add</button></div>
          </div></div>
        </div>
      )}
    </>
  );
}
