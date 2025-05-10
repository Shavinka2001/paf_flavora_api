import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css'
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { MdOutlineMarkChatRead } from "react-icons/md";
import { IoNotificationsOutline } from "react-icons/io5";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        console.log('API Response:', response.data); // Debugging log
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNotifications();
    } else {
      console.error('User ID is not available');
      setLoading(false);
    }
  }, [userId]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="notifications-page">
      <NavBar />
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-content">
            <IoNotificationsOutline className="header-icon" />
            <h1>Notifications</h1>
          </div>
          <div className="notification-count">
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </div>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No notifications yet</h3>
            <p>When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              >
                {!notification.read && <div className="unread-indicator"></div>}
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button 
                      className="action-button read-button" 
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <MdOutlineMarkChatRead />
                    </button>
                  )}
                  <button 
                    className="action-button delete-button" 
                    onClick={() => handleDelete(notification.id)}
                    title="Delete notification"
                  >
                    <RiDeleteBin6Fill />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
