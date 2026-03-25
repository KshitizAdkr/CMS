import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';

export default function PatientProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/patients/${user.id}`).then(res => {
      setPatient(res.data);
      setForm(res.data);
    }).catch(console.error);
    api.get('/prescriptions').then(res => setPrescriptions(res.data)).catch(console.error);
  }, [user.id]);

  const handleEdit = () => {
    setForm({ ...patient });
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({ ...patient });
    setEditing(false);
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      showToast('error', 'Error', 'Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/patients/${user.id}`, {
        name: form.name,
        email: form.email,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        phone: form.phone || '',
        city: form.city || '',
        blood_group: form.blood_group || '',
      });
      setPatient({ ...patient, ...form });
      updateUser({ name: form.name, email: form.email });
      setEditing(false);
      showToast('success', 'Success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!patient) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  const initials = patient.name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

  const profileFields = [
    { key: 'name', label: 'Full Name', icon: 'bi-person', type: 'text' },
    { key: 'email', label: 'Email', icon: 'bi-envelope', type: 'email' },
    { key: 'phone', label: 'Phone', icon: 'bi-telephone', type: 'tel' },
    { key: 'city', label: 'City', icon: 'bi-geo-alt', type: 'text' },
    { key: 'age', label: 'Age', icon: 'bi-calendar', type: 'number' },
    { key: 'gender', label: 'Gender', icon: 'bi-person', type: 'select', options: ['Male', 'Female', 'Other'] },
    { key: 'blood_group', label: 'Blood Group', icon: 'bi-droplet-half', type: 'select', options: ['A+','A-','B+','B-','AB+','AB-','O+','O-'] },
  ];

  return (
    <>
      <div className="page-header">
        <div><h2>My Profile</h2><p>View and manage your personal details</p></div>
        <div className="breadcrumb-custom"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Profile</span></div>
      </div>

      <div className="row g-3 mb-4">
        {/* Profile Card */}
        <div className="col-lg-4">
          <div className="card text-center p-4">
            <div className="td-avatar bg-1" style={{width:'80px',height:'80px',fontSize:'28px',margin:'0 auto 16px'}}>{initials}</div>
            <h4 style={{fontWeight:700,color:'var(--navy)',marginBottom:'4px'}}>{patient.name}</h4>
            <span className="invoice-badge mb-3">Patient #{String(patient.id).padStart(3,'0')}</span>

            {!editing ? (
              <>
                <div className="text-start mt-3" style={{maxWidth:'300px',margin:'0 auto'}}>
                  {[
                    {label:'Email', val:patient.email, icon:'bi-envelope'},
                    {label:'Phone', val:patient.phone, icon:'bi-telephone'},
                    {label:'City', val:patient.city, icon:'bi-geo-alt'},
                    {label:'Age', val:patient.age ? `${patient.age} years` : '—', icon:'bi-calendar'},
                    {label:'Gender', val:patient.gender || '—', icon:'bi-person'},
                    {label:'Blood Group', val:patient.blood_group || '—', icon:'bi-droplet-half'},
                  ].map((item,i)=>(
                    <div key={i} className="d-flex align-items-center gap-2 mb-2">
                      <i className={`bi ${item.icon}`} style={{color:'var(--accent)',width:'20px'}}></i>
                      <span style={{fontSize:'13px',color:'var(--gray-600)'}}>{item.label}:</span>
                      <strong style={{fontSize:'13px'}}>{item.val}</strong>
                    </div>
                  ))}
                </div>
                <button className="btn-primary-mc mt-3" onClick={handleEdit} style={{margin:'0 auto'}}>
                  <i className="bi bi-pencil"></i> Edit Profile
                </button>
              </>
            ) : (
              <div className="text-start mt-3" style={{maxWidth:'340px',margin:'0 auto'}}>
                {profileFields.map((field) => (
                  <div key={field.key} className="mb-3">
                    <label className="form-label">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        className="form-select"
                        value={form[field.key] || ''}
                        onChange={handleChange(field.key)}
                      >
                        <option value="">Select</option>
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="form-control"
                        value={form[field.key] || ''}
                        onChange={handleChange(field.key)}
                      />
                    )}
                  </div>
                ))}
                <div style={{display:'flex',gap:'10px',justifyContent:'center',marginTop:'16px'}}>
                  <button className="btn-outline-mc" onClick={handleCancel} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn-primary-mc" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-1"></span> Saving…</> : <><i className="bi bi-check-lg"></i> Save Changes</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header-custom"><h5><i className="bi bi-file-earmark-medical"></i> My Prescriptions</h5></div>
            <div className="card-body-custom table-wrapper">
              <table className="mc-table">
                <thead><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Doctor</th><th>Notes</th></tr></thead>
                <tbody>
                  {prescriptions.length === 0 ? (
                    <tr><td colSpan="5" className="text-center" style={{padding:'20px',color:'var(--gray-400)'}}>No prescriptions found.</td></tr>
                  ) : prescriptions.map(p=>(
                    <tr key={p.id}>
                      <td><strong style={{color:'var(--accent)'}}>{p.medicine}</strong></td>
                      <td>{p.dosage}</td><td>{p.duration}</td>
                      <td>{p.doctor_name}</td><td>{p.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
