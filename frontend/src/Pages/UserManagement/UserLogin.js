import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './user.css'
import GoogalLogo from './img/glogo.png'

// Function to fetch user details from backend
function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isAnimated, setIsAnimated] = useState(false);
  const navigate = useNavigate();
// const userId = localStorage.getItem('userID');
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('userID', data.id); // Save user ID in local storage
        alert('Login successful!');
        navigate('/allPost');
      } else if (response.status === 401) {
        alert('Invalid credentials!');
      } else {
        alert('Failed to login!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="modern-container">
      <div className="background-shapes">
        <div className="bg-shape shape-circle"></div>
        <div className="bg-shape shape-donut"></div>
        <div className="bg-shape shape-square"></div>
      </div>
      
      <div className={`glass-card ${isAnimated ? 'fade-in' : ''}`}>
        <div className="card-left">
          <div className="brand-section">
            <div className="logo-container">
              <div className="logo-icon">F</div>
            </div>
            <h2 className="brand-name">Flavora</h2>
          </div>
          <div 
            className="welcome-image"
            style={{
              background: "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80') no-repeat center",
              backgroundSize: "cover"
            }}
          ></div>
          <div className="welcome-text">
            <h3>Welcome Back</h3>
            <p>Share recipes, tips, and culinary inspirations</p>
          </div>
        </div>
        
        <div className="card-right">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Please sign in to continue to Flavora</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <i className="input-icon email-icon">✉️</i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="modern-input"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="password-label-group">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-link">Forgot?</a>
              </div>
              <div className="input-container">
                <i className="input-icon password-icon">🔒</i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="modern-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="signin-button">
                Sign In
              </button>
              
              <div className="separator">
                <span>OR</span>
              </div>
              
              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                className="google-button"
              >
                <img src={GoogalLogo} alt='Google' />
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
          
          <div className="signup-prompt">
            <span>New to Flavora?</span>
            <button 
              className="signup-link"
              onClick={() => (window.location.href = '/register')}
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
