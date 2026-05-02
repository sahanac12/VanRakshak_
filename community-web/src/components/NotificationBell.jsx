import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-wrapper">
      <button className="bell-btn" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Updates</h3>
            {unreadCount > 0 && <button onClick={markAllAsRead}>Clear</button>}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty-msg">No updates yet</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`notification-item ${n.read ? 'read' : 'unread'}`}
                  onClick={() => markAsRead(n._id)}
                >
                  <div className="n-content">
                    <p className="n-title">{n.title}</p>
                    <p className="n-body">{n.body}</p>
                    <span className="n-time">{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
