import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [statusFilter, zoneFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, offRes] = await Promise.all([
        api.get('/incidents', { params: { status: statusFilter, zone: zoneFilter } }),
        api.get('/users/officers')
      ]);
      setIncidents(incRes.data.data);
      setOfficers(offRes.data.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (incidentId, officerId) => {
    try {
      await api.patch(`/incidents/${incidentId}`, { assignedTo: officerId });
      // Refresh data to show changes
      fetchData();
    } catch (err) {
      alert('Assignment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handlePriorityChange = async (incidentId, priority) => {
    try {
      await api.patch(`/incidents/${incidentId}`, { priority });
      fetchData();
    } catch (err) {
      alert('Update failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return 'status-reported'; // Yellow
      case 'assigned': return 'status-assigned'; // Blue
      case 'in_progress': return 'status-progress'; // Orange
      case 'resolved': return 'status-resolved'; // Green
      default: return '';
    }
  };

  if (loading && incidents.length === 0) return <div className="loading">Initializing Control Center...</div>;

  return (
    <div className="incidents-page">
      <div className="filter-bar">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="reported">Reported</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Zone</label>
          <input 
            type="text" 
            placeholder="Filter by zone..." 
            value={zoneFilter} 
            onChange={(e) => setZoneFilter(e.target.value)}
          />
        </div>
        
        <button onClick={fetchData} className="refresh-btn">Refresh</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-container">
        <table className="incident-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Zone</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned Officer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No incidents found matching criteria.</td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident._id}>
                  <td className="capitalize"><strong>{incident.type}</strong></td>
                  <td><div className="truncate">{incident.description}</div></td>
                  <td>{incident.zone}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <select 
                      value={incident.priority} 
                      onChange={(e) => handlePriorityChange(incident._id, e.target.value)}
                      className={`priority-select priority-${incident.priority}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="critical">Critical</option>
                    </select>
                  </td>
                  <td>
                    {incident.assignedTo ? (
                      <div className="assigned-info">
                        {incident.assignedTo.name}
                        <br/><small>{incident.assignedTo.email}</small>
                      </div>
                    ) : (
                      <span className="unassigned">Not Assigned</span>
                    )}
                  </td>
                  <td>
                    <select 
                      defaultValue=""
                      onChange={(e) => handleAssign(incident._id, e.target.value)}
                      className="assign-select"
                      disabled={incident.status === 'resolved'}
                    >
                      <option value="" disabled>Assign Officer...</option>
                      {officers.map(off => (
                        <option key={off._id} value={off._id}>
                          {off.name} ({off.assignedZone || 'No Zone'})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Incidents;
