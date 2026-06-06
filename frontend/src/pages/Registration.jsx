import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const CATEGORIES = ['Logistics','IT Hardware','Office Supplies','Industrial Parts','Construction','Professional Services','Software & SaaS'];
const COUNTRIES  = ['India','United States','United Kingdom','Singapore','Germany','Japan','UAE','Australia'];

const PERKS = [
  { icon: 'verified',             t: 'Verified Buyer Network',  d: 'Connect with 500+ certified enterprise buyers.' },
  { icon: 'notifications_active', t: 'Instant RFQ Matching',    d: 'Auto-matched alerts the moment RFQs go live.' },
  { icon: 'payments',             t: 'Faster Payments',         d: 'Track every invoice and payment in real time.' },
  { icon: 'analytics',            t: 'Business Analytics',      d: 'Win-rate & bidding performance dashboards.' },
];

/* ─── tiny input ───────────────────────────────────────────────────────────── */
function Inp({ icon, type='text', placeholder, value, onChange, hasErr, right, extraPr=14 }) {
  return (
    <div style={{ position:'relative' }}>
      {icon && <span className="material-symbols-outlined" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#94A3B8', pointerEvents:'none' }}>{icon}</span>}
      <input
        type={type} placeholder={placeholder} value={value} required={false}
        onChange={onChange}
        style={{
          width:'100%', height:40, paddingLeft: icon ? 36 : 12, paddingRight: extraPr,
          border:`1.5px solid ${hasErr ? '#FCA5A5' : '#E2E8F0'}`,
          borderRadius:9, fontSize:13, color:'#0F172A',
          background: hasErr ? '#FEF2F2' : '#F8FAFC',
          outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif',
          transition:'all .15s',
        }}
        onFocus={e => { e.target.style.borderColor='#6366F1'; e.target.style.background='#fff'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,.1)'; }}
        onBlur={e  => { e.target.style.borderColor=hasErr?'#FCA5A5':value?'#6366F1':'#E2E8F0'; e.target.style.background=hasErr?'#FEF2F2':'#F8FAFC'; e.target.style.boxShadow='none'; }}
      />
      {right}
    </div>
  );
}

function Sel({ icon, value, onChange, children }) {
  return (
    <div style={{ position:'relative' }}>
      {icon && <span className="material-symbols-outlined" style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#94A3B8', pointerEvents:'none', zIndex:1 }}>{icon}</span>}
      <select value={value} onChange={onChange}
        style={{ width:'100%', height:40, paddingLeft:icon?36:12, paddingRight:30, border:'1.5px solid #E2E8F0', borderRadius:9, fontSize:13, color:'#0F172A', background:'#F8FAFC', outline:'none', boxSizing:'border-box', appearance:'none', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all .15s' }}
        onFocus={e => { e.target.style.borderColor='#6366F1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,.1)'; }}
        onBlur={e  => { e.target.style.borderColor='#E2E8F0'; e.target.style.boxShadow='none'; }}
      >{children}</select>
      <span className="material-symbols-outlined" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:15, color:'#94A3B8', pointerEvents:'none' }}>expand_more</span>
    </div>
  );
}

const LBL = { display:'block', fontSize:11, fontWeight:700, color:'#64748B', marginBottom:5, letterSpacing:'.04em', textTransform:'uppercase' };
const ERR = { marginTop:4, fontSize:11, color:'#EF4444', display:'flex', alignItems:'center', gap:3 };

export default function Registration() {
  const { registerVendor } = useAppState();
  const navigate           = useNavigate();

  const [form, setForm] = useState({
    fullName:'', companyName:'', email:'', phone:'',
    password:'', confirmPassword:'',
    category:'Logistics', country:'India', agree:false,
  });
  const [showP,    setShowP]    = useState(false);
  const [showC,    setShowC]    = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type==='checkbox' ? e.target.checked : e.target.value }));
  const clrErr = f => e => { set(f)(e); if(errors[f]) setErrors(p=>({...p,[f]:''})); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName    = 'Required';
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.email.trim())       e.email       = 'Required';
    if (form.password.length < 8) e.password    = 'Min. 8 chars';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Mismatch';
    if (!form.agree)              e.agree       = 'Accept terms to continue';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 550));
    registerVendor(form);
    setLoading(false);
    navigate('/login');
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'Inter,sans-serif' }}>

      {/* ══════ LEFT PANEL ══════ */}
      <div className="reg-left" style={{
        width:'36%', flexShrink:0, position:'relative', overflow:'hidden',
        background:'linear-gradient(150deg,#0D0B26 0%,#1B1760 55%,#1E1B4B 100%)',
        display:'flex', flexDirection:'column', padding:'32px 36px',
      }}>
        {/* Glow */}
        <div style={{ position:'absolute', top:-80, right:-60, width:380, height:380, borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,.38) 0%,transparent 70%)', filter:'blur(55px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'5%', left:-50, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,.28) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)', backgroundSize:'26px 26px', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 22px rgba(99,102,241,.55)' }}>
            <span className="material-symbols-outlined" style={{ fontSize:20, color:'#fff' }}>hub</span>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:15, letterSpacing:'-.3px' }}>VendorBridge</div>
            <div style={{ color:'rgba(255,255,255,.35)', fontSize:10, letterSpacing:'.05em' }}>VENDOR PORTAL</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ flex:1, position:'relative', zIndex:2, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 13px', borderRadius:100, background:'rgba(99,102,241,.18)', border:'1px solid rgba(99,102,241,.35)', width:'fit-content', marginBottom:18 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#818CF8', display:'inline-block' }} />
            <span style={{ color:'#A5B4FC', fontSize:11, fontWeight:600 }}>Open to all vendor partners</span>
          </div>
          <h1 style={{ color:'#fff', fontSize:28, fontWeight:800, lineHeight:1.2, margin:'0 0 12px', letterSpacing:'-.5px' }}>
            Join our verified<br/>
            <span style={{ background:'linear-gradient(90deg,#818CF8,#C084FC)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>vendor network</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, lineHeight:1.65, maxWidth:280, margin:'0 0 24px' }}>
            Register to receive RFQ invitations, submit quotations, and build lasting procurement partnerships.
          </p>

          {/* Perks */}
          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {PERKS.map(p => (
              <div key={p.icon} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'11px 14px', borderRadius:12, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)' }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'rgba(99,102,241,.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:15, color:'#A5B4FC' }}>{p.icon}</span>
                </div>
                <div>
                  <div style={{ color:'#fff', fontWeight:600, fontSize:12, lineHeight:1.3 }}>{p.t}</div>
                  <div style={{ color:'rgba(255,255,255,.4)', fontSize:11, marginTop:2, lineHeight:1.4 }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Staff note */}
          <div style={{ marginTop:18, padding:'11px 14px', borderRadius:12, background:'rgba(251,191,36,.07)', border:'1px solid rgba(251,191,36,.2)', display:'flex', alignItems:'flex-start', gap:9 }}>
            <span className="material-symbols-outlined" style={{ fontSize:15, color:'#FCD34D', flexShrink:0, marginTop:1, fontVariationSettings:"'FILL' 1" }}>info</span>
            <div>
              <div style={{ color:'#FDE68A', fontSize:11, fontWeight:700, marginBottom:3 }}>Internal Staff Note</div>
              <div style={{ color:'rgba(255,255,255,.4)', fontSize:11, lineHeight:1.45 }}>Admin, Officer & Manager accounts are provisioned by your org admin — not via this form.</div>
            </div>
          </div>
        </div>

        <div style={{ position:'relative', zIndex:2, color:'rgba(255,255,255,.18)', fontSize:11, flexShrink:0 }}>© 2026 VendorBridge Enterprise</div>
      </div>

      {/* ══════ RIGHT FORM PANEL ══════ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#fff', overflow:'hidden' }}>

        {/* Top bar */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px', height:58, borderBottom:'1px solid #F1F5F9' }}>
          <div className="reg-mobile-logo" style={{ alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#6366F1,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize:16, color:'#fff' }}>hub</span>
            </div>
            <span style={{ fontWeight:700, fontSize:14, color:'#0F172A' }}>VendorBridge</span>
          </div>
          {/* empty right side — sign-in link moved below submit */}
          <div />
        </div>

        {/* Form — centred, no scroll */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 36px', overflow:'hidden' }}>
          <div style={{ width:'100%', maxWidth:560 }}>

            {/* Heading */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 12px', borderRadius:100, background:'#FEF3C7', border:'1px solid #FDE68A', marginBottom:12 }}>
                <span className="material-symbols-outlined" style={{ fontSize:12, color:'#D97706', fontVariationSettings:"'FILL' 1" }}>business</span>
                <span style={{ fontSize:11, color:'#B45309', fontWeight:700, letterSpacing:'.04em' }}>VENDOR REGISTRATION</span>
              </div>
              <h1 style={{ fontSize:24, fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-.4px' }}>Create your vendor account</h1>
              <p style={{ fontSize:13, color:'#64748B', marginTop:5 }}>Fill in your details below — takes less than 2 minutes</p>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit}>
              {/* Row 1: 2 cols */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 16px', marginBottom:14 }}>
                <div>
                  <label style={LBL}>Contact Person *</label>
                  <Inp icon="person" placeholder="Raj Patel" value={form.fullName} onChange={clrErr('fullName')} hasErr={!!errors.fullName} />
                  {errors.fullName && <p style={ERR}><span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>error</span>{errors.fullName}</p>}
                </div>
                <div>
                  <label style={LBL}>Company Name *</label>
                  <Inp icon="business" placeholder="Patel Enterprises Ltd" value={form.companyName} onChange={clrErr('companyName')} hasErr={!!errors.companyName} />
                  {errors.companyName && <p style={ERR}><span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>error</span>{errors.companyName}</p>}
                </div>
              </div>

              {/* Row 2: 2 cols */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 16px', marginBottom:14 }}>
                <div>
                  <label style={LBL}>Business Email *</label>
                  <Inp icon="mail" type="email" placeholder="sales@company.com" value={form.email} onChange={clrErr('email')} hasErr={!!errors.email} />
                  {errors.email && <p style={ERR}><span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>error</span>{errors.email}</p>}
                </div>
                <div>
                  <label style={LBL}>Phone Number</label>
                  <Inp icon="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              {/* Row 3: 2 cols — passwords */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 16px', marginBottom:14 }}>
                <div>
                  <label style={LBL}>Password *</label>
                  <Inp
                    icon="lock" type={showP?'text':'password'} placeholder="Min. 8 characters"
                    value={form.password} onChange={clrErr('password')} hasErr={!!errors.password}
                    extraPr={40}
                    right={
                      <button type="button" onClick={()=>setShowP(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, color:'#94A3B8', display:'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:16 }}>{showP?'visibility_off':'visibility'}</span>
                      </button>
                    }
                  />
                  {errors.password && <p style={ERR}><span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>error</span>{errors.password}</p>}
                </div>
                <div>
                  <label style={LBL}>Confirm Password *</label>
                  <Inp
                    icon="lock_reset" type={showC?'text':'password'} placeholder="Repeat password"
                    value={form.confirmPassword} onChange={clrErr('confirmPassword')} hasErr={!!errors.confirmPassword}
                    extraPr={40}
                    right={
                      <button type="button" onClick={()=>setShowC(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, color:'#94A3B8', display:'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize:16 }}>{showC?'visibility_off':'visibility'}</span>
                      </button>
                    }
                  />
                  {errors.confirmPassword && <p style={ERR}><span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>error</span>{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Row 4: 2 cols — selects */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 16px', marginBottom:16 }}>
                <div>
                  <label style={LBL}>Business Category *</label>
                  <Sel icon="category" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </Sel>
                </div>
                <div>
                  <label style={LBL}>Country</label>
                  <Sel icon="location_on" value={form.country} onChange={set('country')}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </Sel>
                </div>
              </div>

              {/* Terms */}
              <div style={{ marginBottom:16, padding:'12px 14px', borderRadius:10, border:`1.5px solid ${errors.agree?'#FCA5A5':'#E2E8F0'}`, background:errors.agree?'#FEF2F2':'#F8FAFC', display:'flex', alignItems:'flex-start', gap:10, transition:'all .15s' }}>
                <input type="checkbox" id="agree" checked={form.agree} onChange={set('agree')}
                  style={{ width:15, height:15, marginTop:2, cursor:'pointer', accentColor:'#6366F1', flexShrink:0 }} />
                <label htmlFor="agree" style={{ fontSize:12, color:'#4B5563', cursor:'pointer', lineHeight:1.55, userSelect:'none' }}>
                  I agree to VendorBridge{' '}
                  <a href="#" style={{ color:'#6366F1', fontWeight:700, textDecoration:'none' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" style={{ color:'#6366F1', fontWeight:700, textDecoration:'none' }}>Privacy Policy</a>.
                  {' '}My account requires administrator approval before activation.
                </label>
              </div>
              {errors.agree && <p style={{ ...ERR, marginTop:-10, marginBottom:12 }}><span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1" }}>error</span>{errors.agree}</p>}

              {/* ── Submit button ── */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width:'100%', height:46, borderRadius:11,
                  background: loading ? '#818CF8' : 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%)',
                  border:'none', color:'#fff', fontWeight:700, fontSize:14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: loading ? 'none' : '0 4px 18px rgba(79,70,229,.4)',
                  transition:'all .18s', fontFamily:'Inter,sans-serif', letterSpacing:'-.1px',
                }}
                onMouseEnter={e => { if(!loading){ e.currentTarget.style.boxShadow='0 6px 26px rgba(79,70,229,.56)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
                onMouseLeave={e => { e.currentTarget.style.boxShadow=loading?'none':'0 4px 18px rgba(79,70,229,.4)'; e.currentTarget.style.transform='none'; }}
              >
                {loading
                  ? <><span style={{ width:17, height:17, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'_spin .7s linear infinite' }} /> Creating account…</>
                  : <><span className="material-symbols-outlined" style={{ fontSize:17 }}>how_to_reg</span> Create Vendor Account</>
                }
              </button>
              {/* Have an account — sign in pill */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:6 }}>
                <span style={{ fontSize:13, color:'#94A3B8' }}>Have an account?</span>
                <Link
                  to="/login"
                  style={{
                    fontSize:13, color:'#6366F1', fontWeight:700, textDecoration:'none',
                    padding:'7px 18px', borderRadius:10,
                    border:'1.5px solid #C7D2FE', background:'#EEF2FF',
                    transition:'all .15s', display:'inline-block',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='#E0E7FF'; e.currentTarget.style.borderColor='#6366F1'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(99,102,241,.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#EEF2FF'; e.currentTarget.style.borderColor='#C7D2FE'; e.currentTarget.style.boxShadow='none'; }}
                >
                  Sign In
                </Link>
              </div>
            </form>

            {/* Bottom note */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:12 }}>
              <span className="material-symbols-outlined" style={{ fontSize:12, color:'#CBD5E1', fontVariationSettings:"'FILL' 1" }}>verified_user</span>
              <span style={{ fontSize:11, color:'#CBD5E1' }}>Your data is encrypted and never shared</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
        .reg-left { display: none !important; }
        .reg-mobile-logo { display: none !important; }
        @media (min-width: 1024px) {
          .reg-left { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .reg-mobile-logo { display: flex !important; }
        }
        html, body { overflow: hidden; height: 100%; }
      `}</style>
    </div>
  );
}
