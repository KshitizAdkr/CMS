import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Reports() {
  const [workload, setWorkload] = useState([]);
  const [cityDist, setCityDist] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/reports/doctor-workload'),
      api.get('/reports/city-distribution'),
      api.get('/reports/billing-summary'),
      api.get('/dashboard/stats'),
      api.get('/patients'),
    ]).then(([w, c, b, s, p]) => {
      setWorkload(w.data); setCityDist(c.data); setBillingSummary(b.data); setStats(s.data); setPatients(p.data);
    }).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

  const initials = (name) => name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  const avatarColors = ['bg-1','bg-2','bg-3','bg-4','bg-5'];
  const totalP = patients.length || 1;

  // Blood group distribution
  const bloodGroups = {};
  patients.forEach(p => { bloodGroups[p.blood_group] = (bloodGroups[p.blood_group]||0)+1; });

  // Age group distribution
  const ageGroups = [
    {label:'0-20',min:0,max:20},{label:'21-30',min:21,max:30},{label:'31-40',min:31,max:40},
    {label:'41-50',min:41,max:50},{label:'51-60',min:51,max:60},{label:'61+',min:61,max:200}
  ];
  const ageCounts = ageGroups.map(g => patients.filter(p=>p.age>=g.min&&p.age<=g.max).length);
  const maxAge = Math.max(...ageCounts,1);
  const ageColors = ['#2196F3','#00B4A6','#10B981','#F59E0B','#EF4444','#8B5CF6'];

  return (
    <>
      <div className="page-header">
        <div><h2>Reports & Analytics</h2><p>Clinic performance summaries and statistical insights</p></div>
        <div className="breadcrumb-custom"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Reports</span></div>
      </div>

      {/* Overview */}
      <div className="row g-3 mb-4">
        {[{icon:'bi-people-fill',bg:'rgba(33,150,243,.1)',color:'var(--accent)',val:stats.totalPatients,label:'Registered Patients'},
          {icon:'bi-person-badge-fill',bg:'rgba(10,35,66,.08)',color:'var(--navy)',val:stats.totalDoctors,label:'Active Doctors'},
          {icon:'bi-calendar2-check-fill',bg:'rgba(0,180,166,.1)',color:'var(--accent-teal)',val:stats.totalAppts,label:'Total Appointments'},
          {icon:'bi-currency-rupee',bg:'rgba(16,185,129,.1)',color:'var(--success)',val:Number(stats.totalRevenue).toLocaleString(),label:'Revenue Collected'}
        ].map((s,i)=>(
          <div className="col-sm-6 col-lg-3" key={i}>
            <div className="report-summary-card">
              <div style={{width:'48px',height:'48px',background:s.bg,borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                <i className={`bi ${s.icon}`} style={{color:s.color,fontSize:'22px'}}></i>
              </div>
              <h3>{s.val}</h3><p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Appointment Status Breakdown */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header-custom"><h5><i className="bi bi-pie-chart"></i> Appointment Status Breakdown</h5></div>
            <div className="p-4">
              {[{label:'Completed',count:stats.completed,color:'var(--success)'},{label:'Scheduled',count:stats.scheduled,color:'var(--accent)'},{label:'Cancelled',count:stats.cancelled,color:'var(--danger)'}].map((s,i)=>{
                const pct = stats.totalAppts ? Math.round((s.count/stats.totalAppts)*100) : 0;
                return <div className="prog-wrap" key={i}><div className="prog-label"><span><span style={{display:'inline-block',width:'10px',height:'10px',background:s.color,borderRadius:'3px',marginRight:'6px'}}></span>{s.label}</span><strong>{s.count}</strong></div><div className="report-bar"><div className="report-bar-fill" style={{width:`${pct}%`,background:s.color}}></div></div></div>;
              })}
              <div style={{marginTop:'24px',paddingTop:'20px',borderTop:'1px solid var(--gray-100)'}}>
                <p style={{fontWeight:700,color:'var(--navy)',marginBottom:'12px',fontSize:'13px'}}>Blood Group Distribution</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {Object.entries(bloodGroups).map(([g,c])=>(
                    <div key={g} style={{textAlign:'center'}}><span className="blood-tag" style={{display:'block',marginBottom:'4px',minWidth:'44px'}}>{g}</span><span style={{fontSize:'11px',color:'var(--gray-400)'}}>{c} pt</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Workload */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header-custom"><h5><i className="bi bi-person-lines-fill"></i> Doctor Workload Report</h5></div>
            <div className="table-wrapper">
              <table className="mc-table">
                <thead><tr><th>Doctor</th><th>Total</th><th>Done</th><th>Pending</th><th>Progress</th></tr></thead>
                <tbody>
                  {workload.map(d=>{
                    const pct = d.total ? Math.round((d.done/d.total)*100) : 0;
                    return <tr key={d.id}>
                      <td><div className="td-name"><div className={`td-avatar ${avatarColors[(d.id-1)%5]}`}>{initials(d.name)}</div><div className="td-main"><strong>{d.name}</strong><small>{d.specialization}</small></div></div></td>
                      <td><strong>{d.total}</strong></td><td>{d.done}</td><td>{d.pending}</td>
                      <td><div className="report-bar"><div className="report-bar-fill" style={{width:`${pct}%`,background:'var(--success)'}}></div></div></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* City-wise */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header-custom"><h5><i className="bi bi-geo-alt"></i> City-wise Patient Distribution</h5></div>
            <div className="table-wrapper">
              <table className="mc-table">
                <thead><tr><th>City</th><th>Patients</th><th>%</th><th>Distribution</th></tr></thead>
                <tbody>
                  {cityDist.map(c=>{
                    const pct = Math.round((c.count/totalP)*100);
                    return <tr key={c.city}><td><strong>{c.city}</strong></td><td>{c.count}</td><td>{pct}%</td><td><div className="report-bar" style={{maxWidth:'200px'}}><div className="report-bar-fill" style={{width:`${pct}%`,background:'var(--accent)'}}></div></div></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header-custom"><h5><i className="bi bi-cash-stack"></i> Billing Summary</h5></div>
            <div className="p-4">
              {billingSummary && <>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'20px'}}>
                  <div style={{textAlign:'center',padding:'16px',background:'var(--gray-50)',borderRadius:'10px'}}><div style={{fontSize:'1.3rem',fontWeight:700,color:'var(--navy)'}}>Rs. {Number(billingSummary.total_invoiced||0).toLocaleString()}</div><div style={{fontSize:'11px',color:'var(--gray-400)',marginTop:'3px'}}>Total Invoiced</div></div>
                  <div style={{textAlign:'center',padding:'16px',background:'rgba(16,185,129,.06)',borderRadius:'10px'}}><div style={{fontSize:'1.3rem',fontWeight:700,color:'var(--success)'}}>Rs. {Number(billingSummary.total_collected||0).toLocaleString()}</div><div style={{fontSize:'11px',color:'var(--gray-400)',marginTop:'3px'}}>Collected</div></div>
                  <div style={{textAlign:'center',padding:'16px',background:'rgba(245,158,11,.06)',borderRadius:'10px'}}><div style={{fontSize:'1.3rem',fontWeight:700,color:'var(--warning)'}}>Rs. {Math.max(0,Number(billingSummary.total_pending||0)).toLocaleString()}</div><div style={{fontSize:'11px',color:'var(--gray-400)',marginTop:'3px'}}>Pending</div></div>
                </div>
                {[{label:'Paid Invoices',count:billingSummary.paid_count,total:billingSummary.total_invoices,color:'var(--success)'},
                  {label:'Pending Invoices',count:billingSummary.pending_count,total:billingSummary.total_invoices,color:'var(--warning)'},
                  {label:'Overdue Invoices',count:billingSummary.overdue_count,total:billingSummary.total_invoices,color:'var(--danger)'}
                ].map((s,i)=>{
                  const pct = s.total ? Math.round((s.count/s.total)*100) : 0;
                  return <div className="prog-wrap" key={i}><div className="prog-label"><span>{s.label}</span><strong>{s.count} / {s.total} ({pct}%)</strong></div><div className="report-bar"><div className="report-bar-fill" style={{width:`${pct}%`,background:s.color}}></div></div></div>;
                })}
              </>}
            </div>
          </div>
        </div>
      </div>

      {/* Age Distribution */}
      <div className="card mb-4">
        <div className="card-header-custom"><h5><i className="bi bi-bar-chart"></i> Patient Age Group Distribution</h5></div>
        <div className="p-4">
          <div style={{display:'flex',gap:'16px',alignItems:'flex-end',height:'160px',paddingBottom:'8px'}}>
            {ageCounts.map((c,i)=>(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',gap:'4px'}}>
                <span style={{fontSize:'12px',fontWeight:700,color:'var(--navy)'}}>{c}</span>
                <div style={{width:'100%',background:ageColors[i],borderRadius:'6px 6px 0 0',height:`${Math.max(4,(c/maxAge)*120)}px`,transition:'height .8s ease'}}></div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'16px',marginTop:'8px'}}>
            {ageGroups.map((g,i)=><div key={i} style={{flex:1,textAlign:'center',fontSize:'11px',color:'var(--gray-400)'}}>{g.label}</div>)}
          </div>
        </div>
      </div>
    </>
  );
}
