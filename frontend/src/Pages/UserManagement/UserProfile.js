import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaUserEdit, FaTrash, FaBookOpen, FaLightbulb, FaTrophy } from 'react-icons/fa';
import './UserProfile.css'
import NavBar from '../../Components/NavBar/NavBar';

export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            setLoading(true);
            fetchUserDetails(userId)
                .then((data) => setUserData(data))
                .finally(() => setLoading(false));
        }
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            const userId = localStorage.getItem('userID');
            fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile.");
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <NavBar />
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading profile information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <NavBar />
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <p className="subtitle">View and manage your personal information</p>
                </div>
                
                {userData && userData.id === localStorage.getItem('userID') && (
                    <div className="profile-card">
                        <div className="profile-card-content">
                            <div className="profile-image-container">
                                {userData.profilePicturePath ? (
                                    <img
                                        src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        {userData.fullname ? userData.fullname.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                            </div>
                            
                            <div className="profile-info">
                                <h2 className="profile-name">{userData.fullname}</h2>
                                <p className="profile-bio">{userData.bio || "No bio available"}</p>
                                
                                <div className="profile-details">
                                    <div className="detail-item">
                                        <FaEnvelope className="detail-icon" />
                                        <span>{userData.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaPhone className="detail-icon" />
                                        <span>{userData.phone || "Not provided"}</span>
                                    </div>
                                    <div className="detail-item">
                                        <FaTools className="detail-icon" />
                                        <span>{userData.skills?.length > 0 ? userData.skills.join(', ') : "No skills listed"}</span>
                                    </div>
                                </div>
                                
                                <div className="profile-actions">
                                    <button 
                                        onClick={() => navigate(`/updateUserProfile/${userData.id}`)} 
                                        className="btn-update"
                                    >
                                        <FaUserEdit /> Update Profile
                                    </button>
                                    <button 
                                        onClick={handleDelete} 
                                        className="btn-delete"
                                    >
                                        <FaTrash /> Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="user-sections">
                    <h2>My Dashboard</h2>
                    <div className="section-cards">
                        <div className="section-card" onClick={() => navigate('/myLearningPlan')}>
                            <div className="card-icon">
                                <FaBookOpen />
                            </div>
                            <div className="card-content">
                                <h3>Learning Plan</h3>
                                <p>View and manage your learning journey</p>
                            </div>
                        </div>
                        
                        <div className="section-card" onClick={() => navigate('/myAllPost')}>
                            <div className="card-icon">
                                <FaLightbulb />
                            </div>
                            <div className="card-content">
                                <h3>Skill Posts</h3>
                                <p>Browse your shared skills and knowledge</p>
                            </div>
                        </div>
                        
                        <div className="section-card" onClick={() => navigate('/myAchievements')}>
                            <div className="card-icon">
                                <FaTrophy />
                            </div>
                            <div className="card-content">
                                <h3>Achievements</h3>
                                <p>Celebrate your milestones and successes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
