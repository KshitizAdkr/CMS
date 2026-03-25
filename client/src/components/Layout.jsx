import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ title }) {
  const closeSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  };

  return (
    <>
      <div className="sidebar-overlay" id="sidebarOverlay" onClick={closeSidebar}></div>
      <Sidebar />
      <Topbar title={title || 'Dashboard'} />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
