import NotificationBell from '../components/NotificationBell';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Van Rakshak</h3>
          <span>Control Center</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">Incidents</Link>
          <Link to="/officers" className="nav-item">Officers</Link>
          <Link to="/zones" className="nav-item">Zones</Link>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-info">
            <p>{user?.name}</p>
            <span>{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2>Dashboard</h2>
            <div className="status-indicator">
              <span className="dot online"></span> System Online
            </div>
          </div>
          
          <div className="top-bar-actions">
            <NotificationBell />
          </div>
        </header>
        
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
