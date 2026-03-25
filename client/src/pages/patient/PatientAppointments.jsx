import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../components/Toast';

export default function PatientAppointments() {
  const { showToast } = useToast();
  const [appts, setAppts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    specialization: '',
    doctor_id: '',
    date: '',
    time: '',
    reason: ''
  });

  const fetchData = async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/doctors')
      ]);
      setAppts(Array.isArray(apptsRes.data) ? apptsRes.data : []);
      // Doctors use PascalCase from DB (Name, Specialization, DoctorId)
      setDoctors(Array.isArray(docsRes.data) ? docsRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Safe checks for mapping specializations
  const specializations = [...new Set(doctors.map(d => d.Specialization || d.specialization).filter(Boolean))];
  const filteredDoctors = doctors.filter(d => (d.Specialization || d.specialization) === formData.specialization);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!formData.doctor_id || !formData.date || !formData.time || !formData.reason) {
      showToast('error', 'Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/appointments', {
        doctor_id: parseInt(formData.doctor_id),
        date: formData.date,
        time: formData.time,
        reason: formData.reason
      });
      showToast('success', 'Success', 'Appointment booked successfully!');
      setShowModal(false);
      setFormData({ specialization: '', doctor_id: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (err) {
      showToast('error', 'Error', err.response?.data?.error || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const initials = (name) => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const avatarColors = ['bg-1', 'bg-2', 'bg-3', 'bg-4', 'bg-5'];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>My Appointments</h2>
          <p>View and schedule your visits at MediCare Clinic</p>
        </div>
        <div className="breadcrumb-custom">
          <i className="bi bi-house"></i>
          <i className="bi bi-chevron-right"></i>
          <span className="active">Appointments</span>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-3">
          <div className="stat-card">
            <div className="stat-icon teal"><i className="bi bi-calendar2-week-fill"></i></div>
            <div className="stat-info"><strong>{appts.length}</strong><span>Total</span></div>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="stat-card">
            <div className="stat-icon blue"><i className="bi bi-clock-fill"></i></div>
            <div className="stat-info"><strong>{appts.filter(a => (a.status || a.Status) === 'Scheduled').length}</strong><span>Upcoming</span></div>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="stat-card">
            <div className="stat-icon green"><i className="bi bi-check-circle-fill"></i></div>
            <div className="stat-info"><strong>{appts.filter(a => (a.status || a.Status) === 'Completed').length}</strong><span>Completed</span></div>
          </div>
        </div>
        <div className="col-sm-3">
          <button className="btn-primary-mc w-100 h-100" style={{ fontSize: '16px', minHeight: '80px' }} onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-lg me-2"></i> Book Appointment
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header-custom"><h5><i className="bi bi-calendar-check"></i> Appointment History</h5></div>
        <div className="card-body-custom table-wrapper">
          <table className="mc-table">
            <thead>
              <tr><th>#</th><th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr>
            </thead>
            <tbody>
              {appts.length === 0 ? (
                <tr><td colSpan="6" className="text-center" style={{ padding: '30px', color: 'var(--gray-400)' }}>No appointments found.</td></tr>
              ) : appts.map(a => (
                <tr key={a.id || a.AppointmentId}>
                  <td><span className="invoice-badge">#{String(a.id || a.AppointmentId).padStart(3, '0')}</span></td>
                  <td>
                    <div className="td-name">
                      <div className={`td-avatar ${avatarColors[( (a.doctor_id || a.DoctorId) - 1) % 5] || 'bg-1'}`}>{initials(a.doctor_name || a.DoctorName)}</div>
                      <div className="td-main"><strong>{a.doctor_name || a.DoctorName}</strong><small>{a.specialization || a.Specialization}</small></div>
                    </div>
                  </td>
                  <td>{ (a.date || a.AppDate || '').split('T')[0] }</td>
                  <td>{a.time || a.AppTime}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.reason || a.Reason}</td>
                  <td><span className={`status-badge status-${(a.status || a.Status || '').toLowerCase()}`}>{a.status || a.Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Booking Modal */}
      {showModal && (
        <div className="premium-modal-overlay">
          <div className="premium-modal-content">
            <div className="premium-modal-header">
              <div>
                <h5>Book Appointment</h5>
                <p>Schedule a visit with our specialists</p>
              </div>
              <button className="premium-modal-close" onClick={() => setShowModal(false)}><i className="bi bi-x"></i></button>
            </div>

            <form onSubmit={handleBook}>
              <div className="premium-modal-body">
                
                {/* Section 1: Doctor */}
                <div className="booking-section">
                  <div className="section-title"><i className="bi bi-person-badge"></i> 1. Choose Specialist</div>
                  <div className="row gx-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Specialization</label>
                      <div className="input-icon-wrapper">
                        <i className="bi bi-diagram-3 input-icon"></i>
                        <select
                          className="form-select with-icon"
                          required
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value, doctor_id: '' })}
                        >
                          <option value="">Select Specialization</option>
                          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Doctor</label>
                      <div className="input-icon-wrapper">
                        <i className="bi bi-person input-icon"></i>
                        <select
                          className="form-select with-icon"
                          required
                          disabled={!formData.specialization}
                          value={formData.doctor_id}
                          onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                        >
                          <option value="">{formData.specialization ? 'Select Doctor' : 'Choose specialization first'}</option>
                          {filteredDoctors.map(d => <option key={d.DoctorId || d.id} value={d.DoctorId || d.id}>{d.Name || d.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Date & Time */}
                <div className="booking-section">
                  <div className="section-title"><i className="bi bi-calendar3"></i> 2. Schedule</div>
                  <div className="row gx-3">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date</label>
                      <div className="input-icon-wrapper">
                        <i className="bi bi-calendar-event input-icon"></i>
                        <input
                          type="date"
                          className="form-control with-icon"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Time</label>
                      <div className="input-icon-wrapper">
                        <i className="bi bi-clock input-icon"></i>
                        <input
                          type="time"
                          className="form-control with-icon"
                          required
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Problem */}
                <div className="booking-section border-0 pb-0">
                  <div className="section-title"><i className="bi bi-heart-pulse"></i> 3. Health Issue</div>
                  <div className="mb-2">
                    <label className="form-label">What problem are you facing?</label>
                    <textarea
                      className="form-control"
                      placeholder="Briefly describe your symptoms or reason for visit..."
                      required
                      rows="3"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      style={{ resize: 'none' }}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="premium-modal-footer">
                <button type="button" className="btn-outline-mc" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary-mc booking-btn" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Confirming...</> : <><i className="bi bi-check2-circle me-1"></i> Confirm Booking</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
