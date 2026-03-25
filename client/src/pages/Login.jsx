import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function Login() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@medicare.com');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const creds = {
    admin:   { user: 'admin@medicare.com',      pass: 'admin123' },
    doctor:  { user: 'ramesh@medicareclinic.com', pass: 'doc123' },
    patient: { user: 'ram@patient.com',          pass: 'patient123' },
  };

  const handleRoleChange = (r) => {
    setRole(r);
    setEmail(creds[r].user);
    setPassword(creds[r].pass);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Error', 'Please fill in all fields.');
      return;
    }
    const result = await login(email, password, role);
    if (result.success) {
      showToast('success', 'Login Successful', 'Redirecting to dashboard...');
      const path = role === 'admin' ? '/admin/dashboard'
                 : role === 'doctor' ? '/doctor/dashboard'
                 : '/patient/dashboard';
      setTimeout(() => navigate(path), 500);
    } else {
      showToast('error', 'Login Failed', result.error);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Left Brand Panel */}
      <div className="login-brand">
        <div className="brand-logo"><i className="bi bi-hospital"></i></div>
        <h1>MediCare<br/>Clinic</h1>
        <p>Comprehensive Clinic Management System — Streamline operations, enhance patient care.</p>

        <div className="login-stats" style={{ position: 'relative', zIndex: 1 }}>
          <div className="login-stat"><strong>7+</strong><span>Patients</span></div>
          <div className="login-stat"><strong>6</strong><span>Doctors</span></div>
          <div className="login-stat"><strong>12</strong><span>Appointments</span></div>
        </div>

        <div style={{ marginTop: '48px', position: 'relative', zIndex: 1, width: '100%', maxWidth: '360px' }}>
          <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '12px', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Features</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Patient Registration & Records', 'Appointment Scheduling', 'Prescription Management', 'Billing & Invoicing', 'Reports & Analytics'].map(f => (
                <div key={f} style={{ color: 'rgba(255,255,255,.75)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#10B981' }}></i> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-side">
        <div className="login-form">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-hospital" style={{ color: '#fff', fontSize: '20px' }}></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Welcome back</h2>
              <p style={{ margin: 0, color: 'var(--gray-400)', fontSize: '13px' }}>Sign in to continue</p>
            </div>
          </div>

          {/* Role Selector */}
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: 'var(--gray-600)', marginBottom: '10px' }}>Select Role</p>
          <div className="role-selector mb-4">
            {[
              { key: 'admin', icon: 'bi-shield-check', label: 'Admin' },
              { key: 'doctor', icon: 'bi-person-heart', label: 'Doctor' },
              { key: 'patient', icon: 'bi-people', label: 'Patient' },
            ].map(r => (
              <div
                key={r.key}
                className={`role-btn ${role === r.key ? 'active' : ''}`}
                onClick={() => handleRoleChange(r.key)}
              >
                <i className={`bi ${r.icon}`}></i>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="mb-3">
              <label className="form-label" htmlFor="loginEmail">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="loginEmail"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <i className="bi bi-envelope" style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}></i>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="loginPassword">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  id="loginPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                  onClick={() => setShowPw(!showPw)}
                >
                  <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</>
              ) : (
                <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray-400)', marginTop: '24px' }}>
              Demo: click a role above to auto-fill credentials
            </p>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--gray-600)', marginTop: '8px' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
