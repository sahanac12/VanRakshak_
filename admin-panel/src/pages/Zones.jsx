import React from 'react';

const Zones = () => {
  const zones = ['North Sector', 'South Sector', 'Deep Forest', 'Buffer Zone'];

  return (
    <div className="zones-page">
      <h3>Forest Zones</h3>
      <div className="table-container">
        <table className="incident-table">
          <thead>
            <tr>
              <th>Zone Name</th>
              <th>Status</th>
              <th>Protection Level</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(zone => (
              <tr key={zone}>
                <td>{zone}</td>
                <td><span className="status-badge status-resolved">Active</span></td>
                <td>High</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Zones;
