import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaTrash, FaBookOpen, FaLightbulb, FaTrophy } from 'react-icons/fa';
import './UserProfile.css'
import Pro from './img/img.png';
import NavBar from '../../Components/NavBar/NavBar';


// Function to fetch user details from backend
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

function GoogalUserPro() {
     // State variables
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userID');
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Check if user is logged in
        const userId = localStorage.getItem('userID');
        if (userId) {
            setLoading(true);
            fetchUserDetails(userId)
                .then((data) => setUserData(data))
                .finally(() => setLoading(false));
        }
    }, []);
    
    useEffect(() => {
        // Check if user is logged in and fetch profile image
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        if (storedUserType === 'google') {
            const googleImage = localStorage.getItem('googleProfileImage');
            setGoogleProfileImage(googleImage);
        } else if (userId) {
            fetchUserDetails(userId).then((data) => {
                if (data && data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8080/uploads/profile/${data.profilePicturePath}`);
                }
            });
        }
    }, [userId]);
    
    const handleDelete = () => {
        // Confirm deletion and delete user profile
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

    if (loading) { // Show loading spinner while fetching data
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

    return ( // Render user profile and dashboard
        <div className="page-container">
            <NavBar />
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Google Profile</h1>
                    <p className="subtitle">View and manage your Google account information</p>
                </div>
                
                {userData && userData.id === localStorage.getItem('userID') && (
                    <div className="profile-card">
                        <div className="profile-card-content">
                            <div className="profile-image-container">
                                {googleProfileImage ? (
                                    <img
                                        src={googleProfileImage}
                                        alt="Profile"
                                        className="profile-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = Pro;
                                        }}
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
                                </div>
                                
                                <div className="profile-actions">
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

export default GoogalUserPro;
