import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PatientBills() {
  const [bills, setBills] = useState([]);
  useEffect(() => { api.get('/bills').then(res => setBills(res.data)).catch(console.error); }, []);

  const initials = (name) => name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  const totalAmount = bills.reduce((s,b)=>s+Number(b.amount),0);
  const totalPaid = bills.reduce((s,b)=>s+Number(b.paid),0);

  return (
    <>
      <div className="page-header">
        <div><h2>My Bills</h2><p>View your billing history and payment status</p></div>
        <div className="breadcrumb-custom"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Bills</span></div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon navy"><i className="bi bi-receipt-cutoff"></i></div><div className="stat-info"><strong style={{fontSize:'1.1rem'}}>Rs. {totalAmount.toLocaleString()}</strong><span>Total Billed</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon green"><i className="bi bi-check-circle-fill"></i></div><div className="stat-info"><strong style={{fontSize:'1.1rem'}}>Rs. {totalPaid.toLocaleString()}</strong><span>Total Paid</span></div></div></div>
        <div className="col-sm-4"><div className="stat-card"><div className="stat-icon orange"><i className="bi bi-exclamation-circle-fill"></i></div><div className="stat-info"><strong style={{fontSize:'1.1rem'}}>Rs. {Math.max(0,totalAmount-totalPaid).toLocaleString()}</strong><span>Outstanding</span></div></div></div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-receipt"></i> Bill History</h5></div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead><tr><th>Invoice</th><th>Service</th><th>Date</th><th>Amount</th><th>Discount</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>
              {bills.map(b=>(
                <tr key={b.id}>
                  <td><span className="invoice-badge">INV-{String(b.id).padStart(3,'0')}</span></td>
                  <td>{b.service}</td>
                  <td>{b.date?.split('T')[0]}</td>
                  <td><strong>Rs. {Number(b.amount).toLocaleString()}</strong></td>
                  <td>{b.discount ? `Rs. ${b.discount}` : '—'}</td>
                  <td><strong style={{color:'var(--success)'}}>Rs. {Number(b.paid).toLocaleString()}</strong></td>
                  <td><span className={`status-badge status-${b.status.toLowerCase()}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
