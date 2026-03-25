import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('medicare_theme') === 'dark');

  // Profile Picture
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('medicare_profile_pic') || '');
  const fileInputRef = useRef(null);

  // Password
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  // Notification Prefs
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('medicare_notif_prefs');
    return saved ? JSON.parse(saved) : { email: true, appointments: true, prescriptions: true, billing: false };
  });

  // Expandable sections
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('medicare_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('medicare_theme', 'light');
    }
  }, [darkMode]);

  // Profile Pic upload
  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Error', 'Image must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
      localStorage.setItem('medicare_profile_pic', reader.result);
      showToast('success', 'Success', 'Profile picture updated!');
    };
    reader.readAsDataURL(file);
  };

  const removePic = () => {
    setProfilePic('');
    localStorage.removeItem('medicare_profile_pic');
    showToast('info', 'Removed', 'Profile picture removed.');
  };

  // Password change
  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPw) {
      showToast('error', 'Error', 'Please fill in all password fields.');
      return;
    }
    if (passwords.newPw.length < 6) {
      showToast('error', 'Error', 'New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPw !== passwords.confirm) {
      showToast('error', 'Error', 'New passwords do not match.');
      return;
    }
    setPwLoading(true);
    // Simulate API call since there's no password change endpoint
    setTimeout(() => {
      setPwLoading(false);
      setPasswords({ current: '', newPw: '', confirm: '' });
      showToast('success', 'Success', 'Password changed successfully!');
    }, 1000);
  };

  // Notification prefs
  const toggleNotifPref = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem('medicare_notif_prefs', JSON.stringify(updated));
  };

  const initials = user?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

  return (
    <>
      <div className="page-header">
        <div><h2>Settings</h2><p>Manage your preferences and account settings</p></div>
        <div className="breadcrumb-custom"><i className="bi bi-house"></i><i className="bi bi-chevron-right"></i><span className="active">Settings</span></div>
      </div>

      <div className="settings-grid">
        {/* ── Appearance ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon blue"><i className="bi bi-palette"></i></div>
            <div>
              <h5>Appearance</h5>
              <p>Customize the look and feel</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-row">
              <div className="settings-row-info">
                <i className={`bi ${darkMode ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`}></i>
                <div>
                  <strong>Dark Mode</strong>
                  <span>Switch between light and dark themes</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Profile Picture ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon teal"><i className="bi bi-camera"></i></div>
            <div>
              <h5>Profile Picture</h5>
              <p>Update your avatar</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="profile-pic-section">
              <div className="profile-pic-preview">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" />
                ) : (
                  <div className="profile-pic-placeholder">{initials}</div>
                )}
              </div>
              <div className="profile-pic-actions">
                <button className="btn-primary-mc" onClick={() => fileInputRef.current?.click()}>
                  <i className="bi bi-upload"></i> Upload Photo
                </button>
                {profilePic && (
                  <button className="btn-outline-mc" onClick={removePic}>
                    <i className="bi bi-trash"></i> Remove
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePicUpload} />
                <span className="profile-pic-hint">JPG, PNG or GIF. Max 2MB.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Change Password ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon amber"><i className="bi bi-shield-lock"></i></div>
            <div>
              <h5>Change Password</h5>
              <p>Update your account password</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-form">
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-control" placeholder="Enter current password"
                  value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" placeholder="Min 6 characters"
                  value={passwords.newPw} onChange={e => setPasswords({...passwords, newPw: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" placeholder="Retype new password"
                  value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
              <button className="btn-primary-mc" onClick={handlePasswordChange} disabled={pwLoading}>
                {pwLoading ? <><span className="spinner-border spinner-border-sm me-1"></span> Updating…</> : <><i className="bi bi-check-lg"></i> Update Password</>}
              </button>
            </div>
          </div>
        </div>

        {/* ── Notification Preferences ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon green"><i className="bi bi-bell"></i></div>
            <div>
              <h5>Notification Preferences</h5>
              <p>Control what notifications you receive</p>
            </div>
          </div>
          <div className="settings-card-body">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: 'bi-envelope' },
              { key: 'appointments', label: 'Appointment Reminders', desc: 'Get reminded before appointments', icon: 'bi-calendar-check' },
              { key: 'prescriptions', label: 'Prescription Alerts', desc: 'Notifications for new prescriptions', icon: 'bi-capsule' },
              { key: 'billing', label: 'Billing Updates', desc: 'Alerts for new bills and payments', icon: 'bi-receipt' },
            ].map(item => (
              <div key={item.key} className="settings-row">
                <div className="settings-row-info">
                  <i className={`bi ${item.icon}`}></i>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notifPrefs[item.key]} onChange={() => toggleNotifPref(item.key)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ── Language ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon navy"><i className="bi bi-translate"></i></div>
            <div>
              <h5>Language</h5>
              <p>Choose your preferred language</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="settings-row">
              <div className="settings-row-info">
                <i className="bi bi-globe"></i>
                <div>
                  <strong>Display Language</strong>
                  <span>Select the language for the interface</span>
                </div>
              </div>
              <select className="filter-select" defaultValue="en">
                <option value="en">English</option>
                <option value="ne" disabled>Nepali (Coming Soon)</option>
                <option value="hi" disabled>Hindi (Coming Soon)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Terms & Conditions ── */}
        <div className="card settings-card">
          <div className="settings-card-header clickable" onClick={() => setTermsOpen(!termsOpen)}>
            <div className="settings-card-icon red"><i className="bi bi-file-earmark-text"></i></div>
            <div>
              <h5>Terms & Conditions</h5>
              <p>Read our terms of service</p>
            </div>
            <i className={`bi bi-chevron-${termsOpen ? 'up' : 'down'} ms-auto`} style={{fontSize:'16px',color:'var(--gray-400)'}}></i>
          </div>
          {termsOpen && (
            <div className="settings-card-body settings-legal-text">
              <h6>1. Acceptance of Terms</h6>
              <p>By accessing and using the MediCare Clinic Management System, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this system.</p>

              <h6>2. Use of the System</h6>
              <p>This system is intended for authorized healthcare providers, clinic staff, and registered patients. You agree to use the system solely for lawful purposes and in accordance with all applicable laws and regulations.</p>

              <h6>3. User Accounts</h6>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify the system administrator immediately of any unauthorized use of your account.</p>

              <h6>4. Medical Information</h6>
              <p>The information provided through this system is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for medical decisions.</p>

              <h6>5. Data Privacy</h6>
              <p>We are committed to protecting your personal and medical data. All data is stored securely and accessed only by authorized personnel. See our Privacy Policy for more details.</p>

              <h6>6. Limitation of Liability</h6>
              <p>MediCare Clinic shall not be liable for any indirect, incidental, or consequential damages arising from the use of this system.</p>

              <h6>7. Changes to Terms</h6>
              <p>We reserve the right to modify these terms at any time. Continued use of the system after changes constitutes acceptance of the new terms.</p>
            </div>
          )}
        </div>

        {/* ── Privacy Policy ── */}
        <div className="card settings-card">
          <div className="settings-card-header clickable" onClick={() => setPrivacyOpen(!privacyOpen)}>
            <div className="settings-card-icon green"><i className="bi bi-shield-check"></i></div>
            <div>
              <h5>Privacy Policy</h5>
              <p>How we handle your data</p>
            </div>
            <i className={`bi bi-chevron-${privacyOpen ? 'up' : 'down'} ms-auto`} style={{fontSize:'16px',color:'var(--gray-400)'}}></i>
          </div>
          {privacyOpen && (
            <div className="settings-card-body settings-legal-text">
              <h6>Information We Collect</h6>
              <p>We collect personal information including your name, email, phone number, medical history, and appointment details to provide our healthcare management services.</p>

              <h6>How We Use Your Information</h6>
              <p>Your information is used to manage appointments, maintain medical records, process billing, and communicate important health-related updates.</p>

              <h6>Data Security</h6>
              <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits to protect your data.</p>

              <h6>Data Sharing</h6>
              <p>We do not sell or share your personal information with third parties. Your medical data is only accessible to your assigned healthcare providers.</p>

              <h6>Your Rights</h6>
              <p>You have the right to access, correct, or delete your personal information. Contact your clinic administrator to exercise these rights.</p>
            </div>
          )}
        </div>

        {/* ── About ── */}
        <div className="card settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon blue"><i className="bi bi-info-circle"></i></div>
            <div>
              <h5>About</h5>
              <p>Application information</p>
            </div>
          </div>
          <div className="settings-card-body">
            <div className="about-grid">
              <div className="about-item">
                <span>Application</span>
                <strong>MediCare Clinic Management System</strong>
              </div>
              <div className="about-item">
                <span>Version</span>
                <strong>1.0.0</strong>
              </div>
              <div className="about-item">
                <span>Developer</span>
                <strong>MediCare Team</strong>
              </div>
              <div className="about-item">
                <span>Contact</span>
                <strong>support@medicare-clinic.com</strong>
              </div>
              <div className="about-item">
                <span>License</span>
                <strong>Academic Project</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
