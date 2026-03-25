import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import DeleteModal from '../../components/DeleteModal';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [editPat, setEditPat] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', age: '', gender: '', phone: '', city: '', blood_group: '', address: '' });
  const { showToast } = useToast();

  const fetchPatients = () => api.get('/patients').then(res => setPatients(res.data)).catch(console.error);
  useEffect(() => { fetchPatients(); }, []);

  const initials = (name) => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.city?.toLowerCase().includes(q);
    const matchGender = !genderFilter || p.gender?.toLowerCase() === genderFilter;
    return matchSearch && matchGender;
  });

  const activeCount = patients.filter(p => p.status === 'active').length;
  const maleCount = patients.filter(p => p.gender === 'Male').length;
  const femaleCount = patients.filter(p => p.gender === 'Female').length;

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.gender || !form.phone) { showToast('error', 'Error', 'Fill required fields.'); return; }
    try {
      await api.post('/patients', form);
      showToast('success', 'Patient Added', `${form.name} has been registered.`);
      setForm({ name: '', email: '', age: '', gender: '', phone: '', city: '', blood_group: '', address: '' });
      setShowAdd(false);
      fetchPatients();
    } catch (err) { showToast('error', 'Error', err.response?.data?.error || 'Failed.'); }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/patients/${editPat.id}`, editPat);
      showToast('success', 'Updated', 'Patient updated.');
      setShowEdit(false);
      fetchPatients();
    } catch (err) { showToast('error', 'Error', 'Update failed.'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/patients/${deleteTarget.id}`);
      showToast('success', 'Deleted', `${deleteTarget.name} removed.`);
      setDeleteTarget(null);
      fetchPatients();
    } catch (err) { showToast('error', 'Error', 'Delete failed.'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Patient Management</h2><p>Manage all registered patients at MediCare Clinic</p></div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="breadcrumb-custom me-2"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Patients</span></div>
          <button className="btn-primary-mc" onClick={() => setShowAdd(true)}><i className="bi bi-person-plus"></i> Add Patient</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon blue"><i className="bi bi-people-fill"></i></div><div className="stat-info"><strong>{patients.length}</strong><span>Total Patients</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon green"><i className="bi bi-person-check-fill"></i></div><div className="stat-info"><strong>{activeCount}</strong><span>Active</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon orange"><i className="bi bi-gender-ambiguous"></i></div><div className="stat-info"><strong>{maleCount} / {femaleCount}</strong><span>Male / Female</span></div></div></div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-people"></i> All Patients</h5></div>
        <div className="table-controls">
          <div className="search-input-wrap"><i className="bi bi-search"></i><input type="text" placeholder="Search by name, phone, city…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <select className="filter-select" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
            <option value="">All Genders</option><option value="male">Male</option><option value="female">Female</option>
          </select>
        </div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Phone</th><th>City</th><th>Blood Group</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="invoice-badge">#{String(p.id).padStart(3, '0')}</span></td>
                  <td><div className="td-name"><div className={`td-avatar ${avatarColors[(p.id - 1) % 5]}`}>{initials(p.name)}</div><div className="td-main"><strong>{p.name}</strong><small>{p.gender}, {p.age} yrs</small></div></div></td>
                  <td>{p.phone}</td>
                  <td>{p.city}</td>
                  <td><span className="blood-tag">{p.blood_group}</span></td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status?.charAt(0).toUpperCase() + p.status?.slice(1)}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon view" onClick={() => { setViewPatient(p); setShowView(true); }}><i className="bi bi-eye"></i></button>
                      <button className="btn-icon edit" onClick={() => { setEditPat({ ...p }); setShowEdit(true); }}><i className="bi bi-pencil"></i></button>
                      <button className="btn-icon del" onClick={() => setDeleteTarget(p)}><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
            <div className="modal-header"><div className="modal-title"><i className="bi bi-person-plus"></i> Register New Patient</div><button className="btn-close" onClick={() => setShowAdd(false)}></button></div>
            <div className="modal-body"><div className="row g-3">
              <div className="col-md-6"><label className="form-label">Full Name *</label><input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="col-md-3"><label className="form-label">Age *</label><input type="number" className="form-control" value={form.age} onChange={e => setForm({...form, age: e.target.value})} /></div>
              <div className="col-md-3"><label className="form-label">Gender *</label><select className="form-select" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              <div className="col-md-6"><label className="form-label">Phone *</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label">Blood Group</label><select className="form-select" value={form.blood_group} onChange={e => setForm({...form, blood_group: e.target.value})}><option value="">Select</option>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            </div></div>
            <div className="modal-footer"><button className="btn-outline-mc" onClick={() => setShowAdd(false)}><i className="bi bi-x"></i> Cancel</button><button className="btn-primary-mc" onClick={handleAdd}><i className="bi bi-check"></i> Register Patient</button></div>
          </div></div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && editPat && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
            <div className="modal-header"><div className="modal-title"><i className="bi bi-pencil"></i> Edit Patient</div><button className="btn-close" onClick={() => setShowEdit(false)}></button></div>
            <div className="modal-body"><div className="row g-3">
              <div className="col-md-6"><label className="form-label">Full Name *</label><input className="form-control" value={editPat.name} onChange={e => setEditPat({...editPat, name: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label">Email *</label><input type="email" className="form-control" value={editPat.email} onChange={e => setEditPat({...editPat, email: e.target.value})} /></div>
              <div className="col-md-3"><label className="form-label">Age</label><input type="number" className="form-control" value={editPat.age} onChange={e => setEditPat({...editPat, age: e.target.value})} /></div>
              <div className="col-md-3"><label className="form-label">Gender</label><select className="form-select" value={editPat.gender} onChange={e => setEditPat({...editPat, gender: e.target.value})}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={editPat.phone} onChange={e => setEditPat({...editPat, phone: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label">City</label><input className="form-control" value={editPat.city} onChange={e => setEditPat({...editPat, city: e.target.value})} /></div>
              <div className="col-md-6"><label className="form-label">Blood Group</label><select className="form-select" value={editPat.blood_group} onChange={e => setEditPat({...editPat, blood_group: e.target.value})}>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            </div></div>
            <div className="modal-footer"><button className="btn-outline-mc" onClick={() => setShowEdit(false)}><i className="bi bi-x"></i> Cancel</button><button className="btn-primary-mc" onClick={handleEdit}><i className="bi bi-check"></i> Update Patient</button></div>
          </div></div>
        </div>
      )}

      {/* View Modal */}
      {showView && viewPatient && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
            <div className="modal-header"><div className="modal-title"><i className="bi bi-person"></i> Patient Details</div><button className="btn-close" onClick={() => setShowView(false)}></button></div>
            <div className="modal-body text-center">
              <div className={`td-avatar ${avatarColors[(viewPatient.id - 1) % 5]}`} style={{ width: '64px', height: '64px', fontSize: '22px', margin: '0 auto 12px' }}>{initials(viewPatient.name)}</div>
              <h5 style={{ fontWeight: 700, color: 'var(--navy)' }}>{viewPatient.name}</h5>
              <span className="invoice-badge mb-3 d-inline-block">#{String(viewPatient.id).padStart(3, '0')}</span>
              <div className="row g-3 text-start mt-2">
                <div className="col-6"><p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '4px' }}>Age</p><strong>{viewPatient.age} years</strong></div>
                <div className="col-6"><p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '4px' }}>Gender</p><strong>{viewPatient.gender}</strong></div>
                <div className="col-6"><p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '4px' }}>Phone</p><strong>{viewPatient.phone}</strong></div>
                <div className="col-6"><p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '4px' }}>City</p><strong>{viewPatient.city}</strong></div>
                <div className="col-6"><p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '4px' }}>Blood Group</p><span className="blood-tag">{viewPatient.blood_group}</span></div>
                <div className="col-6"><p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', marginBottom: '4px' }}>Status</p><span className={`status-badge status-${viewPatient.status}`}>{viewPatient.status}</span></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-outline-mc" onClick={() => setShowView(false)}>Close</button></div>
          </div></div>
        </div>
      )}

      <DeleteModal show={!!deleteTarget} label={deleteTarget?.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
