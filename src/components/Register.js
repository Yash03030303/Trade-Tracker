// src/components/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    displayName: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.displayName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill all fields'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await registerUser(formData.email, formData.password, formData.displayName);
      navigate('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use': setError('Email is already registered'); break;
        case 'auth/invalid-email':        setError('Invalid email address'); break;
        case 'auth/weak-password':        setError('Password is too weak'); break;
        default: setError('Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'displayName',     type: 'text',     label: 'Full Name',        placeholder: 'Your name' },
    { name: 'email',           type: 'email',    label: 'Email Address',    placeholder: 'your@email.com' },
    { name: 'password',        type: 'password', label: 'Password',         placeholder: 'At least 6 characters' },
    { name: 'confirmPassword', type: 'password', label: 'Confirm Password', placeholder: 'Re-enter password' },
  ];

  return (
    <div style={authPageStyle}>
      <div style={blobStyle1} />
      <div style={blobStyle2} />

      <div style={authContainerStyle}>
        {/* Logo */}
        <div style={logoWrapStyle}>
          <div style={logoIconStyle}>📈</div>
          <div>
            <h1 style={logoTitleStyle}>Trading Tracker</h1>
            <p style={logoSubStyle}>Create your free account</p>
          </div>
        </div>

        {/* Card */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Get Started</h2>
            <p style={cardSubStyle}>Track your trades professionally</p>
          </div>

          {error && (
            <div style={errorBoxStyle}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(({ name, type, label, placeholder }) => (
              <div key={name} style={fieldGroupStyle}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(99,102,241,0.5)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(99,102,241,0.35)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={spinnerStyle} /> Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div style={dividerStyle}>
            <span>Already have an account?</span>
            <Link to="/login" style={linkStyle}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const authPageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0a0e1a 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '40px 16px', position: 'relative', overflow: 'hidden',
};

const blobStyle1 = {
  position: 'absolute', top: '-20%', right: '-10%',
  width: '500px', height: '500px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const blobStyle2 = {
  position: 'absolute', bottom: '-20%', left: '-10%',
  width: '400px', height: '400px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const authContainerStyle = { width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 };

const logoWrapStyle = { display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center', marginBottom: '28px' };

const logoIconStyle = {
  width: '52px', height: '52px', borderRadius: '16px',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.6rem', boxShadow: '0 0 25px rgba(99,102,241,0.4)', flexShrink: 0,
};

const logoTitleStyle = { margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' };
const logoSubStyle = { margin: 0, fontSize: '0.78rem', color: '#64748b', fontFamily: 'Inter, sans-serif' };

const cardStyle = {
  background: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '20px', padding: '32px 28px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
};

const cardHeaderStyle = { marginBottom: '24px', textAlign: 'center' };
const cardTitleStyle = { fontSize: '1.4rem', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' };
const cardSubStyle = { color: '#64748b', fontSize: '0.85rem', margin: 0, fontFamily: 'Inter, sans-serif' };

const errorBoxStyle = {
  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '10px', color: '#fca5a5', padding: '10px 14px',
  fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
  fontFamily: 'Inter, sans-serif',
};

const fieldGroupStyle = { marginBottom: '14px' };

const labelStyle = {
  display: 'block', fontWeight: '600', fontSize: '0.78rem', color: '#94a3b8',
  marginBottom: '7px', fontFamily: 'Inter, sans-serif',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'rgba(26,34,54,0.8)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#f1f5f9', fontSize: '0.88rem',
  fontFamily: 'Inter, sans-serif', outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const submitBtnStyle = {
  width: '100%', padding: '13px', marginTop: '8px',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  border: 'none', borderRadius: '12px', color: 'white',
  fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 15px rgba(99,102,241,0.35)', letterSpacing: '0.3px',
};

const spinnerStyle = {
  display: 'inline-block', width: '16px', height: '16px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: 'white', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const dividerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '8px', marginTop: '20px', color: '#64748b',
  fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
};

const linkStyle = { color: '#6366f1', fontWeight: '700', textDecoration: 'none' };

export default Register;