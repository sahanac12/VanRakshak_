import React, { useState, useEffect } from 'react';
import api from '../api/api';

const Officers = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const res = await api.get('/users/officers');
        setOfficers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  if (loading) return <div>Loading Officers...</div>;

  return (
    <div className="officers-page">
      <h3>Forest Officers</h3>
      <div className="table-container">
        <table className="incident-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Assigned Zone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {officers.map(off => (
              <tr key={off._id}>
                <td>{off.name}</td>
                <td>{off.email}</td>
                <td>{off.assignedZone || 'Not Assigned'}</td>
                <td><span className="status-badge status-resolved">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Officers;
