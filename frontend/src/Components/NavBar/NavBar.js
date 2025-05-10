import React, { useEffect, useState } from 'react';
import { FaUserGraduate } from "react-icons/fa";
import { MdNotifications } from "react-icons/md";
import { MdNotificationsActive } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { RiHome5Line, RiHome5Fill } from "react-icons/ri";
import { BiBook, BiSolidBook } from "react-icons/bi";
import { IoTrophyOutline, IoTrophy } from "react-icons/io5";
import axios from 'axios';
import './NavBar.css';
import Pro from './img/img.png';
import { fetchUserDetails } from '../../Pages/UserManagement/UserProfile';

function NavBar() {
    const [allRead, setAllRead] = useState(true);
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const userId = localStorage.getItem('userID');
    let lastScrollY = window.scrollY;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
                const unreadNotifications = response.data.some(notification => !notification.read);
                setAllRead(!unreadNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    useEffect(() => {
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

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setIsVisible(false); // Hide navbar on scroll down
            } else {
                setIsVisible(true); // Show navbar on scroll up
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currentPath = window.location.pathname;

    const navigateTo = (path) => {
        window.location.href = path;
        setMobileMenuOpen(false);
    };

    return (
        <header className={`sleek-navbar ${isVisible ? 'visible' : 'hidden'}`}>
            <div className="sleek-container">
                <div className="sleek-brand" onClick={() => navigateTo('/allPost')}>
                    <svg className="brand-icon" viewBox="0 0 36 36">
                        <path d="M18,0 C27.9411,0 36,8.0589 36,18 C36,27.9411 27.9411,36 18,36 C8.0589,36 0,27.9411 0,18 C0,8.0589 8.0589,0 18,0 Z" fill="url(#gradient)" />
                        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold">F</text>
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#a18cd1" />
                                <stop offset="100%" stopColor="#fbc2eb" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="brand-name">Flavora</span>
                </div>
                
                <nav className={`sleek-nav ${mobileMenuOpen ? 'open' : ''}`}>
                    <ul className="sleek-menu">
                        <li className={`sleek-item ${currentPath === '/allPost' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allPost')}>
                            {currentPath === '/allPost' ? 
                                <RiHome5Fill className="sleek-icon" /> : 
                                <RiHome5Line className="sleek-icon" />}
                            <span>Skill Post</span>
                        </li>
                        <li className={`sleek-item ${currentPath === '/allLearningPlan' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allLearningPlan')}>
                            {currentPath === '/allLearningPlan' ? 
                                <BiSolidBook className="sleek-icon" /> : 
                                <BiBook className="sleek-icon" />}
                            <span>Learning Plan</span>
                        </li>
                        <li className={`sleek-item ${currentPath === '/allAchievements' ? 'active' : ''}`}
                            onClick={() => navigateTo('/allAchievements')}>
                            {currentPath === '/allAchievements' ? 
                                <IoTrophy className="sleek-icon" /> : 
                                <IoTrophyOutline className="sleek-icon" />}
                            <span>Achievements</span>
                        </li>
                    </ul>
                </nav>
                
                <div className="sleek-right">
                    {/* Notifications */}
                    <div className="sleek-action">
                        {allRead ? (
                            <MdNotifications 
                                className={`sleek-icon-btn ${currentPath === '/notifications' ? 'active' : ''}`}
                                onClick={() => navigateTo('/notifications')} 
                            />
                        ) : (
                            <span className="notification-dot">
                                <MdNotificationsActive 
                                    className="sleek-icon-btn active-notification" 
                                    onClick={() => navigateTo('/notifications')} 
                                />
                            </span>
                        )}
                    </div>
                    
                    {/* Logout */}
                    <div className="sleek-action">
                        <IoLogOut 
                            className="sleek-icon-btn logout" 
                            onClick={() => {
                                localStorage.clear();
                                navigateTo('/');
                            }} 
                        />
                    </div>
                    
                    {/* User Profile */}
                    <div className="sleek-profile" 
                        onClick={() => navigateTo(googleProfileImage ? '/googalUserPro' : '/userProfile')}>
                        {googleProfileImage ? (
                            <img 
                                src={googleProfileImage} 
                                alt="User" 
                                className="sleek-avatar"
                                onError={(e) => { e.target.onerror = null; e.target.src = Pro; }}
                            />
                        ) : userProfileImage ? (
                            <img 
                                src={userProfileImage} 
                                alt="User" 
                                className="sleek-avatar"
                                onError={(e) => { e.target.onerror = null; e.target.src = Pro; }}
                            />
                        ) : (
                            <div className="sleek-avatar-placeholder">
                                <FaUserGraduate />
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Mobile Toggle Button */}
                <button 
                    className="sleek-toggle" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? 
                        <HiOutlineX className="sleek-toggle-icon" /> : 
                        <HiOutlineMenu className="sleek-toggle-icon" />
                    }
                </button>
            </div>
        </header>
    );
}

export default NavBar;
