import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import DeleteModal from '../../components/DeleteModal';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', salary: '', city: '' });
  const { showToast } = useToast();

  const fetchDoctors = () => api.get('/doctors').then(res => setDoctors(res.data)).catch(console.error);
  useEffect(() => { fetchDoctors(); }, []);

  const initials = (name) => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];
  const specs = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q);
    const matchSpec = !specFilter || d.specialization === specFilter;
    return matchSearch && matchSpec;
  });

  const totalSalary = doctors.reduce((s, d) => s + Number(d.salary || 0), 0);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.specialization) { showToast('error', 'Error', 'Fill required fields.'); return; }
    try {
      await api.post('/doctors', form);
      showToast('success', 'Doctor Added', `${form.name} has been registered.`);
      setForm({ name: '', email: '', phone: '', specialization: '', salary: '', city: '' });
      setShowAdd(false);
      fetchDoctors();
    } catch (err) { showToast('error', 'Error', err.response?.data?.error || 'Failed to add doctor.'); }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/doctors/${editDoc.id}`, editDoc);
      showToast('success', 'Updated', 'Doctor updated successfully.');
      setShowEdit(false);
      fetchDoctors();
    } catch (err) { showToast('error', 'Error', err.response?.data?.error || 'Update failed.'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/doctors/${deleteTarget.id}`);
      showToast('success', 'Deleted', `${deleteTarget.name} removed.`);
      setDeleteTarget(null);
      fetchDoctors();
    } catch (err) { showToast('error', 'Error', 'Delete failed.'); }
  };

  const renderModal = (show, setShow, title, icon, data, setData, onSave, saveLabel) => {
    if (!show) return null;
    return (
      <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title"><i className={`bi ${icon}`}></i> {title}</div>
              <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
            </div>
            <div className="modal-body">
              <div className="row g-3">
                {[
                  { key: 'name', label: 'Full Name *', type: 'text', ph: 'Dr. Full Name', col: 6 },
                  { key: 'specialization', label: 'Specialization *', type: 'text', ph: 'e.g. Cardiologist', col: 6 },
                  { key: 'phone', label: 'Phone *', type: 'tel', ph: '98XXXXXXXX', col: 6 },
                  { key: 'email', label: 'Email *', type: 'email', ph: 'doctor@medicareclinic.com', col: 6 },
                  { key: 'salary', label: 'Salary (Rs.)', type: 'number', ph: 'Monthly salary', col: 6 },
                  { key: 'city', label: 'City', type: 'text', ph: 'City', col: 6 },
                ].map(f => (
                  <div className={`col-md-${f.col}`} key={f.key}>
                    <label className="form-label">{f.label}</label>
                    <input type={f.type} className="form-control" placeholder={f.ph}
                      value={data[f.key] || ''} onChange={e => setData({ ...data, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline-mc" onClick={() => setShow(false)}><i className="bi bi-x"></i> Cancel</button>
              <button className="btn-primary-mc" onClick={onSave}><i className="bi bi-check"></i> {saveLabel}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Doctor Management</h2><p>Manage clinic doctors, specializations and schedules</p></div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="breadcrumb-custom me-2">
            <i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Doctors</span>
          </div>
          <button className="btn-primary-mc" onClick={() => setShowAdd(true)}>
            <i className="bi bi-person-plus"></i> Add Doctor
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon navy"><i className="bi bi-person-badge-fill"></i></div><div className="stat-info"><strong>{doctors.length}</strong><span>Total Doctors</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon teal"><i className="bi bi-award-fill"></i></div><div className="stat-info"><strong>{specs.length}</strong><span>Specializations</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon green"><i className="bi bi-currency-rupee"></i></div><div className="stat-info"><strong>Rs. {totalSalary.toLocaleString()}</strong><span>Total Salaries</span></div></div></div>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <h5><i className="bi bi-person-heart"></i> All Doctors</h5>
        </div>
        <div className="table-controls">
          <div className="search-input-wrap">
            <i className="bi bi-search"></i>
            <input type="text" placeholder="Search by name, specialization…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
            <option value="">All Specializations</option>
            {specs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>ID</th><th>Doctor</th><th>Specialization</th><th>Phone</th><th>City</th><th>Salary</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td><span className="invoice-badge">#{String(d.id).padStart(3, '0')}</span></td>
                  <td><div className="td-name"><div className={`td-avatar ${avatarColors[(d.id - 1) % 5]}`}>{initials(d.name)}</div><div className="td-main"><strong>{d.name}</strong><small>{d.email}</small></div></div></td>
                  <td><span className="spec-tag">{d.specialization}</span></td>
                  <td>{d.phone}</td>
                  <td>{d.city}</td>
                  <td><strong style={{ color: 'var(--navy)' }}>Rs. {Number(d.salary).toLocaleString()}</strong></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-icon edit" onClick={() => { setEditDoc({ ...d }); setShowEdit(true); }}><i className="bi bi-pencil"></i></button>
                      <button className="btn-icon del" onClick={() => setDeleteTarget(d)}><i className="bi bi-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {renderModal(showAdd, setShowAdd, 'Add New Doctor', 'bi-person-plus', form, setForm, handleAdd, 'Add Doctor')}
      {renderModal(showEdit, setShowEdit, 'Edit Doctor', 'bi-pencil', editDoc || {}, setEditDoc, handleEdit, 'Update Doctor')}
      <DeleteModal show={!!deleteTarget} label={deleteTarget?.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </>
  );
}
