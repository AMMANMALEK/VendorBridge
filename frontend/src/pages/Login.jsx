import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const DEMO_ACCOUNTS = [
  { role: 'Administrator',       email: 'admin@vendorbridge.com',   password: 'password123',   icon: 'shield_person', color: '#7C3AED', bg: '#EDE9FE' },
  { role: 'Procurement Officer', email: 'officer@vendorbridge.com', password: 'password123', icon: 'badge',         color: '#2563EB', bg: '#DBEAFE' },
  { role: 'Manager / Approver',  email: 'manager@vendorbridge.com', password: 'password123', icon: 'verified_user', color: '#059669', bg: '#D1FAE5' },
  { role: 'Vendor Partner',      email: 'vendor@vendorbridge.com',  password: 'password123',  icon: 'business',      color: '#B45309', bg: '#FEF3C7' },
];

const FEATURES = [
  { icon: 'request_quote',    label: 'Automated RFQ Workflow' },
  { icon: 'compare_arrows',   label: 'Quotation Intelligence' },
  { icon: 'task_alt',         label: 'Multi-Level Approvals' },
  { icon: 'bar_chart_4_bars', label: 'Spend Analytics' },
];

/* ─── tiny reusable input ──────────────────────────────────────────────────── */
function AuthInput({ icon, type = 'text', placeholder, value, onChange, onFocus, onBlur, right }) {
  return (
    <div style={{ position: 'relative' }}>
      <span className="material-symbols-outlined" style={{
        position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
        fontSize: 17, color: '#94A3B8', pointerEvents: 'none', lineHeight: 1,
      }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%', height: 44, paddingLeft: 40, paddingRight: right ? 42 : 14,
          border: '1.5px solid #E2E8F0', borderRadius: 10,
          fontSize: 14, color: '#0F172A', background: '#F8FAFC',
          outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter,sans-serif',
          transition: 'border-color .15s, box-shadow .15s, background .15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#6366F1';
          e.target.style.background  = '#fff';
          e.target.style.boxShadow   = '0 0 0 3px rgba(99,102,241,.12)';
          onFocus && onFocus(e);
        }}
        onBlur={e => {
          e.target.style.borderColor = value ? '#6366F1' : '#E2E8F0';
          e.target.style.background  = '#F8FAFC';
          e.target.style.boxShadow   = 'none';
          onBlur && onBlur(e);
        }}
      />
      {right}
    </div>
  );
}

export default function Login() {
  const { login, user } = useAppState();
  const navigate        = useNavigate();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [error,       setError]       = useState('');
  const [remember,    setRemember]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    await new Promise(r => setTimeout(r, 460));
    const u = login(email.trim(), password);
    setLoading(false);
    if (!u) { setError('Invalid email or password. Please try again.'); return; }
    navigate(u.role === 'vendor' ? '/submit-quotation' : '/dashboard');
  };

  const fill = (acc, i) => { setEmail(acc.email); setPassword(acc.password); setError(''); setActiveIdx(i); };

  /* ── label style ── */
  const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, letterSpacing: '.03em', textTransform: 'uppercase' };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter,sans-serif' }}>

      {/* ══════════════ LEFT BRANDING PANEL ══════════════ */}
      <div className="login-left" style={{
        width: '48%', flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg,#0D0B26 0%,#1B1760 55%,#1E1B4B 100%)',
        display: 'flex', flexDirection: 'column', padding: '36px 40px',
      }}>
        {/* Glow orbs */}
        <div style={{ position:'absolute', top:-100, right:-80, width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.38) 0%,transparent 70%)', filter:'blur(55px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'5%', left:-70, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.28) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
        {/* Subtle dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(99,102,241,.55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize:22, color:'#fff' }}>hub</span>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:16, letterSpacing:'-.3px' }}>VendorBridge</div>
            <div style={{ color:'rgba(255,255,255,.38)', fontSize:10, letterSpacing:'.04em' }}>ENTERPRISE PROCUREMENT</div>
          </div>
        </div>

        {/* Hero — fills remaining space */}
        <div style={{ flex:1, position:'relative', zIndex:2, display:'flex', flexDirection:'column', justifyContent:'center', gap:0 }}>
          {/* Pill */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:100, background:'rgba(99,102,241,.18)', border:'1px solid rgba(99,102,241,.35)', width:'fit-content', marginBottom:20 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#818CF8', display:'inline-block' }} />
            <span style={{ color:'#A5B4FC', fontSize:12, fontWeight:600 }}>Live — no install required</span>
          </div>

          <h1 style={{ color:'#fff', fontSize:34, fontWeight:800, lineHeight:1.18, margin:'0 0 14px', letterSpacing:'-.7px' }}>
            Your procurement<br/>
            <span style={{ background:'linear-gradient(90deg,#818CF8,#C084FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              command center
            </span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.52)', fontSize:14, lineHeight:1.7, maxWidth:340, margin:'0 0 28px' }}>
            From RFQ to final invoice — one intelligent platform for your entire supply chain.
          </p>

          {/* Feature chips — horizontal wrap */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:28 }}>
            {FEATURES.map(f => (
              <div key={f.icon} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', borderRadius:100, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)' }}>
                <span className="material-symbols-outlined" style={{ fontSize:15, color:'#A5B4FC' }}>{f.icon}</span>
                <span style={{ color:'rgba(255,255,255,.7)', fontSize:12, fontWeight:500 }}>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:0 }}>
            {[['500+','Enterprises'],['12K+','Vendors'],['₹2B+','Processed'],['99.9%','Uptime']].map(([v,l]) => (
              <div key={l} style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.09)', borderRadius:12, padding:'12px 8px', textAlign:'center' }}>
                <div style={{ color:'#A5B4FC', fontWeight:800, fontSize:17, letterSpacing:'-.4px' }}>{v}</div>
                <div style={{ color:'rgba(255,255,255,.38)', fontSize:11, marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo accounts — pinned bottom */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0, borderRadius:16, padding:18, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.09)' }}>
          <p style={{ color:'rgba(255,255,255,.38)', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:12 }}>
            Click to auto-fill credentials
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {DEMO_ACCOUNTS.map((acc, i) => (
              <button key={i} onClick={() => fill(acc, i)} style={{
                textAlign:'left', padding:'10px 12px', borderRadius:10, cursor:'pointer', outline:'none',
                background: activeIdx === i ? 'rgba(99,102,241,.28)' : 'rgba(255,255,255,.06)',
                border: `1px solid ${activeIdx === i ? 'rgba(99,102,241,.55)' : 'rgba(255,255,255,.08)'}`,
                transition:'all .15s',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                  <div style={{ width:22, height:22, borderRadius:6, background:acc.bg+'28', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize:13, color:acc.color }}>{acc.icon}</span>
                  </div>
                  <span style={{ color:'#fff', fontWeight:600, fontSize:11 }}>{acc.role}</span>
                </div>
                <span style={{ color:'rgba(255,255,255,.38)', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{acc.email}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ position:'relative', zIndex:2, color:'rgba(255,255,255,.18)', fontSize:11, marginTop:16, flexShrink:0 }}>© 2026 VendorBridge Enterprise</div>
      </div>

      {/* ══════════════ RIGHT FORM PANEL ══════════════ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff', overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px', height:60, borderBottom:'1px solid #F1F5F9' }}>
          {/* Logo — visible on mobile only */}
          <div className="login-mobile-logo" style={{ alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:17, color:'#fff' }}>hub</span>
            </div>
            <span style={{ fontWeight:700, fontSize:14, color:'#0F172A' }}>VendorBridge</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:13, color:'#94A3B8' }}></span>
          </div>
        </div>

        {/* Form — centred, no overflow */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 36px' }}>
          <div style={{ width:'100%', maxWidth:400 }}>

            {/* Heading */}
            <div style={{ marginBottom:28 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:100, background:'#EEF2FF', border:'1px solid #C7D2FE', marginBottom:14 }}>
                <span className="material-symbols-outlined" style={{ fontSize:12, color:'#6366F1', fontVariationSettings:"'FILL' 1" }}>lock</span>
                <span style={{ fontSize:11, color:'#4F46E5', fontWeight:700, letterSpacing:'.04em' }}>SECURE · 256-BIT SSL</span>
              </div>
              <h1 style={{ fontSize:28, fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-.6px', lineHeight:1.2 }}>Welcome back</h1>
              <p style={{ fontSize:14, color:'#64748B', marginTop:6 }}>Sign in to your procurement dashboard</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {/* Email */}
              <div>
                <label style={lbl}>Work Email</label>
                <AuthInput
                  icon="mail" type="email" placeholder="you@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <label style={{ ...lbl, marginBottom:0 }}>Password</label>
                  <a href="#" style={{ fontSize:12, color:'#6366F1', fontWeight:600, textDecoration:'none' }}>Forgot?</a>
                </div>
                <AuthInput
                  icon="lock"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  right={
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', color:'#94A3B8' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:17 }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  }
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ display:'flex', alignItems:'center', gap:9, padding:'10px 14px', borderRadius:10, background:'#FEF2F2', border:'1px solid #FECACA' }}>
                  <span className="material-symbols-outlined" style={{ fontSize:15, color:'#EF4444', flexShrink:0, fontVariationSettings:"'FILL' 1" }}>error</span>
                  <span style={{ fontSize:13, color:'#DC2626' }}>{error}</span>
                </div>
              )}

              {/* Remember */}
              <label style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', userSelect:'none' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width:15, height:15, accentColor:'#6366F1', cursor:'pointer' }} />
                <span style={{ fontSize:13, color:'#64748B' }}>Keep me signed in for 30 days</span>
              </label>

              {/* ── Primary CTA button ── */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width:'100%', height:46, borderRadius:11,
                  background: loading ? '#818CF8' : 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)',
                  border:'none', color:'#fff', fontWeight:700, fontSize:15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(79,70,229,.42)',
                  transition:'all .18s', letterSpacing:'-.1px', fontFamily:'Inter,sans-serif',
                  marginTop:2,
                }}
                onMouseEnter={e => { if(!loading){ e.currentTarget.style.boxShadow='0 6px 26px rgba(79,70,229,.58)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
                onMouseLeave={e => { e.currentTarget.style.boxShadow=loading?'none':'0 4px 18px rgba(79,70,229,.42)'; e.currentTarget.style.transform='none'; }}
              >
                {loading
                  ? <><span style={{ width:17, height:17, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'_spin .7s linear infinite' }} /> Signing in…</>
                  : <><span className="material-symbols-outlined" style={{ fontSize:18 }}>login</span> Sign In to Dashboard</>
                }
              </button>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:6 }}>
                <div style={{ flex:1, height:1, background:'#F1F5F9' }} />
                <span style={{ fontSize:11, color:'#CBD5E1', fontWeight:700, letterSpacing:'.05em' }}>OR</span>
                <div style={{ flex:1, height:1, background:'#F1F5F9' }} />
              </div>

              {/* SSO button — outlined with icon */}
              <button
                type="button"
                style={{
                  width:'100%', height:44, borderRadius:11,
                  background:'#fff', border:'1.5px solid #E2E8F0', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                  color:'#374151', fontWeight:600, fontSize:14,
                  transition:'all .15s', fontFamily:'Inter,sans-serif',
                  boxShadow:'0 1px 3px rgba(0,0,0,.04)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.background='#F5F3FF'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.background='#fff'; e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.04)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize:19, color:'#6366F1' }}>corporate_fare</span>
                Continue with Enterprise SSO
              </button>

              {/* New vendor register row */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:4 }}>
                <span style={{ fontSize:13, color:'#94A3B8' }}>New vendor?</span>
                <Link
                  to="/register"
                  style={{
                    fontSize:13, color:'#6366F1', fontWeight:700, textDecoration:'none',
                    padding:'7px 18px', borderRadius:10,
                    border:'1.5px solid #C7D2FE', background:'#EEF2FF',
                    transition:'all .15s', display:'inline-block',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#E0E7FF'; e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#EEF2FF'; e.currentTarget.style.borderColor='#C7D2FE'; e.currentTarget.style.boxShadow='none'; }}
                >
                  Register
                </Link>
              </div>
            </form>

            {/* Footer note */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:16 }}>
              <span className="material-symbols-outlined" style={{ fontSize:13, color:'#CBD5E1', fontVariationSettings:"'FILL' 1" }}>verified_user</span>
              <span style={{ fontSize:11, color:'#CBD5E1' }}>Enterprise-grade security · SOC 2 compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── global keyframes ── */}
      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
        .login-left { display: none !important; }
        .login-mobile-logo { display: none !important; }
        @media (min-width: 1024px) {
          .login-left { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .login-mobile-logo { display: flex !important; }
        }
        html, body { overflow: hidden; height: 100%; }
      `}</style>
    </div>
  );
}
