import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './notification.css';
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { MdOutlineMarkChatRead } from "react-icons/md";
import { IoNotificationsOutline } from "react-icons/io5";

// NotificationsPage component to manage and display notifications

function NotificationsPage() {
  // State to store notifications
  const [notifications, setNotifications] = useState([]);
  // State to show loading status
  const [loading, setLoading] = useState(true);
  // Get user ID from local storage
  const userId = localStorage.getItem('userID');  // Assuming userID is stored in local storage

  useEffect(() => {
    // Function to fetch notifications from the backend
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
        console.log('API Response:', response.data); // Debugging log
        setNotifications(response.data); // Set notifications into state
      } catch (error) {
        console.error('Error fetching notifications:', error);

      } finally {
        setLoading(false); // Always stop loading after the API call
      }
    };

    if (userId) {
      fetchNotifications();
    } else {
      console.error('User ID is not available');
      setLoading(false);
    }
  }, [userId]); // Dependency array includes userId

  // Function to mark a notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/notifications/${id}/markAsRead`);
      // Update the specific notification's 'read' status in the state
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error('Error marking notification as read:', error);    
    }
  };

  // Function to delete a notification
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/notifications/${id}`);
      // Remove the deleted notification from the state
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="notifications-page">
      {/* Navigation bar at the top */}
      <NavBar />
      <div className="notifications-container">
        {/* Header section */}
        <div className="notifications-header">
          <div className="header-content">
            <IoNotificationsOutline className="header-icon" />
            <h1>Notifications</h1>
          </div>
          {/* Display number of notifications */}
          <div className="notification-count">
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </div>
        </div>
        
        {/* Content section */}
        {loading ? (
          // Show loader while fetching notifications
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          // Show empty state if no notifications
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No notifications yet</h3>
            <p>When you get notifications, they'll show up here</p>
          </div>
        ) : (
          // List of notifications
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-card ${notification.read ? 'read' : 'unread'}`}
              >
                {/* Unread indicator */}
                {!notification.read && <div className="unread-indicator"></div>}
                
                {/* Notification content */}
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                
                {/* Action buttons */}
                <div className="notification-actions">
                  {/* Mark as read button */}
                  {!notification.read && (
                    <button 
                      className="action-button read-button" 
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <MdOutlineMarkChatRead />
                    </button>
                  )}
                  {/* Delete button */}
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
