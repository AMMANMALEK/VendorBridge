import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';

/**
 * Shared layout wrapper used by every authenticated page.
 * Handles sidebar collapse state so the Header toggle button works.
 */
const Layout = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('vb_sidebar_collapsed') === 'true'
  );

  const toggle = () => {
    setCollapsed(v => {
      const next = !v;
      localStorage.setItem('vb_sidebar_collapsed', String(next));
      document.body.classList.toggle('sidebar-collapsed', next);
      return next;
    });
  };

  // Sync body class on mount
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    return () => document.body.classList.remove('sidebar-collapsed');
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: '#F4F6FA' }}>
      <Sidebar />
      <div
        className="flex-1 ml-sidebar_width flex flex-col min-h-screen"
        style={{ paddingTop: 64 }}
      >
        <Header title={title} onToggleSidebar={toggle} />
        <main className="flex-1 p-6 w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
