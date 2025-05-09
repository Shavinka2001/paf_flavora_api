import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar'
import { IoIosCreate } from "react-icons/io";
import Modal from 'react-modal';
import '../PostManagement/AllPostModern.css'; // Import the modern styling

Modal.setAppElement('#root'); // Important for accessibility

function AllAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching Achievements data:...', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter achievements based on title or description
    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

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
      <div className="modern-content">
        <div className="search-container" style={{ marginTop: "-110px" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search achievements by title or description"
            value={searchQuery}
            onChange={handleSearch}
          />
          <button 
            className="create-button" 
            style={{ background: "linear-gradient(45deg, #a18cd1 0%, #fbc2eb 100%)" }}
            onClick={() => (window.location.href = '/addAchievements')}
          >
            <IoIosCreate className="create-icon" />
            <span>Create</span>
          </button>
        </div>
        
        <div className="posts-grid">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"></div>
              <h3>No achievements found</h3>
              <p>Create a new achievement to share with the community</p>
              <button 
                className="primary-button" 
                style={{ background: "linear-gradient(45deg, #a18cd1 0%, #fbc2eb 100%)", color: "white" }}
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

export default AllAchievements;
