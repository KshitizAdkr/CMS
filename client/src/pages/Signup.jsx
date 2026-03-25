import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import api from '../services/api';

export default function Signup() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', phone: '', city: '', blood_group: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      showToast('error', 'Error', 'Please fill in name, email and password.');
      return;
    }
    if (form.password.length < 6) {
      showToast('error', 'Error', 'Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('error', 'Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age ? parseInt(form.age) : null,
        gender: form.gender || null,
        phone: form.phone,
        city: form.city,
        blood_group: form.blood_group,
        address: form.address,
      });

      // Auto-login after signup
      const { token, user } = res.data;
      localStorage.setItem('medicare_token', token);
      localStorage.setItem('medicare_user', JSON.stringify(user));

      showToast('success', 'Account Created!', 'Welcome to MediCare! Redirecting...');
      setTimeout(() => {
        window.location.href = '/patient/profile';
      }, 800);
    } catch (err) {
      showToast('error', 'Signup Failed', err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
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
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '12px', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Patient Benefits</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['View your medical history', 'Track appointments', 'Access prescriptions', 'View billing records', 'Manage your profile'].map(f => (
                <div key={f} style={{ color: 'rgba(255,255,255,.75)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="bi bi-check-circle-fill" style={{ color: '#10B981' }}></i> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="login-form-side" style={{ overflowY: 'auto' }}>
        <div className="login-form" style={{ maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-person-plus" style={{ color: '#fff', fontSize: '20px' }}></i>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Create Account</h2>
              <p style={{ margin: 0, color: 'var(--gray-400)', fontSize: '13px' }}>Register as a new patient</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
            {/* Basic Info */}
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label" htmlFor="signupName">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" id="signupName" className="form-control" placeholder="Enter your full name" value={form.name} onChange={update('name')} />
                  <i className="bi bi-person" style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}></i>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="signupEmail">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" id="signupEmail" className="form-control" placeholder="you@example.com" value={form.email} onChange={update('email')} />
                  <i className="bi bi-envelope" style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }}></i>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="signupPassword">Password *</label>
                <input type="password" id="signupPassword" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={update('password')} />
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="signupConfirmPw">Confirm Password *</label>
                <input type="password" id="signupConfirmPw" className="form-control" placeholder="Retype password" value={form.confirmPassword} onChange={update('confirmPassword')} />
              </div>
            </div>

            {/* Additional Info */}
            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', color: 'var(--gray-600)', marginBottom: '10px', marginTop: '8px' }}>Additional Information (Optional)</p>
            <div className="row g-3 mb-3">
              <div className="col-4">
                <label className="form-label" htmlFor="signupAge">Age</label>
                <input type="number" id="signupAge" className="form-control" placeholder="25" value={form.age} onChange={update('age')} />
              </div>
              <div className="col-4">
                <label className="form-label" htmlFor="signupGender">Gender</label>
                <select id="signupGender" className="form-select" value={form.gender} onChange={update('gender')}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-4">
                <label className="form-label" htmlFor="signupBlood">Blood Group</label>
                <select id="signupBlood" className="form-select" value={form.blood_group} onChange={update('blood_group')}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="signupPhone">Phone</label>
                <input type="tel" id="signupPhone" className="form-control" placeholder="98XXXXXXXX" value={form.phone} onChange={update('phone')} />
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="signupCity">City</label>
                <input type="text" id="signupCity" className="form-control" placeholder="Kathmandu" value={form.city} onChange={update('city')} />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Creating account…</>
              ) : (
                <><i className="bi bi-person-plus"></i> Create Account</>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--gray-600)', marginTop: '20px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
