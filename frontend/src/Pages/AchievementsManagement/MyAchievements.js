import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import Modal from 'react-modal';
import '../PostManagement/AllPostModern.css'; // Import the modern styling

Modal.setAppElement('#root'); // Important for accessibility

function MyAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const userId = localStorage.getItem('userID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        const userFilteredData = data.filter((achievement) => achievement.postOwnerID === userId);
        setProgressData(userFilteredData);
        setFilteredData(userFilteredData);
      })
      .catch((error) => console.error('Error fetching Achievements data:.', error));
  }, [userId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievement?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievement deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievement.');
        }
      } catch (error) {
        console.error('Error deleting Achievement:', error);
      }
    }
  };

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  return (
    <div className="modern-container">
      <NavBar />
      <div className="modern-content" style={{ marginTop: "60px" }}>
        {/* Add New Achievement floating button */}
        <div 
          className="floating-action-button" 
          onClick={() => (window.location.href = '/addAchievements')}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#6366f1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          <IoIosCreate style={{ color: 'white', fontSize: '24px' }} />
        </div>
        
        <div className="posts-grid">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>No achievements found</h3>
              <p>Create a new achievement to share your accomplishments</p>
              <button 
                className="primary-button" 
                style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)", color: "white" }}
                onClick={() => (window.location.href = '/addAchievements')}
              >
                Create New Achievement
              </button>
            </div>
          ) : (
            filteredData.map((achievement) => (
              <div key={achievement.id} className="post-card">
                <div className="post-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {achievement.postOwnerName?.charAt(0) || 'A'}
                    </div>
                    <div className="user-details">
                      <p className="username">{achievement.postOwnerName || 'Anonymous'}</p>
                      <p className="post-date">{achievement.date}</p>
                    </div>
                  </div>
                  
                  {achievement.postOwnerID === userId && (
                    <div className="post-actions">
                      <button className="icon-button edit" onClick={() => (window.location.href = `/updateAchievements/${achievement.id}`)}>
                        <FaEdit />
                      </button>
                      <button className="icon-button delete" onClick={() => handleDelete(achievement.id)}>
                        <RiDeleteBin6Fill />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="post-content">
                  <h3 className="post-title">{achievement.title}</h3>
                  <p className="post-description" style={{ whiteSpace: "pre-line" }}>{achievement.description}</p>
                  
                  {achievement.imageUrl && (
                    <div className="media-gallery single">
                      <div className="media-item" onClick={() => openModal(`http://localhost:8080/achievements/images/${achievement.imageUrl}`)}>
                        <img 
                          src={`http://localhost:8080/achievements/images/${achievement.imageUrl}`} 
                          alt="Achievement" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Modal for displaying full image */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-button" onClick={closeModal}>×</button>
        {selectedImage && (
          <img src={selectedImage} alt="Full Achievement" className="modal-media" />
        )}
      </Modal>
    </div>
  );
}

export default MyAchievements;
