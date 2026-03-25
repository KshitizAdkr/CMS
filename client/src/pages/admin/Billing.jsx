import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';
import DeleteModal from '../../components/DeleteModal';

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editBill, setEditBill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ patient_id: '', service: '', date: '', amount: '', discount: '0', paid: '0', status: 'Pending' });
  const { showToast } = useToast();

  const fetchAll = async () => {
    const [b, p] = await Promise.all([api.get('/bills'), api.get('/patients')]);
    setBills(b.data); setPatients(p.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const initials = (name) => name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];

  const filtered = bills.filter(b => {
    const q = search.toLowerCase();
    const m = !q || b.patient_name?.toLowerCase().includes(q) || b.service?.toLowerCase().includes(q) || String(b.id).includes(q);
    const s = !statusFilter || b.status === statusFilter;
    return m && s;
  });

  const totalInvoiced = bills.reduce((s,b)=>s+Number(b.amount),0);
  const totalCollected = bills.reduce((s,b)=>s+Number(b.paid),0);
  const totalPending = bills.filter(b=>b.status==='Pending'||b.status==='Overdue').reduce((s,b)=>s+Number(b.amount)-Number(b.paid)-Number(b.discount),0);

  const handleAdd = async () => {
    if (!form.patient_id||!form.service||!form.date||!form.amount) { showToast('error','Error','Fill required fields.'); return; }
    try { await api.post('/bills', form); showToast('success','Created','Invoice created.'); setShowAdd(false); setForm({ patient_id:'',service:'',date:'',amount:'',discount:'0',paid:'0',status:'Pending' }); fetchAll();
    } catch (err) { showToast('error','Error',err.response?.data?.error||'Failed.'); }
  };

  const handleEdit = async () => {
    try { await api.put(`/bills/${editBill.id}`, editBill); showToast('success','Updated','Bill updated.'); setShowEdit(false); fetchAll();
    } catch (err) { showToast('error','Error','Update failed.'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/bills/${deleteTarget.id}`); showToast('success','Deleted','Invoice removed.'); setDeleteTarget(null); fetchAll();
    } catch (err) { showToast('error','Error','Delete failed.'); }
  };

  const renderForm = (data, setData) => (
    <div className="row g-3">
      <div className="col-md-6"><label className="form-label">Patient *</label>
        <select className="form-select" value={data.patient_id} onChange={e=>setData({...data,patient_id:e.target.value})}>
          <option value="">Select Patient</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
        </select></div>
      <div className="col-md-6"><label className="form-label">Service *</label><input className="form-control" value={data.service} onChange={e=>setData({...data,service:e.target.value})} /></div>
      <div className="col-md-4"><label className="form-label">Date *</label><input type="date" className="form-control" value={data.date?.split('T')[0]||data.date} onChange={e=>setData({...data,date:e.target.value})} /></div>
      <div className="col-md-4"><label className="form-label">Amount (Rs.) *</label><input type="number" className="form-control" value={data.amount} onChange={e=>setData({...data,amount:e.target.value})} /></div>
      <div className="col-md-4"><label className="form-label">Discount</label><input type="number" className="form-control" value={data.discount} onChange={e=>setData({...data,discount:e.target.value})} /></div>
      <div className="col-md-6"><label className="form-label">Paid</label><input type="number" className="form-control" value={data.paid} onChange={e=>setData({...data,paid:e.target.value})} /></div>
      <div className="col-md-6"><label className="form-label">Status</label>
        <select className="form-select" value={data.status} onChange={e=>setData({...data,status:e.target.value})}>
          <option value="Pending">Pending</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option>
        </select></div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div><h2>Billing & Invoices</h2><p>Track payments, manage invoices and billing records</p></div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="breadcrumb-custom me-2"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Billing</span></div>
          <button className="btn-primary-mc" onClick={() => setShowAdd(true)}><i className="bi bi-receipt-cutoff"></i> New Invoice</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon navy"><i className="bi bi-receipt-cutoff"></i></div><div className="stat-info"><strong style={{fontSize:'1.1rem'}}>Rs. {totalInvoiced.toLocaleString()}</strong><span>Total Invoiced</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon green"><i className="bi bi-check-circle-fill"></i></div><div className="stat-info"><strong style={{fontSize:'1.1rem'}}>Rs. {totalCollected.toLocaleString()}</strong><span>Collected</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon orange"><i className="bi bi-exclamation-circle-fill"></i></div><div className="stat-info"><strong style={{fontSize:'1.1rem'}}>Rs. {Math.max(0,totalPending).toLocaleString()}</strong><span>Outstanding</span></div></div></div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-receipt"></i> Invoice Records</h5></div>
        <div className="table-controls">
          <div className="search-input-wrap"><i className="bi bi-search"></i><input type="text" placeholder="Search by patient, service…" value={search} onChange={e=>setSearch(e.target.value)} /></div>
          <select className="filter-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="">All Status</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Overdue">Overdue</option>
          </select>
        </div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Service</th><th>Date</th><th>Amount</th><th>Discount</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(b=>(
                <tr key={b.id}>
                  <td><span className="invoice-badge">INV-{String(b.id).padStart(3,'0')}</span></td>
                  <td><div className="td-name"><div className={`td-avatar ${avatarColors[(b.patient_id-1)%5]}`}>{initials(b.patient_name)}</div><div className="td-main"><strong>{b.patient_name}</strong><small>{b.patient_phone}</small></div></div></td>
                  <td>{b.service}</td>
                  <td>{b.date?.split('T')[0]}</td>
                  <td><strong>Rs. {Number(b.amount).toLocaleString()}</strong></td>
                  <td>{b.discount ? `Rs. ${b.discount}` : '—'}</td>
                  <td><strong style={{color:'var(--success)'}}>Rs. {Number(b.paid).toLocaleString()}</strong></td>
                  <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                  <td><div className="action-btns">
                    <button className="btn-icon edit" onClick={()=>{setEditBill({...b,date:b.date?.split('T')[0]});setShowEdit(true);}}><i className="bi bi-pencil"></i></button>
                    <button className="btn-icon del" onClick={()=>setDeleteTarget(b)}><i className="bi bi-trash"></i></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <div className="modal fade show" style={{display:'block',background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
        <div className="modal-header"><div className="modal-title"><i className="bi bi-receipt-cutoff"></i> New Invoice</div><button className="btn-close" onClick={()=>setShowAdd(false)}></button></div>
        <div className="modal-body">{renderForm(form,setForm)}</div>
        <div className="modal-footer"><button className="btn-outline-mc" onClick={()=>setShowAdd(false)}>Cancel</button><button className="btn-primary-mc" onClick={handleAdd}><i className="bi bi-check"></i> Create</button></div>
      </div></div></div>}

      {showEdit&&editBill && <div className="modal fade show" style={{display:'block',background:'rgba(0,0,0,0.5)'}}><div className="modal-dialog modal-dialog-centered modal-lg"><div className="modal-content">
        <div className="modal-header"><div className="modal-title"><i className="bi bi-pencil"></i> Edit Invoice</div><button className="btn-close" onClick={()=>setShowEdit(false)}></button></div>
        <div className="modal-body">{renderForm(editBill,setEditBill)}</div>
        <div className="modal-footer"><button className="btn-outline-mc" onClick={()=>setShowEdit(false)}>Cancel</button><button className="btn-primary-mc" onClick={handleEdit}><i className="bi bi-check"></i> Update</button></div>
      </div></div></div>}

      <DeleteModal show={!!deleteTarget} label={`INV-${String(deleteTarget?.id).padStart(3,'0')}`} onConfirm={handleDelete} onCancel={()=>setDeleteTarget(null)} />
    </>
  );
}
