import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const DEMO_ACCOUNTS = [
  { role: 'Admin',               symbol: '👑', email: 'admin@vendorbridge.com',   password: 'Admin@123',   color: 'border-purple-400 bg-purple-50' },
  { role: 'Procurement Officer', symbol: '📋', email: 'officer@vendorbridge.com', password: 'Officer@123', color: 'border-blue-400 bg-blue-50' },
  { role: 'Manager / Approver',  symbol: '✅', email: 'manager@vendorbridge.com', password: 'Manager@123', color: 'border-green-400 bg-green-50' },
  { role: 'Vendor',              symbol: '🏭', email: 'vendor@infrasupp.com',     password: 'Vendor@123',  color: 'border-orange-400 bg-orange-50' }
];

const Login = () => {
  const { login, user } = useAppState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'vendor' ? '/submit-quotation' : '/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const loggedUser = login(email.trim(), password);
    if (!loggedUser) {
      setError('Invalid email or password. Please try again.');
      return;
    }
    navigate(loggedUser.role === 'vendor' ? '/submit-quotation' : '/dashboard');
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <main className="flex h-screen w-full animate-fade-in">
      {/* Left Panel */}
      <section className="hidden lg:flex lg:w-[55%] flex-col justify-between p-xl relative overflow-hidden bg-on-primary-fixed">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-fixed-dim rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-white text-[28px]">hub</span>
            </div>
            <span className="font-h1 text-h1 text-white tracking-tight">VendorBridge</span>
          </div>
        </div>
        <div className="relative z-10 max-w-xl">
          <h2 className="font-h1 text-h1 text-white mb-md leading-tight">
            Streamline procurement. Build better vendor relationships.
          </h2>
          <p className="font-body-md text-white/70 mb-xl max-w-md">
            Centralize your entire supply chain in one enterprise-grade platform.
          </p>
          <div className="flex flex-wrap gap-sm mb-xl">
            <div className="px-md py-sm bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">verified</span>
              <span className="font-label-md text-white">Automated RFQs</span>
            </div>
            <div className="px-md py-sm bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">analytics</span>
              <span className="font-label-md text-white">Smart Insights</span>
            </div>
            <div className="px-md py-sm bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">security</span>
              <span className="font-label-md text-white">ERP Compliance</span>
            </div>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-lg space-y-sm">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-sm">Demo Accounts — click to fill</p>
          <div className="grid grid-cols-2 gap-sm">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc)}
                className="text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-sm transition-all"
              >
                <p className="text-white font-semibold text-[13px]">{acc.symbol} {acc.role}</p>
                <p className="text-white/60 text-[11px] mt-0.5 truncate">{acc.email}</p>
                <p className="text-white/50 text-[11px]">pw: {acc.password}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/50 font-body-sm text-[12px]">
          © 2026 VendorBridge Enterprise
        </div>
      </section>

      {/* Right Panel */}
      <section className="w-full lg:w-[45%] flex flex-col justify-center items-center p-xl bg-white relative overflow-y-auto">
        <div className="lg:hidden absolute top-lg left-lg flex items-center gap-xs">
          <span className="material-symbols-outlined text-primary text-[24px]">hub</span>
          <span className="font-h2 text-h2 text-on-surface">VendorBridge</span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-xl">
            <h1 className="font-h1 text-h1 text-on-surface mb-xs">Welcome back</h1>
            <p className="font-body-md text-on-surface-variant text-[14px]">Access your enterprise procurement dashboard.</p>
          </div>

          {/* Mobile demo accounts */}
          <div className="lg:hidden mb-lg">
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-sm">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-sm">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => fillDemo(acc)}
                  className={`text-left border-2 rounded-lg p-sm transition-all ${acc.color}`}
                >
                  <p className="font-semibold text-[12px] text-on-surface">{acc.symbol} {acc.role}</p>
                  <p className="text-on-surface-variant text-[11px] truncate">{acc.email}</p>
                </button>
              ))}
            </div>
          </div>

          <form className="space-y-lg animate-fade-in" onSubmit={handleSubmit}>
            <div className="space-y-xs">
              <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px]" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">mail</span>
                <input
                  className="w-full h-10 pl-[44px] pr-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                  id="email" name="email" placeholder="john.doe@enterprise.com"
                  required type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
              </div>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px]" htmlFor="password">Password</label>
                <a className="text-primary font-label-md hover:underline transition-all text-[13px]" href="#">Forgot password?</a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">lock</span>
                <input
                  className="w-full h-10 pl-[44px] pr-10 bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                  id="password" name="password" placeholder="••••••••"
                  required type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                />
                <button type="button"
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <p className="text-error text-[13px] font-medium bg-error-container px-md py-sm rounded-lg">{error}</p>
            )}

            <div className="flex items-center gap-sm py-xs">
              <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                id="remember" type="checkbox" checked={remember}
                onChange={(e) => setRemember(e.target.checked)} />
              <label className="font-body-sm text-on-surface-variant cursor-pointer text-[12px]" htmlFor="remember">
                Remember this device for 30 days
              </label>
            </div>

            <button className="w-full h-10 bg-primary text-white font-h3 text-h3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm" type="submit">
              Sign In
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="flex items-center gap-md my-xl">
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
            <span className="font-body-sm text-outline text-[12px]">or</span>
            <div className="flex-1 h-[1px] bg-outline-variant/30"></div>
          </div>

          <button className="w-full h-10 border border-outline-variant bg-white text-on-surface font-label-md rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-sm text-[13px]">
            <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            Enterprise SSO
          </button>

          <p className="mt-xl text-center font-body-md text-on-surface-variant text-[14px]">
            New vendor? <Link to="/register" className="text-primary font-semibold hover:underline">Register your account</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
