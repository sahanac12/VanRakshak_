import NotificationBell from '../components/NotificationBell';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'other',
    description: '',
    zone: 'North', // Default
    location: { lat: 0, lng: 0 },
    evidence: [],
    priority: 'medium'
  });
  const [preview, setPreview] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get('/incidents');
      setReports(res.data.data);
    } catch (err) {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/api/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({
        ...prev,
        evidence: [...prev.evidence, res.data.url]
      }));
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || 'Check connection'));
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.evidence.length === 0 && !window.confirm('Continue without evidence?')) return;

    setSubmitting(true);
    try {
      await api.post('/incidents', formData);
      setFormData({
        type: 'other',
        description: '',
        zone: 'North',
        location: { lat: 0, lng: 0 },
        evidence: [],
        priority: 'medium'
      });
      setPreview(null);
      fetchReports();
      alert('Report submitted successfully. Thank you for your vigilance.');
    } catch (err) {
      alert('Submission failed: ' + (err.response?.data?.message || 'Check connection'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>🛡️ Van Rakshak Community</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <NotificationBell />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontWeight: 600 }}>{user?.name}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {/* Left Side: Report Form */}
        <section className="card report-card">
          <h2>📢 Report an Incident</h2>
          <form onSubmit={handleSubmit}>
            {/* Capture/Upload Section First */}
            <div className="form-group">
              <label>Evidence (Image)</label>
              <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
                {preview ? (
                  <img src={preview} alt="Preview" className="preview-img" />
                ) : (
                  <div>
                    <span style={{ fontSize: '2rem' }}>📷</span>
                    <p>{uploading ? 'Uploading...' : 'Tap to capture or upload'}</p>
                  </div>
                )}
                <input 
                  id="file-input" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>What happened?</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="fire">🔥 Forest Fire</option>
                <option value="poaching">🦌 Poaching</option>
                <option value="logging">🪓 Illegal Logging</option>
                <option value="wildlife">🐾 Wildlife Sighting</option>
                <option value="other">❓ Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Zone</label>
              <select value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}>
                <option value="North">North Sector</option>
                <option value="East">East Sector</option>
                <option value="West">West Sector</option>
                <option value="South">South Sector</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the incident in detail..."
                rows="4"
                required
              />
            </div>

            <button type="submit" className="btn" disabled={submitting || uploading}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </section>

        {/* Right Side: My Reports */}
        <section className="card reports-section">
          <h2>📋 My Reports</h2>
          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : reports.length === 0 ? (
            <p className="empty-msg">You haven't reported any incidents yet.</p>
          ) : (
            <div className="reports-list">
              {reports.map(report => (
                <div key={report._id} className="report-item">
                  <div className="report-header">
                    <span className="report-title">{report.type.toUpperCase()}</span>
                    <span className={`status-badge status-${report.status}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="report-desc">{report.description}</p>
                  <div className="report-meta">
                    <span>📍 {report.zone}</span>
                    <span>🕒 {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
