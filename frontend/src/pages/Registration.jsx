import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../context/StateContext';

const Registration = () => {
  const { registerVendor } = useAppState();
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
    category: 'Logistics',
    country: 'India',
    additionalInfo: '',
    agree: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agree) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    registerVendor(formData);
    alert(`Vendor account created successfully!\n\nYou can now log in with:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nYour account is pending Admin verification.`);
    navigate('/login');
  };

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  return (
    <main className="flex min-h-screen w-full animate-fade-in bg-[#f9f9ff]">
      {/* Sidebar Panel */}
      <section className="hidden lg:flex lg:w-[40%] flex-col justify-between p-xl bg-on-primary-fixed relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-fixed-dim rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined text-white text-[28px]">hub</span>
            </div>
            <span className="font-h1 text-h1 text-white tracking-tight">VendorBridge</span>
          </div>
        </div>
        <div className="relative z-10 max-w-md my-auto">
          <h2 className="font-h1 text-h1 text-white mb-md leading-tight text-[28px]">
            Join as a Vendor Partner
          </h2>
          <p className="font-body-md text-white/70 mb-xl text-[14px]">
            Register your business to receive RFQs, submit quotations, and grow your supply chain partnerships.
          </p>
          <div className="space-y-md">
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-primary-fixed-dim mt-0.5">verified</span>
              <div>
                <h4 className="font-semibold text-white text-[14px]">Verified Procurement Network</h4>
                <p className="text-white/60 text-xs mt-0.5">Connect with certified enterprise buyers.</p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-primary-fixed-dim mt-0.5">dynamic_feed</span>
              <div>
                <h4 className="font-semibold text-white text-[14px]">Real-Time RFQ Notifications</h4>
                <p className="text-white/60 text-xs mt-0.5">Get instant alerts when matching RFQs are published.</p>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <span className="material-symbols-outlined text-primary-fixed-dim mt-0.5">account_balance_wallet</span>
              <div>
                <h4 className="font-semibold text-white text-[14px]">Fast Payment Processing</h4>
                <p className="text-white/60 text-xs mt-0.5">Track invoices and receive payments on time.</p>
              </div>
            </div>
          </div>
          <div className="mt-xl p-md bg-white/10 rounded-lg border border-white/20">
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-xs">Note</p>
            <p className="text-white/60 text-[12px]">Registration is open to vendors only. Internal staff (Admin, Officer, Manager) accounts are provisioned by your organization administrator.</p>
          </div>
        </div>
        <div className="relative z-10 text-white/50 font-body-sm text-[12px]">© 2026 VendorBridge Enterprise</div>
      </section>

      {/* Form Panel */}
      <section className="w-full lg:w-[60%] flex flex-col justify-center p-xl bg-white relative overflow-y-auto">
        <div className="w-full max-w-[520px] mx-auto py-lg">
          <div className="mb-xl">
            <div className="inline-flex items-center gap-sm bg-orange-50 border border-orange-200 text-orange-700 px-md py-xs rounded-full text-[12px] font-semibold mb-md">
              <span>🏭</span> Vendor Registration
            </div>
            <h1 className="font-h1 text-h1 text-on-surface mb-xs text-[28px] font-bold">Create Vendor Account</h1>
            <p className="font-body-md text-on-surface-variant text-[14px]">Set up your vendor profile to start bidding on procurement requests.</p>
          </div>

          <form className="space-y-lg animate-fade-in" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="fullName">Contact Person Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant">person</span>
                  <input className="w-full h-10 pl-[44px] pr-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                    id="fullName" required type="text" placeholder="Raj Patel"
                    value={formData.fullName} onChange={set('fullName')} />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="companyName">Company / Business Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant">business</span>
                  <input className="w-full h-10 pl-[44px] pr-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                    id="companyName" required type="text" placeholder="Patel Enterprises Ltd"
                    value={formData.companyName} onChange={set('companyName')} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="email">Business Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant">mail</span>
                  <input className="w-full h-10 pl-[44px] pr-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                    id="email" required type="email" placeholder="sales@patelenterprises.com"
                    value={formData.email} onChange={set('email')} />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="phone">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant">phone</span>
                  <input className="w-full h-10 pl-[44px] pr-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                    id="phone" type="tel" placeholder="+91 98765 43210"
                    value={formData.phone} onChange={set('phone')} />
                </div>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="password">Create Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">lock</span>
                <input
                  className="w-full h-10 pl-[44px] pr-10 bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                  id="password" required minLength={8} type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={formData.password} onChange={set('password')} />
                <button type="button"
                  className="absolute right-md top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface"
                  onClick={() => setShowPassword(v => !v)}>
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">This will be your login password. Keep it safe.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="category">Business Category</label>
                <select className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                  id="category" value={formData.category} onChange={set('category')}>
                  <option>Logistics</option>
                  <option>IT Hardware</option>
                  <option>Office Supplies</option>
                  <option>Industrial Parts</option>
                  <option>Construction</option>
                  <option>Services</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="country">Country</label>
                <select className="w-full h-10 px-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-[14px]"
                  id="country" value={formData.country} onChange={set('country')}>
                  <option>India</option>
                  <option>United States</option>
                  <option>Singapore</option>
                  <option>Germany</option>
                  <option>Japan</option>
                </select>
              </div>
            </div>

            <div className="space-y-xs">
              <label className="font-label-md text-on-surface-variant block uppercase tracking-wider text-[11px] font-semibold" htmlFor="additionalInfo">Business Description</label>
              <textarea
                className="w-full h-20 p-md bg-white border border-outline-variant rounded-lg font-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px]"
                id="additionalInfo" placeholder="Briefly describe your products, services, and capabilities..."
                value={formData.additionalInfo} onChange={set('additionalInfo')} />
            </div>

            <div className="flex items-start gap-sm py-xs">
              <input className="w-4 h-4 mt-1 rounded border-outline-variant text-primary focus:ring-primary"
                id="agree" type="checkbox" checked={formData.agree}
                onChange={(e) => setFormData({ ...formData, agree: e.target.checked })} />
              <label className="font-body-sm text-on-surface-variant cursor-pointer text-[12px]" htmlFor="agree">
                I agree to the <a className="text-primary font-medium hover:underline" href="#">Terms of Service</a> and <a className="text-primary font-medium hover:underline" href="#">Privacy Policy</a>. I understand my account requires Admin verification before activation.
              </label>
            </div>

            <button className="w-full h-10 bg-primary text-white font-h3 text-h3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm font-semibold" type="submit">
              Create Vendor Account
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </button>
          </form>

          <p className="mt-xl text-center font-body-md text-on-surface-variant text-[14px]">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Registration;
