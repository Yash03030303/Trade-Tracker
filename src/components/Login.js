// src/components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await loginUser(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':   setError('No user found with this email'); break;
        case 'auth/wrong-password':   setError('Incorrect password'); break;
        case 'auth/invalid-email':    setError('Invalid email address'); break;
        case 'auth/invalid-credential': setError('Invalid email or password'); break;
        default: setError('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authPageStyle}>
      {/* Animated background blobs */}
      <div style={blobStyle1} />
      <div style={blobStyle2} />

      <div style={authContainerStyle}>
        {/* Logo */}
        <div style={logoWrapStyle}>
          <div style={logoIconStyle}>📈</div>
          <div>
            <h1 style={logoTitleStyle}>Trading Tracker</h1>
            <p style={logoSubStyle}>Professional trade management</p>
          </div>
        </div>

        {/* Card */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h2 style={cardTitleStyle}>Welcome back</h2>
            <p style={cardSubStyle}>Sign in to your account</p>
          </div>

          {error && (
            <div style={errorBoxStyle}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  onFocus={e => { e.target.style.borderColor = '#8EB69B'; e.target.style.boxShadow = '0 0 0 3px rgba(142,182,155,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(142,182,155,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeBtnStyle}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(99,102,241,0.5)'; }}}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(99,102,241,0.35)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span style={spinnerStyle} /> Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={dividerStyle}>
            <span>Don't have an account?</span>
            <Link to="/register" style={linkStyle}>Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Styles ─── */
const authPageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #051F20 0%, #0B2B26 50%, #051F20 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 16px',
  position: 'relative',
  overflow: 'hidden',
};

const blobStyle1 = {
  position: 'absolute', top: '-20%', right: '-10%',
  width: '500px', height: '500px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(142,182,155,0.15) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const blobStyle2 = {
  position: 'absolute', bottom: '-20%', left: '-10%',
  width: '400px', height: '400px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(35,83,71,0.25) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const authContainerStyle = {
  width: '100%',
  maxWidth: '420px',
  position: 'relative',
  zIndex: 1,
};

const logoWrapStyle = {
  display: 'flex', alignItems: 'center', gap: '14px',
  justifyContent: 'center', marginBottom: '32px',
};

const logoIconStyle = {
  width: '52px', height: '52px', borderRadius: '16px',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.6rem',
  boxShadow: '0 0 25px rgba(99,102,241,0.4)',
  flexShrink: 0,
};

const logoTitleStyle = {
  margin: 0, fontSize: '1.3rem', fontWeight: '800',
  color: '#f1f5f9', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px',
};

const logoSubStyle = {
  margin: 0, fontSize: '0.78rem', color: '#64748b',
  fontFamily: 'Inter, sans-serif',
};

const cardStyle = {
  background: 'rgba(11, 43, 38, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(142, 182, 155, 0.15)',
  borderRadius: '20px',
  padding: '36px 32px',
  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
};

const cardHeaderStyle = { marginBottom: '28px', textAlign: 'center' };

const cardTitleStyle = {
  fontSize: '1.5rem', fontWeight: '800', color: '#f1f5f9',
  margin: '0 0 6px', fontFamily: 'Inter, sans-serif',
};

const cardSubStyle = { color: '#64748b', fontSize: '0.88rem', margin: 0, fontFamily: 'Inter, sans-serif' };

const errorBoxStyle = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  borderRadius: '10px',
  color: '#fca5a5',
  padding: '10px 14px',
  fontSize: '0.85rem',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'Inter, sans-serif',
};

const fieldGroupStyle = { marginBottom: '18px' };

const labelStyle = {
  display: 'block', fontWeight: '600', fontSize: '0.8rem',
  color: '#94a3b8', marginBottom: '8px', fontFamily: 'Inter, sans-serif',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(5, 31, 32, 0.8)',
  border: '1px solid rgba(142, 182, 155, 0.2)',
  borderRadius: '10px', color: '#DAF1DE',
  fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
};

const eyeBtnStyle = {
  position: 'absolute', right: '12px', top: '50%',
  transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '1rem', padding: '4px',
};

const submitBtnStyle = {
  width: '100%', padding: '13px',
  background: 'linear-gradient(135deg, #235347, #8EB69B)',
  border: 'none', borderRadius: '12px',
  color: '#DAF1DE', fontSize: '0.95rem',
  fontWeight: '700', cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  transition: 'transform 0.2s, box-shadow 0.2s',
  boxShadow: '0 4px 15px rgba(142, 182, 155, 0.3)',
  letterSpacing: '0.3px',
  marginTop: '8px',
};

const spinnerStyle = {
  display: 'inline-block', width: '16px', height: '16px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: 'white', borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

const dividerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: '8px', marginTop: '24px',
  color: '#64748b', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
};

const linkStyle = {
  color: '#8EB69B', fontWeight: '700', textDecoration: 'none',
  transition: 'color 0.2s',
};

export default Login;