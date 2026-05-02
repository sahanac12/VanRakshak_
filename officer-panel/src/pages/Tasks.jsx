import NotificationBell from '../components/NotificationBell';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const fetchTasks = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/incidents');
      setTasks(res.data.data);
      setError('');
    } catch (err) {
      setError('Connection to Central Command lost. Retrying...');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(true);
    // Poll for updates every 60 seconds (sockets handle real-time)
    const interval = setInterval(() => fetchTasks(), 60000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const [uploading, setUploading] = useState(false);
  const [evidenceMap, setEvidenceMap] = useState({}); // taskId -> [urls]

  const handleFileUpload = async (taskId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    setUploading(true);
    try {
      const res = await api.post('/api/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      setEvidenceMap(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), url]
      }));
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || 'Check connection'));
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    if (newStatus === 'resolved' && !window.confirm('Confirm resolution of this incident?')) return;

    setActionLoading(taskId);
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      const payload = { status: newStatus };
      if (newStatus === 'resolved' && evidenceMap[taskId]) {
        payload.evidence = evidenceMap[taskId];
      }
      
      await api.patch(`/incidents/${taskId}`, payload);
      // Clear evidence for this task after success
      if (newStatus === 'resolved') {
        setEvidenceMap(prev => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
      fetchTasks();
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks);
      const msg = err.response?.data?.message || 'Update failed. Check your network.';
      alert('Error: ' + msg);
    } finally {
      setActionLoading(null);
    }
  };

  const assigned = tasks.filter(t => t.status === 'assigned');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const resolved = tasks.filter(t => t.status === 'resolved');

  if (loading && tasks.length === 0) {
    return (
      <div className="loader">
        <div className="spinner"></div>
        <p>Syncing Duty Roster...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="officer-header">
        <div className="header-info">
          <h1>🛡️ Van Rakshak</h1>
          <p>Officer {user?.name} • Zone {user?.assignedZone || 'N/A'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NotificationBell />
          <button onClick={logout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      <main className="tasks-container">
        {error && <div className="error-banner">⚠️ {error}</div>}

        <div className="task-grid">
          {/* Section 1: Assigned */}
          <section className="task-section">
            <h2 className="section-title">🔵 Assigned</h2>
            {assigned.length === 0 ? (
              <div className="empty-msg">No pending assignments. All clear!</div>
            ) : (
              assigned.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onAction={(status) => handleUpdateStatus(task._id, status)}
                  loading={actionLoading === task._id}
                />
              ))
            )}
          </section>

          {/* Section 2: In Progress */}
          <section className="task-section">
            <h2 className="section-title">🟠 In Progress</h2>
            {inProgress.length === 0 ? (
              <div className="empty-msg">No active tasks. Scan for issues?</div>
            ) : (
              inProgress.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onAction={(status) => handleUpdateStatus(task._id, status)}
                  loading={actionLoading === task._id}
                  uploading={uploading}
                  onUpload={(file) => handleFileUpload(task._id, file)}
                  attachedEvidence={evidenceMap[task._id] || []}
                />
              ))
            )}
          </section>

          {/* Section 3: Resolved */}
          <section className="task-section">
            <h2 className="section-title">🟢 Resolved</h2>
            {resolved.length === 0 ? (
              <div className="empty-msg">No recently resolved tasks.</div>
            ) : (
              resolved.map(task => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  isHistory={true}
                />
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

const TaskCard = ({ task, onAction, loading, isHistory, uploading, onUpload, attachedEvidence }) => {
  const baseURL = 'http://localhost:5000'; // Match backend URL

  return (
    <div className={`task-card priority-${task.priority}`}>
      <div className="card-accent"></div>
      <div className="card-header">
        <span className="task-type">{task.type.replace('_', ' ')}</span>
        <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
      </div>
      
      <p className="task-desc">{task.description}</p>
      
      <div className="card-meta">
        <div className="meta-item">
          <span>📍</span> {task.zone}
        </div>
        <div className="meta-item">
          <span>🕒</span> {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Show existing evidence if any */}
      {(task.evidence?.length > 0 || attachedEvidence?.length > 0) && (
        <div className="evidence-preview">
          {[...(task.evidence || []), ...(attachedEvidence || [])].map((url, i) => (
            <img key={i} src={`${baseURL}${url}`} alt="Evidence" className="evidence-thumb" />
          ))}
        </div>
      )}
      
      {!isHistory && (
        <div className="card-actions">
          {task.status === 'assigned' && (
            <button 
              onClick={() => onAction('in_progress')} 
              disabled={loading}
              className="action-btn start-btn"
            >
              {loading ? 'Processing...' : '▶ Start Work'}
            </button>
          )}
          {task.status === 'in_progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
              <label className="upload-label">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => onUpload(e.target.files[0])} 
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                <span className="action-btn upload-btn">
                  {uploading ? '⌛ Uploading...' : '📷 Attach Proof'}
                </span>
              </label>
              
              <button 
                onClick={() => onAction('resolved')} 
                disabled={loading}
                className="action-btn resolve-btn"
              >
                {loading ? 'Resolving...' : '✅ Mark Resolved'}
              </button>
            </div>
          )}
        </div>
      )}
      
      {isHistory && task.resolvedAt && (
        <div className="meta-item" style={{ marginTop: '-0.5rem', opacity: 0.6 }}>
          <span>Done:</span> {new Date(task.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
